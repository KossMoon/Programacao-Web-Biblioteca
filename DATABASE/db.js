const mysql = require('mysql2');


const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Marco0306',
    database: 'biblioteca'
});

conexao.connect((erro)=>{
    if(erro)
        console.log(erro);
    else
        console.log("Banco conectado!");
});

module.exports = conexao;