const express = require('express');
const router = express.Router();
const cotizacionController = require('../controladores/cotizacionController');

router.post('/', cotizacionController.crearCotizacion);
router.get('/', cotizacionController.listar);
router.get('/:id', cotizacionController.obtenerPorId);
router.delete('/:id', cotizacionController.eliminar);
router.put('/:id', cotizacionController.actualizar);

module.exports = router;