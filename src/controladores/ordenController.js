const db = require('../db');

const ordenController = {};

ordenController.crearOrden = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { id_cotizacion, fecha_emision, estado_OC, monto_total_OC, observaciones, detalles } = req.body;

        // 1. Cantidad de ítems 
        const cantidad_items = detalles.length;

        // 2. Total de unidades 
        const total_unidades = detalles.reduce((suma, item) => suma + parseFloat(item.cantidad), 0);

        // --- PASO 1: INSERTAR CABECERA (ORDEN_COMPRA) ---
        const sqlOrden = `
            INSERT INTO ORDEN_COMPRA 
            (id_cotizacion, fecha_emision, estado_OC, monto_total_OC, cantidad_items, total_unidades) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.query(sqlOrden, [
            id_cotizacion,
            fecha_emision,
            estado_OC,
            monto_total_OC,
            cantidad_items,
            total_unidades
        ]);

        const id_OC = result.insertId;

        // --- PASO 2: INSERTAR DETALLES ---
        const sqlDetalle = `
            INSERT INTO DETALLE_ORDEN_COMPRA (id_oc, id_producto, cantidad, precio_unitario) 
            VALUES ?
        `;

        const datosDetalles = detalles.map(d => [
            id_OC,
            d.id_producto,
            d.cantidad,
            d.precio_unitario
        ]);

        await connection.query(sqlDetalle, [datosDetalles]);

        const sqlUpdateReq = `
            UPDATE REQUISICION 
            SET estado = 'En Proceso' 
            WHERE id_requisicion = (
            SELECT id_requisicion FROM COTIZACION WHERE id_cotizacion = ?
            )
        `;

        await connection.query(sqlUpdateReq, [id_cotizacion]);

        await connection.commit();
        res.json({ mensaje: `¡Orden de Compra N° ${id_OC} generada exitosamente!` });

    } catch (error) {
        await connection.rollback();
        console.error("Error en crearOrden:", error);
        res.status(500).json({ mensaje: "Error al guardar la orden: " + error.message });
    } finally {
        connection.release();
    }
};

ordenController.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Cabecera (Sin JOIN de proveedor para evitar errores si es null)
        const sqlCabecera = "SELECT * FROM ORDEN_COMPRA WHERE id_OC = ?";
        const [cabeceras] = await db.query(sqlCabecera, [id]);

        if (cabeceras.length === 0) return res.status(404).json({ mensaje: "Orden no encontrada" });

        // 2. Detalles (Traemos nombre del producto para mostrar en tabla)
        const sqlDetalles = `
            SELECT doc.*, p.nombre_producto, p.unidad_medida
            FROM DETALLE_ORDEN_COMPRA doc
            JOIN PRODUCTO p ON doc.id_producto = p.id_producto
            WHERE doc.id_oc = ?
        `;
        const [detalles] = await db.query(sqlDetalles, [id]);

        const respuesta = cabeceras[0];
        respuesta.detalles = detalles;

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al buscar la orden" });
    }
};

// 1. LISTAR TODAS LAS ÓRDENES (READ)
ordenController.listar = async (req, res) => {
    try {
        const sql = "SELECT * FROM ORDEN_COMPRA ORDER BY id_OC DESC";
        const [ordenes] = await db.query(sql);
        res.json(ordenes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener el listado" });
    }
};

// 2. ANULAR ORDEN (DELETE LÓGICO / UPDATE)
ordenController.anular = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "UPDATE ORDEN_COMPRA SET estado_OC = 'Anulada' WHERE id_OC = ?";
        await db.query(sql, [id]);
        res.json({ mensaje: `Orden N° ${id} anulada correctamente.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al anular la orden" });
    }
};

module.exports = ordenController;