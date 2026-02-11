const areaQueries = require('../consultas/areaQueries');
const Area = require('../modelo/Area');

const areaController = {};

// Registrar area (CREATE)
areaController.crearArea = async (req, res) => {
    try {
        const { nombre_area, responsable } = req.body;

        if (!nombre_area || !responsable) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
        }

        const nuevaArea = new Area(null, nombre_area, responsable);
        await areaQueries.insertar(nuevaArea);

        res.json({ mensaje: "¡Área registrada exitosamente!" });

    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ mensaje: "El nombre del área ya existe." });
        }
        res.status(500).json({ mensaje: "Error al registrar el área." });
    }
};

// Listar todas las áreas (READ)
areaController.listar = async (req, res) => {
    try {
        const [areas] = await areaQueries.obtenerTodas();
        res.json(areas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al listar áreas" });
    }
};

// Actualizar área (UPDATE)
areaController.actualizar = async (req, res) => {
    const { id } = req.params;
    const { nombre_area, responsable } = req.body;
    try {
        if (!nombre_area || !responsable) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
        }

        const areaEditada = new Area(id, nombre_area, responsable);

        await areaQueries.actualizar(areaEditada);

        res.status(200).json({ mensaje: "Área actualizada con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar" });
    }
};

// Eliminar área (DELETE)
areaController.eliminar = async (req, res) => {
    const { id } = req.params;
    try {

        await areaQueries.eliminar(id);
        res.json({ mensaje: "Área eliminada con éxito" });
    } catch (error) {
        res.status(400).json({ mensaje: "No se puede eliminar el área porque está en uso." });
    }
};

module.exports = areaController;