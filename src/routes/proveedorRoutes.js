const express = require('express');
const router = express.Router();
const proveedorController = require('../controladores/proveedorController');

router.post('/', proveedorController.crearProveedor); 
router.get('/', proveedorController.listar); 
router.put('/:id', proveedorController.actualizar);
router.delete('/:id', proveedorController.eliminar);

module.exports = router;