const db = require('../db');

const proveedorController = {};

// REGISTRAR PROVEEDOR
proveedorController.crearProveedor = async (req, res) => {
    const { nombre, ruc, telefono, email } = req.body;
    try {
        const [existe] = await db.query("SELECT id_proveedor FROM PROVEEDOR WHERE ruc = ?", [ruc]);
        if (existe.length > 0) {
            return res.status(400).json({ mensaje: "El RUC ya está registrado" });
        }

        const sql = "INSERT INTO PROVEEDOR (nombre, ruc, telefono, email) VALUES (?, ?, ?, ?)";
        await db.query(sql, [nombre, ruc, telefono, email]);
        res.status(201).json({ mensaje: "Proveedor registrado con éxito" });
    } catch (error) {
        console.error("Error al crear:", error);
        res.status(500).json({ mensaje: "Error al guardar proveedor" });
    }
};

// LISTAR
proveedorController.listar = async (req, res) => {
    try {
        const sql = "SELECT * FROM PROVEEDOR ORDER BY id_proveedor ASC";
        const [proveedores] = await db.query(sql);
        res.json(proveedores);
    } catch (error) {
        console.error("Error al listar proveedores:", error);
        res.status(500).json({ mensaje: "Error del servidor al listar" });
    }
};

// ACTUALIZAR
proveedorController.actualizar = async (req, res) => {
    const { id } = req.params;
    const { nombre, ruc, telefono, email } = req.body;
    try {
        const sql = "UPDATE PROVEEDOR SET nombre=?, ruc=?, telefono=?, email=? WHERE id_proveedor=?";
        await db.query(sql, [nombre, ruc, telefono, email, id]);
        res.json({ mensaje: "Proveedor actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ mensaje: "Error al actualizar" });
    }
};

// ELIMINAR
proveedorController.eliminar = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM PROVEEDOR WHERE id_proveedor = ?", [id]);
        res.json({ mensaje: "Proveedor eliminado" });
    } catch (error) {
        if (error.errno === 1451) {
            return res.status(400).json({ mensaje: "No se puede borrar: Este proveedor tiene compras asociadas." });
        }
        res.status(500).json({ mensaje: "Error al eliminar" });
    }
};
module.exports = proveedorController;