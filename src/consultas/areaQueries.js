const db = require('../config/db');

const areaQueries = {
    // Consulta para insertar (CREATE)
    insertar: async (areaObj) => {
        const sql = 'INSERT INTO AREA (nombre_area, responsable) VALUES (?, ?)';
        return await db.query(sql, [areaObj.nombre_area, areaObj.responsable]);
    },

    // Consulta para listar (READ)
    obtenerTodas: async () => {
        const sql = "SELECT * FROM AREA ORDER BY id_area ASC";
        return await db.query(sql);
    },

    // Consulta para actualizar (UPDATE)
    actualizar: async (areaObj) => {
        const sql = "UPDATE AREA SET nombre_area = ?, responsable = ? WHERE id_area = ?";
        return await db.query(sql, [areaObj.nombre_area, areaObj.responsable, areaObj.id_area]);
    },

    // Consulta para eliminar (DELETE)
    eliminar: async (id) => {
        const sql = "DELETE FROM AREA WHERE id_area = ?";
        return await db.query(sql, [id]);
    }
};

module.exports = areaQueries;