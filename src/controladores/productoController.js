const db = require('../db');

const productoController = {};

// REGISTRAR PRODUCTO
productoController.crearProducto = async (req, res) => {
    try {
        const { nombre_producto, descripcion, unidad_medida, cantidad_unidad } = req.body;

        if (!nombre_producto || !unidad_medida || !cantidad_unidad) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios (Nombre, Unidad o Cantidad)" });
        }

        const sql = `
            INSERT INTO PRODUCTO 
            (nombre_producto, descripcion, unidad_medida, cantidad_unidad) 
            VALUES (?, ?, ?, ?)
        `;

        await db.query(sql, [nombre_producto, descripcion, unidad_medida, cantidad_unidad]);

        res.json({ mensaje: "¡Producto registrado exitosamente!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al registrar el producto." });
    }
};

//LISTAR PRODUCTOS 
productoController.listar = async (req, res) => {
    try {
        const [productos] = await db.query("SELECT * FROM PRODUCTO ORDER BY id_producto ASC");
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener productos" });
    }
};

// ACTUALIZAR
productoController.actualizar = async (req, res) => {
    const { id } = req.params;
    const { nombre_producto, descripcion, unidad_medida, cantidad_unidad } = req.body;
    try {
        const sql = "UPDATE PRODUCTO SET nombre_producto=?, descripcion=?, unidad_medida=?, cantidad_unidad=? WHERE id_producto=?";
        await db.query(sql, [nombre_producto, descripcion, unidad_medida, cantidad_unidad, id]);
        res.json({ mensaje: "Producto actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar producto" });
    }
};

// ELIMINAR
productoController.eliminar = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM PRODUCTO WHERE id_producto = ?", [id]);
        res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "No se puede eliminar (puede estar en una Orden de Compra)" });
    }
};
module.exports = productoController;