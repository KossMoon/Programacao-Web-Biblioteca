const express = require('express');
const app = express();
const port = 3000
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/usuarios', require('./routes/usuarios'));
app.use('/livros', require('./routes/livros'));
app.use('/emprestimos', require('./routes/emprestimos'));

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));