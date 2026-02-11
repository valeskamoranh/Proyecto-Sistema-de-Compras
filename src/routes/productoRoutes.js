const express = require('express');
const router = express.Router();
const productoController = require('../controladores/productoController');

router.post('/', productoController.crearProducto); 
router.get('/', productoController.listar); 
router.put('/:id', productoController.actualizar);
router.delete('/:id', productoController.eliminar);

module.exports = router;