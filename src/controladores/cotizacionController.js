const db = require('../config/db');
const queries = require('../consultas/cotizacionQueries');
const { Cotizacion, DetalleCotizacion } = require('../modelo/Cotizacion');


const cotizacionController = {};

// CREATE
cotizacionController.crearCotizacion = async (req, res) => {
    const { id_requisicion, id_proveedor, fecha_cotizacion, validez, monto_total, detalles } = req.body;

    try {
        // 1. VALIDAR OBLIGATORIOS BÁSICOS
        if (!id_requisicion || !id_proveedor || !monto_total) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
        }
        // 2. INSTANCIAR MODELO CABECERA
        const nuevaCotizacion = new Cotizacion(null, id_requisicion, id_proveedor, fecha_cotizacion, validez, monto_total);

        // 3. INSTANCIAR MODELOS DETALLES
        if (detalles && detalles.length > 0) {
            detalles.forEach(d => {
                const nuevoDetalle = new DetalleCotizacion(null, null, d.id_producto, d.cantidad, d.precio_unitario);
                nuevaCotizacion.agregarDetalle(nuevoDetalle);
            });
        }
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 4. INSERTAR CABECERA 
            const [resultCabecera] = await queries.insertarCabecera(nuevaCotizacion, connection);
            const idCotizacion = resultCabecera.insertId;

            // 5. INSERTAR DETALLES 
            const datosDetalles = nuevaCotizacion.detalles.map(d => [
                idCotizacion,
                d.id_producto,
                d.cantidad,
                d.precio_unitario
            ]);

            // ACTUALIZACIÓN AUTOMÁTICA DEL ESTADO 
            const sqlUpdateEstado = "UPDATE REQUISICION SET estado = 'En proceso' WHERE id_requisicion = ?";
            await connection.query(sqlUpdateEstado, [id_requisicion]);
            await queries.insertarDetalles(datosDetalles, connection);

            await connection.commit();
            res.json({ mensaje: `¡Cotización N° ${idCotizacion} registrada exitosamente!` });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al registrar la cotización." });
    }
};

// LISTAR 
cotizacionController.listar = async (req, res) => {
    try {
        const [cotizaciones] = await queries.listarTodas();
        res.json(cotizaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al listar cotizaciones" });
    }
};

// DETALLE (Para el Modal)
cotizacionController.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // A. Cabecera 
        const [cabeceras] = await queries.obtenerPorId(id);
        if (cabeceras.length === 0) return res.status(404).json({ mensaje: "Cotización no encontrada" });

        // B. Detalles 
        const [detalles] = await queries.obtenerDetalles(id);

        // C. Respuesta unificada
        const respuesta = cabeceras[0];
        respuesta.detalles = detalles;

        res.json(respuesta);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener el detalle" });
    }
};

// ELIMINAR (Físico, ya que no hay estado 'Anulada')
cotizacionController.eliminar = async (req, res) => {
const { id } = req.params;
    
    try {
        const rawRes = await queries.verificarUsoEnOrden(id);
        
        let totalUso = 0;
        if (Array.isArray(rawRes) && rawRes.length > 0) {
            const fila = Array.isArray(rawRes[0]) ? rawRes[0][0] : rawRes[0];
            totalUso = fila?.total || 0;
        }

        if (totalUso > 0) {
            return res.status(400).json({ 
                mensaje: "No se puede eliminar: Esta cotización ya está vinculada a una Orden de Compra." 
            });
        }

        await queries.eliminarDetalles(id);
        await queries.eliminarCabecera(id);

        res.json({ mensaje: "Cotización eliminada correctamente" });
    } catch (error) {
        console.error("Error al intentar eliminar:", error.message);
        res.status(500).json({ mensaje: "Error al eliminar cotización" });
    }
};

// --- ACTUALIZAR COTIZACIÓN ---
cotizacionController.actualizar = async (req, res) => {
    const { id } = req.params;
    const { id_proveedor, fecha_cotizacion, validez, monto_total, detalles } = req.body;

    try {

        if (!id_proveedor || !fecha_cotizacion || !monto_total) {
            return res.status(400).json({ mensaje: "Datos incompletos para actualizar." });
        }

        const [infoEstado] = await queries.obtenerEstadoRequisicion(id);

        if (infoEstado.length > 0) {
            const estadoActual = infoEstado[0].estado;
            if (estadoActual === 'Atendida' || estadoActual === 'Rechazada' || estadoActual === 'Anulada') {
                return res.status(400).json({
                    mensaje: `⛔ No se puede editar: La requisición ya está '${estadoActual}'.`
                });
            }
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            await queries.actualizarCabecera(id, id_proveedor, fecha_cotizacion, validez, monto_total, connection);

            await queries.eliminarDetalles(id);

            if (detalles && detalles.length > 0) {
                const datosNuevos = detalles.map(d => [
                    id,
                    d.id_producto,
                    d.cantidad,
                    d.precio_unitario
                ]);
                await queries.insertarDetalles(datosNuevos, connection);
            }

            await connection.commit();
            res.json({ mensaje: `Cotización N° ${id} actualizada correctamente.` });

        } catch (error) {
            await connection.rollback();
            console.error("Error SQL en Transacción:", error);
            res.status(500).json({ mensaje: "Error interno SQL: " + error.message });
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar la cotización." });
    }
};

module.exports = cotizacionController;