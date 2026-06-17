const Usuario = require('./Usuario');
class Bibliotecario extends Usuario {
    constructor(id, nome, email, senha) {
        super(id, nome, email, senha, bibliotecario)
    }

}module.exports = Bibliotecario;