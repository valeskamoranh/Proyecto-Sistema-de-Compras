const db = require('../config/db');

const productoQueries = {
    // INSERTAR (CREATE)
    insertar: async (prodObj) => {
        const sql = `
            INSERT INTO PRODUCTO 
            (nombre_producto, descripcion, unidad_medida, cantidad_unidad) 
            VALUES (?, ?, ?, ?)
        `;
        return await db.query(sql, [prodObj.nombre_producto, prodObj.descripcion, prodObj.unidad_medida, prodObj.cantidad_unidad]);
    },

    // LISTAR (READ)
    obtenerTodos: async () => {
        const sql = "SELECT * FROM PRODUCTO ORDER BY id_producto ASC";
        return await db.query(sql);
    },

    // ACTUALIZAR (UPDATE)
    actualizar: async (prodObj) => {
        const sql = `
            UPDATE PRODUCTO 
            SET nombre_producto=?, descripcion=?, unidad_medida=?, cantidad_unidad=? 
            WHERE id_producto=?
        `;
        return await db.query(sql, [prodObj.nombre_producto, prodObj.descripcion, prodObj.unidad_medida, prodObj.cantidad_unidad, prodObj.id_producto]);
    },

    // ELIMINAR (DELETE)
    eliminar: async (id) => {
        const sql = "DELETE FROM PRODUCTO WHERE id_producto = ?";
        return await db.query(sql, [id]);
    }
};

module.exports = productoQueries;