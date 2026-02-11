const PDFDocument = require('pdfkit');
const ordenQueries = require('../consultas/ordenQueries');
const db = require('../config/db');

const pdfController = {};

pdfController.generarOrdenCompra = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. CONSULTA DE DATOS (Cabecera + Proveedor)
        const sqlCabecera = `
            SELECT oc.id_OC, oc.fecha_emision, p.nombre as proveedor, p.telefono, p.email
            FROM ORDEN_COMPRA oc
            JOIN COTIZACION c ON oc.id_cotizacion = c.id_cotizacion
            JOIN PROVEEDOR p ON c.id_proveedor = p.id_proveedor
            WHERE oc.id_OC = ?
        `;

        // 2. CONSULTA DE DETALLES (Productos)
        const sqlDetalle = `
            SELECT prod.nombre_producto, dc.cantidad, dc.precio_unitario
            FROM DETALLE_COTIZACION dc
            JOIN COTIZACION c ON dc.id_cotizacion = c.id_cotizacion
            JOIN ORDEN_COMPRA oc ON c.id_cotizacion = oc.id_cotizacion
            JOIN PRODUCTO prod ON dc.id_producto = prod.id_producto
            WHERE oc.id_OC = ?
        `;

        const [cabecera] = await db.query(sqlCabecera, [id]);
        const [detalles] = await db.query(sqlDetalle, [id]);

        if (cabecera.length === 0) return res.status(404).send("Orden no encontrada");
        const datos = cabecera[0];

        // 3. INICIAR EL DOCUMENTO PDF
        const doc = new PDFDocument({ margin: 50 });

        // Configurar cabeceras de respuesta HTTP para que el navegador sepa que es un PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Orden_Compra_${id}.pdf`);

        doc.pipe(res); 

        // --- DISEÑO DEL PDF ---

        // Título y Logo 
        doc.fontSize(20).text('ORDEN DE COMPRA', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`GastoControl S.A.`, { align: 'center' });
        doc.moveDown();

        // Datos Generales
        doc.fontSize(10).text(`Orden N°: ${datos.id_OC}`, 50, 150);
        doc.text(`Fecha: ${new Date(datos.fecha_emision).toLocaleDateString()}`, 50, 165);

        doc.text(`Proveedor: ${datos.proveedor}`, 300, 150);
        doc.text(`Teléfono: ${datos.telefono || 'N/A'}`, 300, 165);
        doc.text(`Email: ${datos.email || 'N/A'}`, 300, 180);

        doc.moveDown(2);

        // Dibujar Tabla 
        let y = 250;
        doc.font('Helvetica-Bold');
        doc.text('Producto', 50, y);
        doc.text('Cant', 280, y);
        doc.text('Precio Unit.', 350, y);
        doc.text('Total', 450, y);

        // Línea separadora
        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();

        y += 25;
        doc.font('Helvetica');

        let granTotal = 0;

        detalles.forEach(item => {
            const subtotal = item.cantidad * item.precio_unitario;
            granTotal += subtotal;

            doc.text(item.nombre_producto, 50, y);
            doc.text(item.cantidad, 280, y);
            doc.text(`$${item.precio_unitario}`, 350, y);
            doc.text(`$${subtotal.toFixed(2)}`, 450, y);

            y += 20;
        });

        // Línea final
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 10;

        // TOTAL FINAL
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`TOTAL A PAGAR: $${granTotal.toFixed(2)}`, 350, y + 10);

        // Espacio para firmas
        doc.moveDown(4);
        doc.fontSize(10).text('_________________________', 50, doc.y);
        doc.text('Firma Autorizada', 50, doc.y + 5);

        // 4. FINALIZAR EL PDF
        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).send("Error generando PDF");
    }

};

pdfController.generarReporteGeneral = async (req, res) => {
    try {
        const { inicio, fin, q } = req.query;
        const [ordenes] = await ordenQueries.obtenerDatosReporteAvanzado(inicio, fin, q);

        if (ordenes.length === 0) return res.status(404).send("No hay datos");

        // CONFIGURAR PDF
        const doc = new PDFDocument({ margin: 40, layout: 'landscape' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Compras.pdf');

        // PIPING 
        doc.pipe(res);

        // --- DISEÑO ---
        doc.fontSize(20).text('REPORTE DE ÓRDENES DE COMPRA', { align: 'center' });
        doc.fontSize(10).text(`Filtros: ${inicio || 'S/N'} hasta ${fin || 'S/N'} | Búsqueda: ${q || 'Ninguna'}`, { align: 'center' });
        doc.moveDown();

        // Cabecera de tabla
        let y = 120;
        doc.font('Helvetica-Bold');
        doc.text('N° OC', 50, y);
        doc.text('Fecha', 120, y);
        doc.text('Proveedor', 220, y);
        doc.text('Total', 500, y);
        doc.text('Estado', 650, y);

        doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke();
        y += 25;
        doc.font('Helvetica');

        // EL BUCLE 
        let granTotal = 0;
        ordenes.forEach(o => {
            doc.text(o.id_OC.toString(), 50, y);
            doc.text(new Date(o.fecha_emision).toLocaleDateString(), 120, y);
            doc.text(o.nombre_proveedor || 'N/A', 220, y);
            doc.text(`$${parseFloat(o.monto_total_OC).toFixed(2)}`, 500, y);
            doc.text(o.estado_OC, 650, y);

            granTotal += parseFloat(o.monto_total_OC);
            y += 20;

            if (y > 500) {
                doc.addPage({ layout: 'landscape' });
                y = 50;
            }
        });

        doc.moveDown();
        doc.font('Helvetica-Bold').text(`TOTAL GENERAL: $${granTotal.toFixed(2)}`, 500, y + 20);

        // FINALIZAR
        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al generar el reporte");
    }
};

module.exports = pdfController;