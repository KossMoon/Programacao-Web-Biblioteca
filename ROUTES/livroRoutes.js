const express = require('express');
const router = express.Router();
const livroController = require('../Controllers/livroControllers');
 
router.get('/', livroController.getLivros);
router.get('/:id', livroController.getLivroPorId);
router.post('/', livroController.postLivro);
router.put('/:id', livroController.putLivro);
router.delete('/:id', livroController.deleteLivro);
 
module.exports = router;