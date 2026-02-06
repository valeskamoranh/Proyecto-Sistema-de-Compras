const db = require('../db');

const requisicionController = {};

requisicionController.crearRequisicion = async (req, res) => {
    const connection = await db.getConnection(); 
    
    try {
        await connection.beginTransaction(); 

        const { id_usuario, fecha, estado, justificacion, detalles } = req.body;

        // 1. INSERTAR CABECERA 
        const sqlCabecera = `
            INSERT INTO REQUISICION (id_usuario, fecha, estado, justificacion) 
            VALUES (?, ?, ?, ?)
        `;
        const [resultCabecera] = await connection.query(sqlCabecera, [id_usuario, fecha, estado, justificacion]);
        
        const idRequisicion = resultCabecera.insertId; 

        // 2. INSERTAR DETALLES 
        const sqlDetalle = `
            INSERT INTO DETALLE_REQUISICION (id_requisicion, id_producto, cantidad, unidad_medida) 
            VALUES ?
        `;

        const datosDetalles = detalles.map(item => [
            idRequisicion, 
            item.id_producto, 
            item.cantidad, 
            item.unidad_medida
        ]);

        await connection.query(sqlDetalle, [datosDetalles]);

        await connection.commit(); 
        res.json({ mensaje: `¡Requisición N° ${idRequisicion} guardada exitosamente!` });

    } catch (error) {
        await connection.rollback(); 
        console.error(error);
        res.status(500).json({ mensaje: "Error al guardar la requisición." });
    } finally {
        connection.release(); 
    }
};

// 2. LISTAR (Para la tabla visual)
requisicionController.listar = async (req, res) => {
    try {

        const sql = `
            SELECT 
                r.id_requisicion, 
                r.fecha, 
                r.estado, 
                r.justificacion,
                u.nombre AS nombre_usuario,
                /* Si guardaste cantidad_items en el create, úsalo aquí. 
                   Si no, usa esta subconsulta: */
                (SELECT COUNT(*) FROM DETALLE_REQUISICION d WHERE d.id_requisicion = r.id_requisicion) as cantidad_items
            FROM REQUISICION r
            LEFT JOIN USUARIO u ON r.id_usuario = u.id_usuario
            ORDER BY r.id_requisicion DESC
        `;
        const [requisiciones] = await db.query(sql);
        res.json(requisiciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al listar requisiciones" });
    }
};

// 3. OBTENER POR ID (Para el Modal "Ver")
requisicionController.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // A. Obtener Cabecera
        const sqlCabecera = `
            SELECT r.*, u.nombre as nombre_usuario 
            FROM REQUISICION r 
            LEFT JOIN USUARIO u ON r.id_usuario = u.id_usuario
            WHERE r.id_requisicion = ?
        `;
        const [cabeceras] = await db.query(sqlCabecera, [id]);

        if (cabeceras.length === 0) return res.status(404).json({ mensaje: "Requisición no encontrada" });

        // B. Obtener Detalles
        const sqlDetalles = `
            SELECT d.*, p.nombre_producto 
            FROM DETALLE_REQUISICION d
            JOIN PRODUCTO p ON d.id_producto = p.id_producto
            WHERE d.id_requisicion = ?
        `;
        const [detalles] = await db.query(sqlDetalles, [id]);

        // C. Unificar respuesta
        const respuesta = cabeceras[0];
        respuesta.detalles = detalles;

        res.json(respuesta);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener el detalle" });
    }
};

// 4. RECHAZAR 
requisicionController.rechazar = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "UPDATE REQUISICION SET estado = 'Rechazada' WHERE id_requisicion = ?";
        await db.query(sql, [id]);
        res.json({ mensaje: `Requisición N° ${id} ha sido RECHAZADA.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al rechazar la requisición" });
    }
};

// 5. APROBAR
requisicionController.aprobar = async (req, res) => {
    try {
        const { id } = req.params;
        // Cambiamos el estado a 'Aprobada'
        const sql = "UPDATE REQUISICION SET estado = 'Aprobada' WHERE id_requisicion = ?";
        await db.query(sql, [id]);
        res.json({ mensaje: `Requisición N° ${id} APROBADA correctamente.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al aprobar la requisición" });
    }
};
module.exports = requisicionController;