CREATE DATABASE biblioteca;
USE biblioteca;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('bibliotecario', 'leitor') NOT NULL
);

CREATE TABLE livros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(150) NOT NULL,
    ano_publicacao INT,
    quantidade_disponivel INT NOT NULL CHECK (quantidade_disponivel >= 0)
);

CREATE TABLE emprestimos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    livro_id INT NOT NULL,
    leitor_id INT NOT NULL,

    data_emprestimo DATE NOT NULL,
    data_devolucao_prevista DATE NOT NULL,
    data_devolucao_real DATE NULL,

    status ENUM('ativo', 'devolvido', 'atrasado') NOT NULL DEFAULT 'ativo',

    CONSTRAINT fk_emprestimo_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emprestimo_leitor
        FOREIGN KEY (leitor_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);