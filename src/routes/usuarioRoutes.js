const express = require('express');
const router = express.Router();

const usuarioController = require('../controladores/usuarioController');

router.post('/', usuarioController.crearUsuario);
router.get('/', usuarioController.listar);
router.put('/:id', usuarioController.actualizar);
router.delete('/:id', usuarioController.eliminar);
router.post('/login', usuarioController.login);

module.exports = router;