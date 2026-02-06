const express = require('express');
const router = express.Router();
const recepcionController = require('../controladores/recepcionController');

router.get('/simulacion-inventario', recepcionController.obtenerParaInventario);

router.post('/', recepcionController.crearRecepcion);
router.get('/', recepcionController.listar);
router.get('/:id', recepcionController.obtenerPorId);
router.delete('/:id', recepcionController.eliminar);


module.exports = router;