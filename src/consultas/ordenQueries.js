const db = require('../config/db');

const ordenQueries = {
    insertarCabecera: async (orden, executor = db) => {
        const sql = `
            INSERT INTO ORDEN_COMPRA 
            (id_cotizacion, fecha_emision, estado_OC, monto_total_OC, cantidad_items, total_unidades) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        return await executor.query(sql, [
            orden.id_cotizacion,
            orden.fecha_emision,
            orden.estado_OC,
            orden.monto_total_OC,
            orden.cantidad_items,
            orden.total_unidades
        ]);
    },

    insertarDetalles: async (datosDetalles, executor = db) => {
        const sql = `
            INSERT INTO DETALLE_ORDEN_COMPRA (id_oc, id_producto, cantidad, precio_unitario) 
            VALUES ?
        `;
        return await executor.query(sql, [datosDetalles]);
    },

    confirmarOrdenEnProceso: async (id_cotizacion, executor = db) => {
        const sql = `
            UPDATE REQUISICION 
            SET estado = 'En Proceso' 
            WHERE id_requisicion = (
                SELECT id_requisicion FROM COTIZACION WHERE id_cotizacion = ?
            )
        `;
        return await executor.query(sql, [id_cotizacion]);
    },

    obtenerPorId: async (id) => {
        const sql = "SELECT * FROM ORDEN_COMPRA WHERE id_OC = ?";
        return await db.query(sql, [id]);
    },

    obtenerDetallesPorId: async (id) => {
        const sql = `
            SELECT doc.*, p.nombre_producto, p.unidad_medida
            FROM DETALLE_ORDEN_COMPRA doc
            JOIN PRODUCTO p ON doc.id_producto = p.id_producto
            WHERE doc.id_oc = ?
        `;
        return await db.query(sql, [id]);
    },

    cambiarEstado: async (id, nuevoEstado) => {
        const sql = "UPDATE ORDEN_COMPRA SET estado_OC = ? WHERE id_OC = ?";
        return await db.query(sql, [nuevoEstado, id]);
    },

    restaurarEstadoRequisicion: async (id_OC, executor = db) => {
        const sql = `
            UPDATE REQUISICION 
            SET estado = 'Aprobada' 
            WHERE id_requisicion = (
                SELECT c.id_requisicion 
                FROM ORDEN_COMPRA oc
                JOIN COTIZACION c ON oc.id_cotizacion = c.id_cotizacion
                WHERE oc.id_OC = ?
            )
        `;
        return await executor.query(sql, [id_OC]);
    },

    //Simulacion Contabilidad
    obtenerResumenContabilidad: async () => {
        const sql = `
            SELECT 
                oc.id_OC, 
                p.nombre AS nombre_proveedor, 
                oc.fecha_emision, 
                oc.estado_OC,
                SUM(dc.cantidad * dc.precio_unitario) as monto_total
            FROM ORDEN_COMPRA oc
            JOIN COTIZACION c ON oc.id_cotizacion = c.id_cotizacion
            JOIN PROVEEDOR p ON c.id_proveedor = p.id_proveedor
            JOIN DETALLE_COTIZACION dc ON c.id_cotizacion = dc.id_cotizacion
            WHERE oc.estado_OC != 'Anulada'
            GROUP BY oc.id_OC, p.nombre, oc.fecha_emision, oc.estado_OC
            ORDER BY oc.fecha_emision DESC
        `;
        return await db.query(sql);
    },

    // En tu archivo de consultas de órdenes
    listarConFiltro: async (fechaInicio, fechaFin) => {
        let sql = `
        SELECT oc.*, 
               (SELECT COUNT(*) FROM DETALLE_ORDEN_COMPRA d WHERE d.id_OC = oc.id_OC) as cantidad_items
        FROM ORDEN_COMPRA oc
    `;

        const params = [];

        if (fechaInicio && fechaFin && fechaInicio.trim() !== "" && fechaFin.trim() !== "") {
            sql += " WHERE oc.fecha_emision BETWEEN ? AND ? ";
            params.push(fechaInicio, fechaFin);
        }

        sql += " ORDER BY oc.id_OC DESC";

        return await db.query(sql, params);
    },

    obtenerDatosReporteAvanzado: async (inicio, fin, busqueda) => {
        let sql = `
        SELECT oc.*, p.nombre AS nombre_proveedor
        FROM ORDEN_COMPRA oc
        JOIN COTIZACION c ON oc.id_cotizacion = c.id_cotizacion
        JOIN PROVEEDOR p ON c.id_proveedor = p.id_proveedor
        WHERE 1=1
    `;
        const params = [];

        if (inicio && fin && inicio !== "" && fin !== "") {
            sql += " AND oc.fecha_emision BETWEEN ? AND ? ";
            params.push(inicio, fin);
        }

        if (busqueda && busqueda.trim() !== "") {
            sql += " AND (oc.id_OC LIKE ? OR p.nombre LIKE ? OR oc.estado_OC LIKE ?) ";
            const term = `%${busqueda}%`;
            params.push(term, term, term);
        }

        sql += " ORDER BY oc.fecha_emision DESC";
        return await db.query(sql, params);
    }
};

module.exports = ordenQueries;