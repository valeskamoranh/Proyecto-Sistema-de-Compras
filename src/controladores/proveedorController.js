const proveedorQueries = require('../consultas/proveedorQueries');
const Proveedor = require('../modelo/proveedor');

const proveedorController = {};

// REGISTRAR PROVEEDOR
proveedorController.crearProveedor = async (req, res) => {
    const { nombre, ruc, telefono, email } = req.body;
    try {
        const [existe] = await proveedorQueries.buscarPorRuc(ruc);

        if (existe.length > 0) {
            return res.status(400).json({ mensaje: "El RUC ya está registrado" });
        }

        const nuevoProveedor = new Proveedor(null, nombre, ruc, telefono, email);

        await proveedorQueries.insertar(nuevoProveedor);
        res.status(201).json({ mensaje: "Proveedor registrado con éxito" });
    } catch (error) {
        console.error("Error al crear:", error);
        res.status(500).json({ mensaje: "Error al guardar proveedor" });
    }
};

// LISTAR
proveedorController.listar = async (req, res) => {
    try {
        const [proveedores] = await proveedorQueries.obtenerTodos();
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
        const proveedorEditado = new Proveedor(id, nombre, ruc, telefono, email);

        await proveedorQueries.actualizar(proveedorEditado);
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
        await proveedorQueries.eliminar(id);
        res.json({ mensaje: "Proveedor eliminado" });
    } catch (error) {
        if (error.errno === 1451) {
            return res.status(400).json({ mensaje: "No se puede borrar: Este proveedor tiene compras asociadas." });
        }
        res.status(500).json({ mensaje: "Error al eliminar" });
    }
};
module.exports = proveedorController;