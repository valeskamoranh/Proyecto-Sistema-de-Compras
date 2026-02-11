const db = require('../config/db');

const proveedorQueries = {
    buscarPorRuc: async (ruc) => {
        const sql = "SELECT id_proveedor FROM PROVEEDOR WHERE ruc = ?";
        return await db.query(sql, [ruc]);
    },

    // INSERTAR
    insertar: async (provObj) => {
        const sql = "INSERT INTO PROVEEDOR (nombre, ruc, telefono, email) VALUES (?, ?, ?, ?)";
        return await db.query(sql, [provObj.nombre, provObj.ruc, provObj.telefono, provObj.email]);
    },

    // LISTAR
    obtenerTodos: async () => {
        const sql = "SELECT * FROM PROVEEDOR ORDER BY id_proveedor ASC";
        return await db.query(sql);
    },

    // ACTUALIZAR
    actualizar: async (provObj) => {
        const sql = "UPDATE PROVEEDOR SET nombre=?, ruc=?, telefono=?, email=? WHERE id_proveedor=?";
        return await db.query(sql, [provObj.nombre, provObj.ruc, provObj.telefono, provObj.email, provObj.id_proveedor]);
    },

    // ELIMINAR
    eliminar: async (id) => {
        const sql = "DELETE FROM PROVEEDOR WHERE id_proveedor = ?";
        return await db.query(sql, [id]);
    }
};

module.exports = proveedorQueries;