const db = require('../config/db');

const usuarioQueries = {
    // INSERTAR
    insertar: async (userObj) => {
        const sql = `
            INSERT INTO USUARIO 
            (id_usuario, nombre, email, cargo, id_area) 
            VALUES (?, ?, ?, ?, ?)
        `;
        return await db.query(sql, [userObj.id_usuario, userObj.nombre, userObj.email, userObj.cargo, userObj.id_area]);
    },

    // LISTAR 
    obtenerTodos: async () => {
        const sql = `
            SELECT u.*, a.nombre_area 
            FROM USUARIO u 
            LEFT JOIN AREA a ON u.id_area = a.id_area
        `;
        return await db.query(sql);
    },

    // ACTUALIZAR
    actualizar: async (userObj) => {
        const sql = "UPDATE USUARIO SET id_area=?, nombre=?, cargo=?, email=? WHERE id_usuario=?";
        return await db.query(sql, [userObj.id_area, userObj.nombre, userObj.cargo, userObj.email, userObj.id_usuario]);
    },

    // ELIMINAR
    eliminar: async (id) => {
        const sql = "DELETE FROM USUARIO WHERE id_usuario = ?";
        return await db.query(sql, [id]);
    },

    // BUSCAR POR ID (Login)
    buscarPorId: async (id) => {
        const sql = "SELECT * FROM USUARIO WHERE id_usuario = ?";
        return await db.query(sql, [id]);
    }
};

module.exports = usuarioQueries;