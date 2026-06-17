const conexao = require('../DATABASE/db');
 
function postUsuario(req, res) {
    const { nome, email, senha, perfil } = req.body;
 
    if (!nome || !email || !senha || !perfil) {
        return res.status(400).json({ erro: 'Nome, email, senha e perfil são obrigatórios' });
    }
 
    if (perfil !== 'bibliotecario' && perfil !== 'leitor') {
        return res.status(400).json({ erro: "Perfil deve ser 'bibliotecario' ou 'leitor'" });
    }
 
    const sqlVerifica = 'SELECT id FROM usuarios WHERE email = ?';
 
    conexao.query(sqlVerifica, [email], (erro, resultados) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ erro: 'Erro ao verificar email' });
        }
 
        if (resultados.length > 0) {
            return res.status(400).json({ erro: 'Este email já está cadastrado' });
        }
 
        const sqlInsere = 'INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)';
 
        conexao.query(sqlInsere, [nome, email, senha, perfil], (erro, resultado) => {
            if (erro) {
                console.log(erro);
                return res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
            }
 
            res.status(201).json({
                id: resultado.insertId,
                mensagem: 'Usuário cadastrado com sucesso'
            });
        });
    });
}
 
function loginUsuario(req, res) {
    const { email, senha } = req.body;
 
    if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }
 
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
 
    conexao.query(sql, [email], (erro, resultados) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ erro: 'Erro ao realizar login' });
        }
 
        if (resultados.length === 0) {
            return res.status(401).json({ erro: 'Email ou senha inválidos' });
        }
 
        const usuario = resultados[0];
 
        if (usuario.senha !== senha) {
            return res.status(401).json({ erro: 'Email ou senha inválidos' });
        }
 
        res.json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        });
    });
}
 
module.exports = {
    postUsuario,
    loginUsuario
};