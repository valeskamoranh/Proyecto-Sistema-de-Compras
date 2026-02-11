const db = require('../config/db');

const requisicionQueries = {
    verificarUsuario: async (id_usuario) => {
        const sql = "SELECT id_usuario FROM USUARIO WHERE id_usuario = ?";
        return await db.query(sql, [id_usuario]);
    },

    // CABECERA 
        insertarCabecera: async (objRequisicion, executor = db) => {
        const sql = "INSERT INTO REQUISICION (id_usuario, fecha, estado, justificacion) VALUES (?, ?, ?, ?)";
        return await executor.query(sql, [objRequisicion.id_usuario, objRequisicion.fecha, objRequisicion.estado, objRequisicion.justificacion]);
    },

    listarTodas: async () => {
        const sql = `
            SELECT r.*, u.nombre AS nombre_usuario,
            (SELECT COUNT(*) FROM DETALLE_REQUISICION d WHERE d.id_requisicion = r.id_requisicion) as cantidad_items
            FROM REQUISICION r
            LEFT JOIN USUARIO u ON r.id_usuario = u.id_usuario
            ORDER BY r.id_requisicion DESC`;
        return await db.query(sql);
    },

    obtenerPorId: async (id) => {
        const sql = "SELECT r.*, u.nombre as nombre_usuario FROM REQUISICION r LEFT JOIN USUARIO u ON r.id_usuario = u.id_usuario WHERE r.id_requisicion = ?";
        return await db.query(sql, [id]);
    },

    actualizarCabecera: async (id, fecha, justificacion, estado, executor = db) => {
        const sql = "UPDATE REQUISICION SET justificacion = ?, fecha = ?, estado = ? WHERE id_requisicion = ?";
        return await executor.query(sql, [justificacion, fecha, estado, id]);
    },

    actualizarEstado: async (id, nuevoEstado) => {
        const sql = "UPDATE REQUISICION SET estado = ? WHERE id_requisicion = ?";
        return await db.query(sql, [nuevoEstado, id]);
    },

    // DETALLE 

    insertarDetalles: async (datosDetalles, executor = db) => {
        const sql = "INSERT INTO DETALLE_REQUISICION (id_requisicion, id_producto, cantidad, unidad_medida) VALUES ?";
        return await executor.query(sql, [datosDetalles]);
    },

    obtenerDetalles: async (idRequisicion) => {
        const sql = `
            SELECT d.*, p.nombre_producto 
            FROM DETALLE_REQUISICION d
            JOIN PRODUCTO p ON d.id_producto = p.id_producto
            WHERE d.id_requisicion = ?`;
        return await db.query(sql, [idRequisicion]);
    },

    eliminarDetalles: async (idRequisicion, executor = db) => {
        const sql = "DELETE FROM DETALLE_REQUISICION WHERE id_requisicion = ?";
        return await executor.query(sql, [idRequisicion]);
    }

};

module.exports = requisicionQueries;