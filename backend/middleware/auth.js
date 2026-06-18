function verificarBibliotecario(req, res, next){
    const perfil = req.headers['x-perfil'];
    const usuarioId = req.headers['x-usuario-id'];

    if(!perfil || !usuarioId){
        return res.status(401).json({erro: 'Não autenticado.'});
    }

    if (perfil !== 'bibliotecario'){
        return res.status(403).json({erro: 'Acesso negado.'});
    }

    req.usuarioId = usuarioId;
    next();
}

function verificarLeitor(req, res, next){
    const perfil = req.headers['x-perfil'];
    const usuarioId = req.headers['x-usuario-id'];

    if(!perfil || !usuarioId){
        return res.status(401).json({erro: 'Não autenticado.'});
    }

    if (perfil !== 'leitor'){
        return res.status(403).json({erro: 'Acesso negado.'});
    }

    req.usuarioId = usuarioId;
    next();
}

function verificarAutenticado(req, res, next){
    const usuarioId = req.headers['x-usuario-id'];
    
    if(!usuarioId) return res.status(401).json({erro: 'Não autenticado.'});

    req.usuarioId = usuarioId;
    next()
}

module.exports = {verificarBibliotecario, verificarLeitor, verificarAutenticado};