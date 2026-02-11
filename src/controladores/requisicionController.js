const db = require('../config/db');
const { Requisicion, DetalleRequisicion } = require('../modelo/Requisicion');
const queries = require('../consultas/requisicionQueries');
const usuarioQueries = require('../consultas/usuarioQueries');

const requisicionController = {};

// CREATE
requisicionController.crearRequisicion = async (req, res) => {
    try {
        const { id_usuario, fecha, estado, justificacion, detalles } = req.body;

        // VALIDACIÓN DE USUARIO 
        const [usuario] = await usuarioQueries.buscarPorId(id_usuario);
        if (usuario.length === 0) {
            return res.status(400).json({
                mensaje: `La cédula no pertenece a un usuario registrado.`
            });
        }
        const nuevaReq = new Requisicion(null, id_usuario, fecha, estado, justificacion);
        if (detalles && detalles.length > 0) {
            detalles.forEach(d => {
                const nuevoDetalle = new DetalleRequisicion(null, null, d.id_producto, d.cantidad, d.unidad_medida);
                nuevaReq.agregarDetalle(nuevoDetalle);
            });
        }
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // INSERTAR CABECERA 
            const [resultCabecera] = await queries.insertarCabecera(nuevaReq, connection);
            const idRequisicion = resultCabecera.insertId;

            // INSERTAR DETALLES 
            const datosDetalles = nuevaReq.detalles.map(detalleObj => [
                idRequisicion,
                detalleObj.id_producto,
                detalleObj.cantidad,
                detalleObj.unidad_medida
            ]);

            await queries.insertarDetalles(datosDetalles, connection);

            await connection.commit();
            res.json({ mensaje: `¡Requisición N° ${idRequisicion} guardada exitosamente!` });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ mensaje: "Error al procesar la requisición." });
    }
};

// LISTAR 
requisicionController.listar = async (req, res) => {
    try {
        const [requisiciones] = await queries.listarTodas();
        res.json(requisiciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al listar requisiciones" });
    }
};

// OBTENER POR ID (Para el Modal "Ver")
requisicionController.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [cabeceras] = await queries.obtenerPorId(id);
        if (cabeceras.length === 0) return res.status(404).json({ mensaje: "Requisición no encontrada" });

        const [detalles] = await queries.obtenerDetalles(id);

        const respuesta = cabeceras[0];
        respuesta.detalles = detalles;

        res.json(respuesta);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener el detalle" });
    }
};

// --- ACTUALIZAR (UPDATE) ---
requisicionController.actualizar = async (req, res) => {
    const { id } = req.params;
    const { id_usuario, fecha, justificacion, estado, detalles } = req.body;

    try {
        // 1. VALIDACIÓN DE USUARIO 
        const [usuarioExiste] = await queries.verificarUsuario(id_usuario);
        if (usuarioExiste.length === 0) {
            return res.status(400).json({ mensaje: "Error: El usuario solicitante no existe." });
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [rows] = await queries.obtenerPorId(id);
            const estadosPermitidos = ['Pendiente', 'En proceso'];
            if (!estadosPermitidos.includes(rows[0].estado)) {
                return res.status(400).json({ mensaje: "No se puede editar una requisición ya cerrada." });
            }

            // Actualizar Cabecera y Detalles
            await queries.actualizarCabecera(id, fecha, justificacion, estado, connection);
            await queries.eliminarDetalles(id, connection);
            const datosNuevos = detalles.map(item => [id, item.id_producto, item.cantidad, item.unidad_medida]);
            await queries.insertarDetalles(datosNuevos, connection);

            await connection.commit();
            res.json({ mensaje: "Requisición actualizada correctamente." });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar." });
    }
};


// RECHAZAR 
requisicionController.rechazar = async (req, res) => {
    try {
        const { id } = req.params;
        await queries.actualizarEstado(id, 'Rechazada');
        res.json({ mensaje: `Requisición N° ${id} ha sido RECHAZADA.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al anular" });
    }
};

// APROBAR
requisicionController.aprobar = async (req, res) => {
    try {
        const { id } = req.params;
        await queries.actualizarEstado(id, 'Aprobada');
        res.json({ mensaje: `Requisición N° ${id} APROBADA correctamente.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al aprobar" });
    }
};

module.exports = requisicionController;