const db = require('../db');

const cotizacionController = {};

cotizacionController.crearCotizacion = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { id_requisicion, id_proveedor, fecha_cotizacion, validez, monto_total, detalles } = req.body;

        // 1. VALIDAR OBLIGATORIOS BÁSICOS
        if (!id_requisicion || !id_proveedor || !monto_total) {
            throw new Error("Faltan datos obligatorios (Requisición, Proveedor o Monto)");
        }

        // 2. INSERTAR CABECERA 
        const sqlCabecera = `
            INSERT INTO COTIZACION 
            (id_requisicion, id_proveedor, fecha_cotizacion, validez, monto_total) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const [resultCabecera] = await connection.query(sqlCabecera, [
            id_requisicion,
            id_proveedor,
            fecha_cotizacion,
            validez,
            monto_total
        ]);

        const idCotizacion = resultCabecera.insertId;

        // 3. INSERTAR DETALLES 
        const sqlDetalle = `
            INSERT INTO DETALLE_COTIZACION 
            (id_cotizacion, id_producto, cantidad, precio_unitario) 
            VALUES ?
        `;

        const datosDetalles = detalles.map(item => [
            idCotizacion,
            item.id_producto,
            item.cantidad,
            item.precio_unitario
        ]);

        await connection.query(sqlDetalle, [datosDetalles]);

        await connection.commit();
        res.json({ mensaje: `¡Cotización N° ${idCotizacion} registrada exitosamente!` });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ mensaje: "Error al registrar la cotización: " + error.message });
    } finally {
        connection.release();
    }
};

// 1. LISTAR (Para la tabla principal)
cotizacionController.listar = async (req, res) => {
    try {
        const sql = `
            SELECT 
                c.id_cotizacion, 
                c.fecha_cotizacion, 
                c.validez, 
                c.monto_total,
                c.id_requisicion,
                p.nombre AS nombre_proveedor,
                (SELECT COUNT(*) FROM DETALLE_COTIZACION d WHERE d.id_cotizacion = c.id_cotizacion) as cantidad_items
            FROM COTIZACION c
            LEFT JOIN PROVEEDOR p ON c.id_proveedor = p.id_proveedor
            ORDER BY c.id_cotizacion DESC
        `;
        const [cotizaciones] = await db.query(sql);
        res.json(cotizaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al listar cotizaciones" });
    }
};

// 2. DETALLE (Para el Modal)
cotizacionController.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // A. Cabecera 
        const sqlCabecera = `
            SELECT c.*, p.nombre AS nombre_proveedor
            FROM COTIZACION c
            LEFT JOIN PROVEEDOR p ON c.id_proveedor = p.id_proveedor
            WHERE c.id_cotizacion = ?
        `;
        const [cabeceras] = await db.query(sqlCabecera, [id]);

        if (cabeceras.length === 0) return res.status(404).json({ mensaje: "Cotización no encontrada" });

        // B. Detalles 
        const sqlDetalles = `
            SELECT dc.*, prod.nombre_producto, prod.unidad_medida
            FROM DETALLE_COTIZACION dc
            JOIN PRODUCTO prod ON dc.id_producto = prod.id_producto
            WHERE dc.id_cotizacion = ?
        `;
        const [detalles] = await db.query(sqlDetalles, [id]);

        // C. Respuesta unificada
        const respuesta = cabeceras[0];
        respuesta.detalles = detalles;

        res.json(respuesta);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener el detalle" });
    }
};

// 3. ELIMINAR (Físico, ya que no hay estado 'Anulada')
cotizacionController.eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        // Primero borramos detalles por integridad referencial
        await db.query("DELETE FROM DETALLE_COTIZACION WHERE id_cotizacion = ?", [id]);
        // Luego la cabecera
        await db.query("DELETE FROM COTIZACION WHERE id_cotizacion = ?", [id]);

        res.json({ mensaje: "Cotización eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al eliminar cotización" });
    }
};

module.exports = cotizacionController;