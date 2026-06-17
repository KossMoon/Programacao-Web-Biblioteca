class  Usuario {
    constructor(id, nome, email, senha, perfil){
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.perfilt = perfil

    }

}

class Leitor extends Usuario {
    constructor(id, nome, email, senha, perfil) {
        super(id, nome, email, senha, perfil)
    }

}

class Bibliotecario extends Usuario {
    constructor(id, nome, email, senha, perfil) {
        super(id, nome, email, senha, perfil)
    }

}