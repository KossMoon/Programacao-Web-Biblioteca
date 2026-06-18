const mysql = require('mysql2');

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'senha',  // senha
    database: 'biblioteca', // nome do banco de dados
    port: '3306' // pode ser outro
});

conexao.connect((erro)=>{
    if(erro)
        console.log(erro);
    else
        console.log("Banco de dados conectado!");
});

module.exports = conexao;