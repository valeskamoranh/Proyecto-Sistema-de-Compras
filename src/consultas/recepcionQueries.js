const db = require('../config/db');

const recepcionQueries = {
    insertarCabecera: async (recepcion, executor = db) => {
        const sql = `
            INSERT INTO RECEPCION (id_OC, fecha_recepcion, estado_recepcion, observaciones) 
            VALUES (?, ?, ?, ?)
        `;
        return await executor.query(sql, [
            recepcion.id_oc,
            recepcion.fecha_recepcion,
            recepcion.estado_recepcion,
            recepcion.observaciones
        ]);
    },

    insertarDetalles: async (datosDetalles, executor = db) => {
        const sql = `
            INSERT INTO DETALLE_RECEPCION (id_recepcion, id_producto, cantidad_recibida) 
            VALUES ?
        `;
        return await executor.query(sql, [datosDetalles]);
    },

    actualizarEstadoOC: async (id_OC, nuevoEstado, executor = db) => {
        const sql = "UPDATE ORDEN_COMPRA SET estado_OC = ? WHERE id_OC = ?";
        return await executor.query(sql, [nuevoEstado, id_OC]);
    },

    actualizarEstadoRequisicionFinal: async (id_OC, executor = db) => {
        const sql = `
            UPDATE REQUISICION 
            SET estado = 'Atendida' 
            WHERE id_requisicion = (
                SELECT c.id_requisicion 
                FROM ORDEN_COMPRA oc
                JOIN COTIZACION c ON oc.id_cotizacion = c.id_cotizacion
                WHERE oc.id_OC = ?
            )
        `;
        return await executor.query(sql, [id_OC]);
    },

    obtenerTodas: async () => {
        const sql = `
            SELECT r.*, (SELECT COUNT(*) FROM DETALLE_RECEPCION d WHERE d.id_recepcion = r.id_recepcion) as cantidad_items
            FROM RECEPCION r ORDER BY r.id_recepcion DESC
        `;
        return await db.query(sql);
    },

    obtenerPorId: async (id) => {
        const sql = "SELECT * FROM RECEPCION WHERE id_recepcion = ?";
        return await db.query(sql, [id]);
    },

    obtenerDetallesPorId: async (id) => {
        const sql = `
            SELECT dr.*, p.nombre_producto, p.unidad_medida
            FROM DETALLE_RECEPCION dr
            JOIN PRODUCTO p ON dr.id_producto = p.id_producto
            WHERE dr.id_recepcion = ?
        `;
        return await db.query(sql, [id]);
    },

    eliminarFisico: async (id, executor = db) => {
        const sqlDetalle = "DELETE FROM DETALLE_RECEPCION WHERE id_recepcion = ?";
        const sqlCabecera = "DELETE FROM RECEPCION WHERE id_recepcion = ?";

        await executor.query(sqlDetalle, [id]);
        return await executor.query(sqlCabecera, [id]);
    },

    // OBTENER PARA INVENTARIO
    obtenerParaInventario: async () => {
        const sql = `
            SELECT r.id_recepcion, p.nombre_producto, r.fecha_recepcion, dr.cantidad_recibida
            FROM RECEPCION r
            JOIN DETALLE_RECEPCION dr ON r.id_recepcion = dr.id_recepcion
            JOIN PRODUCTO p ON dr.id_producto = p.id_producto
            WHERE r.estado_recepcion = 'Completa'
            ORDER BY r.fecha_recepcion DESC
        `;
        return await db.query(sql);
    }
};

module.exports = recepcionQueries;