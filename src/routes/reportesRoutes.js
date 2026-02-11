const express = require('express');
const router = express.Router();
const pdfController = require('../controladores/pdfController');

// Ruta para descargar el PDF
router.get('/orden-compra/:id/pdf', pdfController.generarOrdenCompra);

module.exports = router;