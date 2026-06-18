const express = require('express');
const router = express.Router();
const db = require ('../db');

router.post('/cadastro', (req, res) => {
    const {nome, email, senha, perfil} = req.body;

    if (!nome || !email || !senha || !perfil){
        return res.status(400).json({erro: 'Todos os campos são obrigatórios.'});
    }

    const sql = 'INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)';
    db.query(sql, [nome, email, senha, perfil], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
      }
      return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
    }
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.' });
  });
});

router.post('/login', (req, res) => {
    const {email, senha} = req.body;

    const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    db.query(sql, [email, senha],
    (err, result)=>{
        if (err) return res.status(500).json({erro: 'Erro no servidor.'});
        if (result.length === 0) {
            return res.status(401).json({erro: 'Email ou senha inválidos.'});
        }

        const usuario = result[0];
        res.json({
            id: usuario.id,
            nome: usuario.nome,
            perfil: usuario.perfil
        });
    });
});

module.exports = router;