const express = require('express');
const router = express.Router();
const requisicionController = require('../controladores/requisicionController');

router.post('/', requisicionController.crearRequisicion);
router.put('/:id', requisicionController.actualizar);

router.get('/', requisicionController.listar);                 
router.get('/:id', requisicionController.obtenerPorId);        
router.put('/anular/:id', requisicionController.rechazar);     
router.put('/aprobar/:id', requisicionController.aprobar);


module.exports = router;