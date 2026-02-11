const productoQueries = require('../consultas/productoQueries');
const Producto = require('../modelo/Producto');


const productoController = {};

// REGISTRAR PRODUCTO
productoController.crearProducto = async (req, res) => {
    try {
        const { nombre_producto, descripcion, unidad_medida, cantidad_unidad } = req.body;

        if (!nombre_producto || !unidad_medida || !cantidad_unidad) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios (Nombre, Unidad o Cantidad)" });
        }

        const nuevoProducto = new Producto(null, nombre_producto, descripcion, unidad_medida, cantidad_unidad);

        await productoQueries.insertar(nuevoProducto);
        res.json({ mensaje: "¡Producto registrado exitosamente!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al registrar el producto." });
    }
};

//LISTAR PRODUCTOS 
productoController.listar = async (req, res) => {
    try {
        const [productos] = await productoQueries.obtenerTodos();
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener productos" });
    }
};

// ACTUALIZAR
productoController.actualizar = async (req, res) => {
    const { id } = req.params;
    const { nombre_producto, descripcion, unidad_medida, cantidad_unidad } = req.body;
    try {
        const productoEditado = new Producto(id, nombre_producto, descripcion, unidad_medida, cantidad_unidad);

        await productoQueries.actualizar(productoEditado);
        res.json({ mensaje: "Producto actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ mensaje: "Error al actualizar producto" });
    }
};

// ELIMINAR
productoController.eliminar = async (req, res) => {
    const { id } = req.params;
    try {
        await productoQueries.eliminar(id);
        return res.status(200).json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        if (error.errno === 1451) {
            return res.status(500).json({mensaje: " No se puede eliminar: el producto tiene movimientos en Órdenes de Compra."});
        }
        res.status(500).json({ mensaje: "Error al eliminar" });
    }
};

module.exports = productoController;