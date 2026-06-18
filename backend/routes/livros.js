const express = require('express');
const router = express.Router();
const db = require ('../db');
const {verificarBibliotecario} = require('../middleware/auth')

router.get('/', (req, res)=> {
    db.query('SELECT * FROM livros', (err, result)=>{
        if (err) return res.send(500).json({erro: 'Erro ao buscar livros.'});
        res.json(result);
    });
});

router.post('/', verificarBibliotecario, (req, res)=> {
    const {titulo, autor, ano_publicacao, quantidade_disponivel} = req.body;
    
    const sql = 'INSERT INTO livros (titulo, autor, ano_publicacao, quantidade_disponivel) VALUES (?, ?, ?, ?)';
    db.query(sql, [titulo, autor, ano_publicacao, quantidade_disponivel],
    (err, result)=>{
        if (err) return res.status(500).json({erro: 'Erro ao cadastrar livro.'});
        res.status(201).json({mensagem: 'Livro cadastrado com sucesso.'});
    });
});

router.put('/:id', verificarBibliotecario, (req, res)=>{
    const {titulo, autor, ano_publicacao, quantidade_disponivel} = req.body;

    const sql = 'UPDATE livros SET titulo = ?, autor = ?, ano_publicacao = ?, quantidade_disponivel = ? WHERE id = ?';
    db.query(sql, [titulo, autor, ano_publicacao, quantidade_disponivel, req.params.id],
    (err, result)=>{
        if (err) return res.status(500).json({erro: 'Erro ao atualizar livro.'});
        res.status(201).json({mensagem: 'Livro autalizado com sucesso.'});
    });
});

router.delete('/:id', verificarBibliotecario, (req, res)=>{
    db.query('DELETE FROM livros WHERE id = ?', [req.params.id], 
        (err, result)=>{
            if (err) return res.status(500).json({erro: 'Erro ao remover livro.'});
            res.status(201).json({mensagem: 'Livro excluído com sucesso.'});
        }
    );
});

module.exports = router; 