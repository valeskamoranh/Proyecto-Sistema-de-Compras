const db = require('../config/db');
const ordenQueries = require('../consultas/ordenQueries');
const { OrdenCompra, DetalleOrdenCompra } = require('../modelo/OrdenCompra');

const ordenController = {};

ordenController.crearOrden = async (req, res) => {
    const { id_cotizacion, fecha_emision, estado_OC, monto_total_OC, detalles } = req.body;
    const connection = await db.getConnection();

    try {
        // VALIDACIÓN 1 A 1 
        const [existe] = await connection.query(
            "SELECT id_OC FROM ORDEN_COMPRA WHERE id_cotizacion = ?",
            [id_cotizacion]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                mensaje: `La Cotización N° ${id_cotizacion} ya tiene la Orden de Compra N° ${existe[0].id_OC} asociada.`
            });
        }
        await connection.beginTransaction();

        // 1. Cálculos de Cabecera
        const cantidad_items = detalles.length;
        const total_unidades = detalles.reduce((suma, item) => suma + parseFloat(item.cantidad), 0);

        // 2. Crear Instancia del Modelo
        const nuevaOC = new OrdenCompra(
            null, id_cotizacion, fecha_emision, estado_OC || 'Emitida',
            monto_total_OC, cantidad_items, total_unidades
        );

        // 3. Agregar Detalles al Modelo
        detalles.forEach(d => {
            nuevaOC.agregarDetalle(new DetalleOrdenCompra(null, null, d.id_producto, d.cantidad, d.precio_unitario));
        });

        // 4. Insertar Cabecera
        const [result] = await ordenQueries.insertarCabecera(nuevaOC, connection);
        const id_OC = result.insertId;

        // 5. Insertar Detalles
        const datosParaInsertar = nuevaOC.detalles.map(d => [
            id_OC, d.id_producto, d.cantidad, d.precio_unitario
        ]);
        await ordenQueries.insertarDetalles(datosParaInsertar, connection);

        // 6. Solo confirmamos que la Requisición sigue su curso legal
        await ordenQueries.confirmarOrdenEnProceso(id_cotizacion, connection);

        await connection.commit();
        res.json({ mensaje: `¡Orden de Compra N° ${id_OC} generada exitosamente!` });

    } catch (error) {
        await connection.rollback();
        console.error("Error en crearOrden:", error);
        res.status(500).json({ mensaje: "Error al guardar la orden: " + error.message });
    } finally {
        connection.release();
    }
};

ordenController.listar = async (req, res) => {
    try {
        const [ordenes] = await ordenQueries.listarTodas();
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener el listado" });
    }
};

ordenController.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [cabeceras] = await ordenQueries.obtenerPorId(id);
        if (cabeceras.length === 0) return res.status(404).json({ mensaje: "Orden no encontrada" });

        const [detalles] = await ordenQueries.obtenerDetallesPorId(id);
        const respuesta = cabeceras[0];
        respuesta.detalles = detalles;

        res.json(respuesta);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al buscar la orden" });
    }
};

ordenController.anular = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        await ordenQueries.cambiarEstado(id, 'Anulada', connection);

        await ordenQueries.restaurarEstadoRequisicion(id, connection);

        await connection.commit();
        res.json({ mensaje: `Orden N° ${id} anulada correctamente.` });
    } catch (error) {
        await connection.rollback();
        console.error("Error al anular la orden:", error);
        res.status(500).json({ mensaje: "No se pudo anular la orden. Inténtelo de nuevo."});
    } finally {
        connection.release(); 
    }
};

ordenController.obtenerParaContabilidad = async (req, res) => {
    try {
        const [ordenes] = await ordenQueries.obtenerResumenContabilidad();
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener datos contables" });
    }
};

module.exports = ordenController;