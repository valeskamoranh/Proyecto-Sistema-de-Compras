const express = require('express');
const router = express.Router();

const areaController = require('../controladores/areaController');

router.post('/', areaController.crearArea);
router.get('/', areaController.listar);
router.put('/:id', areaController.actualizar);
router.delete('/:id', areaController.eliminar);

module.exports = router;