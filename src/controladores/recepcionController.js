const db = require('../db');

const recepcionController = {};

recepcionController.crearRecepcion = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Recibimos datos 
        const { id_OC, fecha_recepcion, estado_recepcion, observaciones, detalles } = req.body;

        // 2. INSERTAR CABECERA
        const sqlHeader = `
            INSERT INTO RECEPCION
            (id_OC, fecha_recepcion, estado_recepcion, observaciones) 
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await connection.query(sqlHeader, [
            id_OC, fecha_recepcion, estado_recepcion, observaciones
        ]);

        const idRecepcion = result.insertId;

        // 3. INSERTAR DETALLES 
        const sqlDetalle = `
            INSERT INTO DETALLE_RECEPCION (id_recepcion, id_producto, cantidad_recibida) 
            VALUES ?
        `;

        const datosDetalles = detalles.map(d => [
            idRecepcion,
            d.id_producto,
            d.cantidad_recibida,
        ]);

        await connection.query(sqlDetalle, [datosDetalles]);

        // Actualizar Estado de la ORDEN DE COMPRA
        let nuevoEstadoOC = 'En Proceso';

        if (estado_recepcion === 'Completa') {
            nuevoEstadoOC = 'Entregada';
        } else if (estado_recepcion === 'Rechazada') {
            nuevoEstadoOC = 'En Proceso';
        } else if (estado_recepcion === 'Parcial') {
            nuevoEstadoOC = 'En Proceso';
        }

        const sqlUpdateOC = "UPDATE ORDEN_COMPRA SET estado_OC = ? WHERE id_OC = ?";
        await connection.query(sqlUpdateOC, [nuevoEstadoOC, id_OC]);


        if (estado_recepcion === 'Completa') {

            const sqlBuscarId = `
                SELECT c.id_requisicion 
                FROM ORDEN_COMPRA oc
                JOIN COTIZACION c ON oc.id_cotizacion = c.id_cotizacion
                WHERE oc.id_OC = ?
            `;

            const [resultados] = await connection.query(sqlBuscarId, [id_OC]);

            if (resultados.length > 0) {
                const id_req_encontrada = resultados[0].id_requisicion;
                const sqlUpdateDirecto = "UPDATE REQUISICION SET estado = 'Atendida' WHERE id_requisicion = ?";
                const [infoUpdate] = await connection.query(sqlUpdateDirecto, [id_req_encontrada]);

            } 
        }

        await connection.commit();
        res.json({ mensaje: `¡Recepción N° ${idRecepcion} registrada correctamente!` });

    } catch (error) {
        await connection.rollback();
        console.error("Error al guardar recepción:", error);
        res.status(500).json({ mensaje: "Error al guardar: " + error.message });
    } finally {
        connection.release();
    }
};

// 1. LISTAR 
recepcionController.listar = async (req, res) => {
    try {
        const sql = `
            SELECT 
                r.id_recepcion, 
                r.id_OC,
                r.fecha_recepcion, 
                r.observaciones, 
                r.estado_recepcion,
                (SELECT COUNT(*) FROM DETALLE_RECEPCION d WHERE d.id_recepcion = r.id_recepcion) as cantidad_items
            FROM RECEPCION r
            ORDER BY r.id_recepcion DESC
        `;
        const [recepciones] = await db.query(sql);
        res.json(recepciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al listar recepciones" });
    }
};

// 2. DETALLE (Para el Modal)
recepcionController.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // A. Cabecera
        const sqlCabecera = "SELECT * FROM RECEPCION WHERE id_recepcion = ?";
        const [cabeceras] = await db.query(sqlCabecera, [id]);

        if (cabeceras.length === 0) return res.status(404).json({ mensaje: "Recepción no encontrada" });

        // B. Detalles 
        const sqlDetalles = `
            SELECT dr.*, p.nombre_producto, p.unidad_medida
            FROM DETALLE_RECEPCION dr
            JOIN PRODUCTO p ON dr.id_producto = p.id_producto
            WHERE dr.id_recepcion = ?
        `;
        const [detalles] = await db.query(sqlDetalles, [id]);

        const respuesta = cabeceras[0];
        respuesta.detalles = detalles;

        res.json(respuesta);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener el detalle" });
    }
};

// 3. ELIMINAR (Borrado físico por si hubo error de dedo en la entrada)
recepcionController.eliminar = async (req, res) => {
    try {
        const { id } = req.params;

        // Primero borramos el detalle (integridad referencial)
        await db.query("DELETE FROM DETALLE_RECEPCION WHERE id_recepcion = ?", [id]);

        // Luego la cabecera
        await db.query("DELETE FROM RECEPCION WHERE id_recepcion = ?", [id]);

        res.json({ mensaje: "Recepción eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al eliminar la recepción" });
    }
};

module.exports = recepcionController;