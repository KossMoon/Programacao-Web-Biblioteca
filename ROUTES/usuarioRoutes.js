const express = require('express');
const router = express.Router();
const usuarioController = require('../Controllers/usuarioController');
 
router.post('/', usuarioController.postUsuario);
router.post('/login', usuarioController.loginUsuario);
 
module.exports = router;
