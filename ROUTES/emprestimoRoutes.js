const express = require('express');
const router = express.Router();
const emprestimoController = require('../Controllers/emprestimoController');
 
router.get('/', emprestimoController.getEmprestimos);
router.get('/:id', emprestimoController.getEmprestimoPorId);
router.post('/', emprestimoController.postEmprestimo);
router.put('/:id', emprestimoController.putEmprestimo);
router.delete('/:id', emprestimoController.deleteEmprestimo);
 
module.exports = router;