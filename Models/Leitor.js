const Usuario = require('./Usuario');
class Leitor extends Usuario {
    constructor(id, nome, email, senha) {
        super(id, nome, email, senha, leitor)
    }

}module.exports = Usuario;