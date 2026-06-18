const express = require('express');
const router = express.Router();
const db = require ('../db');
const {verificarLeitor, verificarBibliotecario, verificarAutenticado} = require('../middleware/auth')

const solicitacoesDevolucao = new Set();

router.get('/', verificarAutenticado, (req, res)=>{
    const perfil = req.headers['x-perfil'];

    if (perfil === 'bibliotecario'){
        const sql = `
        SELECT e.*, u.nome AS leitor_nome, l.titulo AS livro_titulo
        FROM emprestimos e
        JOIN usuarios u ON e.leitor_id = u.id
        JOIN livros l ON e.livro_id = l.id
        `;
        db.query(sql, (err, result)=> {
            if (err) return res.status(500).json({erro: 'Erro ao buscar empréstimos.'});
            const comSolicitacao = result.map(e => ({
                ...e,
                devolucao_solicitada: solicitacoesDevolucao.has(e.id)
            }));
            res.status(201).json(comSolicitacao);
        });
    } else {
        const sql = `
        SELECT e.*, l.titulo AS livro_titulo
        FROM emprestimos e
        JOIN livros l ON e.livro_id = l.id
        WHERE e.leitor_id = ?
        `;
        db.query(sql, [req.usuarioId], (err, result) => {
            if (err) return res.status(500).json({erro: 'Erro ao buscar empréstimos'});
            const comSolicitacao = result.map(e => ({
                ...e,
                devolucao_solicitada: solicitacoesDevolucao.has(e.id)
            }));
            res.status(201).json(comSolicitacao);
        });
    };
});

router.post('/', verificarLeitor, (req, res) => {
    const {livro_id, data_emprestimo, data_devolucao_prevista} = req.body;

    db.query('SELECT quantidade_disponivel FROM livros WHERE id = ?', [livro_id], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({erro: 'Livro não encontrado.'});
        if (result[0].quantidade_disponivel <= 0){
            return res.status(400).json({erro: 'Livro fora de estoque.'});
        }

        const sql = `INSERT INTO emprestimos (livro_id, leitor_id, data_emprestimo, data_devolucao_prevista, status) VALUES (?, ?, ?, ?, 'ativo')`;
        db.query(sql, [livro_id, req.usuarioId, data_emprestimo, data_devolucao_prevista], (err)=> {
            if (err) return res.status(500).json({erro: 'Erro ao criar empréstimo.'});
            
            db.query('UPDATE livros SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = ?', [livro_id]);
            res.status(201).json({mensagem: 'Empréstimo ciado com sucesso.'});
        });
    });
});

router.put('/:id/devolver', verificarBibliotecario, (req, res) => {
    const {data_devolucao_real, livro_id} = req.body;
    const id = Number(req.params.id);

    // Só permite registrar a devolução se o leitor tiver solicitado antes(apagar dps, demorei pra perceber q isso tava faltando)
    if (!solicitacoesDevolucao.has(id)) {
        return res.status(400).json({erro: 'O leitor ainda não solicitou a devolução deste empréstimo.'});
    }

    const sql = `UPDATE emprestimos SET status = 'devolvido', data_devolucao_real = ? WHERE id = ?`;
    db.query(sql, [data_devolucao_real, req.params.id], (err)=> {
        if (err) return res.status(500).json({erro: 'Erro ao registrar devolução.'});

        solicitacoesDevolucao.delete(id);
        db.query('UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?', [livro_id]);
        res.status(201).json({mensagem: 'Devolução realizada com sucesso.'});
    });
});

router.put('/:id/solicitar-devolucao', verificarLeitor, (req, res) => {
    const id = Number(req.params.id);

    // Confere se o empréstimo existe, pertence a esse leitor e ainda está em aberto,
    // antes de marcar a solicitação (sem precisar de UPDATE no banco(apagar apos analises)).
    const sql = `SELECT id FROM emprestimos WHERE id = ? AND leitor_id = ? AND status IN ('ativo', 'atrasado')`;
    db.query(sql, [id, req.usuarioId], (err, result) => {
        if (err) return res.status(500).json({erro: 'Erro ao solicitar devolução.'});
        if (result.length === 0) {
            return res.status(404).json({erro: 'Empréstimo não encontrado ou já finalizado.'});
        }

        solicitacoesDevolucao.add(id);
        res.status(200).json({mensagem: 'Solicitação de devolução enviada ao bibliotecário.'});
    });
});

router.put('/:id/status', verificarBibliotecario, (req, res) => {
    const {status} = req.body;
    const statusValidos = ['ativo', 'devolvido', 'atrasado'];

    if (!statusValidos.includes(status)) {
        return res.status(400).json({erro: 'Status inválido.'});
    }

    const sql = `UPDATE emprestimos SET status = ? WHERE id = ?`;
    db.query(sql, [status, req.params.id], (err) => {
        if (err) return res.status(500).json({erro: 'Erro ao alterar status.'});

        solicitacoesDevolucao.delete(Number(req.params.id));
        res.status(200).json({mensagem: 'Status atualizado com sucesso.'});
    });
});
 
module.exports = router;