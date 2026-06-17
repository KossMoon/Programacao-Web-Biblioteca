const express = require('express');
const app = express();

app.use(express.json());

app.use(express.static(__dirname));

app.use('/usuarios', require('../ROUTES/usuarioRoutes'));
app.use('/livros', require('../ROUTES/livroRoutes'));
app.use('/emprestimos', require('../ROUTES/emprestimoRoutes'));

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));