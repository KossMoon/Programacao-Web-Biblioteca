const express = require('express')
const app = express()
const port = 3000
app.use(express.urlencoded({extended:true}))

//criar uma ação para servir arquivos estáticos (public)
app.use(express.static('public'));

//rotas (métodos: GET, POST, PUT e DELETE)
app.get('/', (req, res) => {
  //res.send('Hello World!')
  res.sendFile(__dirname + '/public/index.html');
})

app.get('/sobre', (req, res) => {
  //res.send('Página Sobre!')
  res.sendFile(__dirname + '/public/sobre.html');
});

app.post('/contato', (req, res)=>{
    const {nome, email} = req.body;
    res.send(`Dados cadastrados com sucesso: ${nome}; ${email}`);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})