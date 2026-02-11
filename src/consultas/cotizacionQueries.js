const db = require('../config/db');

const cotizacionQueries = {

    // INSERTAR CABECERA
    insertarCabecera: async (objCotizacion, executor = db) => {
        const sql = `
            INSERT INTO COTIZACION 
            (id_requisicion, id_proveedor, fecha_cotizacion, validez, monto_total) 
            VALUES (?, ?, ?, ?, ?)
        `;
        return await executor.query(sql, [
            objCotizacion.id_requisicion,
            objCotizacion.id_proveedor,
            objCotizacion.fecha_cotizacion,
            objCotizacion.validez,
            objCotizacion.monto_total
        ]);
    },

    // INSERTAR DETALLES
    insertarDetalles: async (datosDetalles, executor = db) => {
        const sql = `
            INSERT INTO DETALLE_COTIZACION 
            (id_cotizacion, id_producto, cantidad, precio_unitario) 
            VALUES ?
        `;
        return await executor.query(sql, [datosDetalles]);
    },

    // LISTAR TODAS
    listarTodas: async () => {
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
        return await db.query(sql);
    },

    // OBTENER CABECERA
    obtenerPorId: async (id) => {
        const sql = `
            SELECT c.*, p.nombre AS nombre_proveedor
            FROM COTIZACION c
            LEFT JOIN PROVEEDOR p ON c.id_proveedor = p.id_proveedor
            WHERE c.id_cotizacion = ?
        `;
        return await db.query(sql, [id]);
    },

    // OBTENER DETALLES 
    obtenerDetalles: async (idCotizacion) => {
        const sql = `
            SELECT dc.*, prod.nombre_producto, prod.unidad_medida
            FROM DETALLE_COTIZACION dc
            JOIN PRODUCTO prod ON dc.id_producto = prod.id_producto
            WHERE dc.id_cotizacion = ?
        `;
        return await db.query(sql, [idCotizacion]);
    },

    // ELIMINAR 
    eliminarDetalles: async (idCotizacion, executor = db) => {
        const sql = "DELETE FROM DETALLE_COTIZACION WHERE id_cotizacion = ?";
        return await executor.query(sql, [idCotizacion]);
    },

    eliminarCabecera: async (idCotizacion) => {
        const sql = "DELETE FROM COTIZACION WHERE id_cotizacion = ?";
        return await db.query(sql, [idCotizacion]);
    },

    // ACTUALIZAR CABECERA
    actualizarCabecera: async (id, id_proveedor, fecha, validez, monto, executor = db) => {
        const sql = `
            UPDATE COTIZACION 
            SET id_proveedor = ?, fecha_cotizacion = ?, validez = ?, monto_total = ? 
            WHERE id_cotizacion = ?
        `;
        return await executor.query(sql, [id_proveedor, fecha, validez, monto, id]);
    },

    // VERIFICAR ESTADO 
    obtenerEstadoRequisicion: async (idCotizacion) => {
        const sql = `
            SELECT r.estado 
            FROM COTIZACION c
            JOIN REQUISICION r ON c.id_requisicion = r.id_requisicion
            WHERE c.id_cotizacion = ?
        `;
        return await db.query(sql, [idCotizacion]);
    },

    verificarUsoEnOrden: async (id_cotizacion) => {
        const sql = "SELECT COUNT(*) AS total FROM ORDEN_COMPRA WHERE id_cotizacion = ?";
        return await db.query(sql, [id_cotizacion]);
    },
};

module.exports = cotizacionQueries;