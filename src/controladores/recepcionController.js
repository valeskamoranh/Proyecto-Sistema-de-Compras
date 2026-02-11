const db = require('../config/db');
const queries = require('../consultas/recepcionQueries');
const { Recepcion, DetalleRecepcion } = require('../modelo/Recepcion');

const recepcionController = {};

recepcionController.crearRecepcion = async (req, res) => {
    const { id_OC, fecha_recepcion, estado_recepcion, observaciones, detalles } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const nuevaRecepcion = new Recepcion(null, id_OC, fecha_recepcion, observaciones, estado_recepcion);

        detalles.forEach(d => {
            nuevaRecepcion.agregarDetalle(new DetalleRecepcion(null, null, d.id_producto, d.cantidad_recibida));
        });

        const [result] = await queries.insertarCabecera(nuevaRecepcion, connection);
        const idRecepcion = result.insertId;

        const datosDetalles = nuevaRecepcion.detalles.map(d => [
            idRecepcion,
            d.id_producto,
            d.cantidad_recibida,
        ]);
        await queries.insertarDetalles(datosDetalles, connection);

        // LÓGICA DE ESTADOS EN CADENA
        let nuevoEstadoOC = 'En Proceso';

        if (estado_recepcion === 'Completa') {
            nuevoEstadoOC = 'Entregada';
        } else {
            nuevoEstadoOC = 'En Proceso';
        }
        await queries.actualizarEstadoOC(id_OC, nuevoEstadoOC, connection);

        if (estado_recepcion === 'Completa') {
            await queries.actualizarEstadoRequisicionFinal(id_OC, connection);
        }

        await connection.commit();
        res.json({ mensaje: `¡Recepción N° ${idRecepcion} registrada correctamente!` });

    } catch (error) {
        await connection.rollback();
        console.error("Error al guardar recepción:", error);
        res.status(500).json({ mensaje: "Error al guardar: " + error.message });
    } finally {
        connection.release();
    }
};

// LISTAR 
recepcionController.listar = async (req, res) => {
    try {
        const [recepciones] = await queries.obtenerTodas();
        res.json(recepciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al listar recepciones" });
    }
};

// DETALLE (Para el Modal)
recepcionController.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // A. Cabecera
        const [cabeceras] = await queries.obtenerPorId(id);
        if (cabeceras.length === 0) return res.status(404).json({ mensaje: "Recepción no encontrada" });

        // B. Detalles 
        const [detalles] = await queries.obtenerDetallesPorId(id);

        const respuesta = cabeceras[0];
        respuesta.detalles = detalles;
        res.json(respuesta);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener el detalle" });
    }
};

// ELIMINAR (Borrado físico por si hubo error de dedo en la entrada)
recepcionController.eliminar = async (req, res) => {
    const { id } = req.params;

    try {
        const [recepciones] = await queries.obtenerPorId(id);

        if (recepciones.length === 0) {
            return res.status(404).json({ mensaje: "Recepción no encontrada." });
        }

        const recepcionActual = recepciones[0];
        if (recepcionActual.estado_recepcion === 'Completa') {
            return res.status(400).json({
                mensaje: "⛔ BLOQUEADO: No se puede eliminar una recepción que ya ha sido completada."
            });
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            await queries.eliminarFisico(id, connection);

            await connection.commit();
            return res.json({ mensaje: "Recepción eliminada correctamente y registros limpiados." });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Error crítico al eliminar:", error);
        return res.status(500).json({
            mensaje: "Error interno del servidor al procesar la eliminación."
        });
    }
};

// Obtener datos para la vista de Inventario
recepcionController.obtenerParaInventario = async (req, res) => {
    try {
        const [resultados] = await queries.obtenerParaInventario();
        res.json(resultados);
    } catch (error) {
        console.error("Error inventario:", error);
        res.status(500).json({ mensaje: "Error al obtener datos para el inventario." });
    }
};
module.exports = recepcionController;