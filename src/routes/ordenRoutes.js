const express = require('express');
const router = express.Router();
const ordenController = require('../controladores/ordenController');

router.get('/integracion-contabilidad', ordenController.obtenerParaContabilidad);

router.post('/', ordenController.crearOrden);
router.get('/:id', ordenController.obtenerPorId);
router.get('/', ordenController.listar);
router.put('/anular/:id', ordenController.anular);

module.exports = router;