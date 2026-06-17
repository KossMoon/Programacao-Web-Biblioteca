const conexao = require('../DATABASE/db');
 
function calcularStatus(emprestimo) {
    if (emprestimo.status !== 'ativo' || emprestimo.data_devolucao_real) {
        return emprestimo.status;
    }
 
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
 
    const prevista = new Date(emprestimo.data_devolucao_prevista);
    prevista.setHours(0, 0, 0, 0);
 
    return prevista < hoje ? 'atrasado' : emprestimo.status;
}
 
function getEmprestimos(req, res) {
    const { leitor_id } = req.query;
 
    let sql = `
        SELECT e.*, l.titulo AS livro_titulo, u.nome AS leitor_nome
        FROM emprestimos e
        JOIN livros l ON e.livro_id = l.id
        JOIN usuarios u ON e.leitor_id = u.id
    `;
    const params = [];
 
    if (leitor_id) {
        sql += ' WHERE e.leitor_id = ?';
        params.push(leitor_id);
    }
 
    conexao.query(sql, params, (erro, resultados) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ erro: 'Erro ao buscar empréstimos' });
        }
 
        const emprestimos = resultados.map((emp) => ({
            ...emp,
            status: calcularStatus(emp)
        }));
 
        res.json(emprestimos);
    });
}
 

function getEmprestimoPorId(req, res) {
    const { id } = req.params;
 
    const sql = `
        SELECT e.*, l.titulo AS livro_titulo, u.nome AS leitor_nome
        FROM emprestimos e
        JOIN livros l ON e.livro_id = l.id
        JOIN usuarios u ON e.leitor_id = u.id
        WHERE e.id = ?
    `;
 
    conexao.query(sql, [id], (erro, resultados) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ erro: 'Erro ao buscar empréstimo' });
        }
 
        if (resultados.length === 0) {
            return res.status(404).json({ erro: 'Empréstimo não encontrado' });
        }
 
        const emprestimo = resultados[0];
        emprestimo.status = calcularStatus(emprestimo);
 
        res.json(emprestimo);
    });
}
 
function postEmprestimo(req, res) {
    const { livro_id, leitor_id, data_emprestimo, data_devolucao_prevista } = req.body;
 
    if (!livro_id || !leitor_id || !data_devolucao_prevista) {
        return res.status(400).json({ erro: 'livro_id, leitor_id e data_devolucao_prevista são obrigatórios' });
    }
 
    const dataEmprestimoFinal = data_emprestimo || new Date().toISOString().split('T')[0];
 
    const sqlBuscaLivro = 'SELECT quantidade_disponivel FROM livros WHERE id = ?';
 
    conexao.query(sqlBuscaLivro, [livro_id], (erro, resultados) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ erro: 'Erro ao verificar livro' });
        }
 
        if (resultados.length === 0) {
            return res.status(404).json({ erro: 'Livro não encontrado' });
        }
 
        if (resultados[0].quantidade_disponivel <= 0) {
            return res.status(400).json({ erro: 'Não há exemplares disponíveis para este livro' });
        }
 

        const sqlInsere = `
            INSERT INTO emprestimos (livro_id, leitor_id, data_emprestimo, data_devolucao_prevista, status)
            VALUES (?, ?, ?, ?, 'ativo')
        `;
 
        conexao.query(sqlInsere, [livro_id, leitor_id, dataEmprestimoFinal, data_devolucao_prevista], (erro, resultado) => {
            if (erro) {
                console.log(erro);
                return res.status(500).json({ erro: 'Erro ao criar empréstimo' });
            }
 
            const sqlAtualizaLivro = 'UPDATE livros SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = ?';
 
            conexao.query(sqlAtualizaLivro, [livro_id], (erro) => {
                if (erro) {
                    console.log(erro);
                    return res.status(500).json({ erro: 'Empréstimo criado, mas houve erro ao atualizar o estoque' });
                }
 
                res.status(201).json({
                    id: resultado.insertId,
                    mensagem: 'Empréstimo registrado com sucesso'
                });
            });
        });
    });
}
 

function putEmprestimo(req, res) {
    const { id } = req.params;
 
    const sqlBusca = 'SELECT * FROM emprestimos WHERE id = ?';
 
    conexao.query(sqlBusca, [id], (erro, resultados) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ erro: 'Erro ao buscar empréstimo' });
        }
 
        if (resultados.length === 0) {
            return res.status(404).json({ erro: 'Empréstimo não encontrado' });
        }
 
        const emprestimo = resultados[0];
 
        if (emprestimo.status === 'devolvido') {
            return res.status(400).json({ erro: 'Este empréstimo já foi devolvido' });
        }
 
        const hoje = new Date().toISOString().split('T')[0];
 
        const sqlAtualizaEmprestimo = `
            UPDATE emprestimos
            SET status = 'devolvido', data_devolucao_real = ?
            WHERE id = ?
        `;
 
        conexao.query(sqlAtualizaEmprestimo, [hoje, id], (erro) => {
            if (erro) {
                console.log(erro);
                return res.status(500).json({ erro: 'Erro ao atualizar empréstimo' });
            }
 
            const sqlAtualizaLivro = 'UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?';
 
            conexao.query(sqlAtualizaLivro, [emprestimo.livro_id], (erro) => {
                if (erro) {
                    console.log(erro);
                    return res.status(500).json({ erro: 'Devolução registrada, mas houve erro ao atualizar o estoque' });
                }
 
                res.json({ mensagem: 'Devolução registrada com sucesso' });
            });
        });
    });
}

function deleteEmprestimo(req, res) {
    const { id } = req.params;
 
    const sqlBusca = 'SELECT * FROM emprestimos WHERE id = ?';
 
    conexao.query(sqlBusca, [id], (erro, resultados) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ erro: 'Erro ao buscar empréstimo' });
        }
 
        if (resultados.length === 0) {
            return res.status(404).json({ erro: 'Empréstimo não encontrado' });
        }
 
        const emprestimo = resultados[0];
 
        const sqlDeleta = 'DELETE FROM emprestimos WHERE id = ?';
 
        conexao.query(sqlDeleta, [id], (erro) => {
            if (erro) {
                console.log(erro);
                return res.status(500).json({ erro: 'Erro ao cancelar empréstimo' });
            }
 
            if (emprestimo.status === 'ativo') {
                const sqlAtualizaLivro = 'UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?';
                conexao.query(sqlAtualizaLivro, [emprestimo.livro_id], (erro) => {
                    if (erro) console.log(erro);
                });
            }
 
            res.json({ mensagem: 'Empréstimo cancelado com sucesso' });
        });
    });
}
 
module.exports = {
    getEmprestimos,
    getEmprestimoPorId,
    postEmprestimo,
    putEmprestimo,
    deleteEmprestimo
};