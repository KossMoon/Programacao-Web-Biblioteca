const conexao = require('../DATABASE/db');

// GET /livros - lista todos os livros
function getLivros(req, res) {
    const sql = 'SELECT * FROM livros';

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ erro: 'Erro ao buscar livros' });
        }
        res.json(resultados);
    });
}

// GET /livros/:id - busca um livro específico
function getLivroPorId(req, res) {
    const { id } = req.params;
    const sql = 'SELECT * FROM livros WHERE id = ?';

    conexao.query(sql, [id], (erro, resultados) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ erro: 'Erro ao buscar livro' });
        }
        if (resultados.length === 0) {
            return res.status(404).json({ erro: 'Livro não encontrado' });
        }
        res.json(resultados[0]);
    });
}

// POST /livros - cadastra um novo livro
function postLivro(req, res) {
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

    if (!titulo || !autor || quantidade_disponivel === undefined) {
        return res.status(400).json({ erro: 'Título, autor e quantidade disponível são obrigatórios' });
    }

    const sql = 'INSERT INTO livros (titulo, autor, ano_publicacao, quantidade_disponivel) VALUES (?, ?, ?, ?)';

    conexao.query(sql, [titulo, autor, ano_publicacao, quantidade_disponivel], (erro, resultado) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ erro: 'Erro ao cadastrar livro' });
        }
        res.status(201).json({
            id: resultado.insertId,
            mensagem: 'Livro cadastrado com sucesso'
        });
    });
}

// PUT /livros/:id - atualiza um livro existente
function putLivro(req, res) {
    const { id } = req.params;
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

    if (!titulo || !autor || quantidade_disponivel === undefined) {
        return res.status(400).json({ erro: 'Título, autor e quantidade disponível são obrigatórios' });
    }

    const sql = 'UPDATE livros SET titulo = ?, autor = ?, ano_publicacao = ?, quantidade_disponivel = ? WHERE id = ?';

    conexao.query(sql, [titulo, autor, ano_publicacao, quantidade_disponivel, id], (erro, resultado) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ erro: 'Erro ao atualizar livro' });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Livro não encontrado' });
        }
        res.json({ mensagem: 'Livro atualizado com sucesso' });
    });
}

// DELETE /livros/:id - remove um livro
function deleteLivro(req, res) {
    const { id } = req.params;
    const sql = 'DELETE FROM livros WHERE id = ?';

    conexao.query(sql, [id], (erro, resultado) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ erro: 'Erro ao remover livro' });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Livro não encontrado' });
        }
        res.json({ mensagem: 'Livro removido com sucesso' });
    });
}

module.exports = {
    getLivros,
    getLivroPorId,
    postLivro,
    putLivro,
    deleteLivro
};
