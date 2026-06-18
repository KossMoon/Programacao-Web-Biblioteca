# Sistema de Gerenciamento de Biblioteca

Trabalho final como requisito parcial para aprovação da disciplina **Programação Web** no curso de **Ciência da Computação** na **Universidade Católica de Brasília (UCB)**. 

## Autores:
### Elise Akie Sugiyama
### Marco Antônio Moreira Gonçalves 

---

## Objetivo: 
Sistema web para gerenciamento de empréstimos de livros, com controle de permissões para bibliotecários e leitores.

---

## Tecnologias

- **Backend:** Node.js + Express
- **Banco de dados:** MySQL
- **Frontend:** HTML, CSS e JavaScript

---

## Estrutura do projeto

```
projeto-biblioteca/
├── banco/
│   └── banco.sql               # Script de criação do banco de dados
├── backend/
│   ├── server.js               # Inicializa o servidor Express
│   ├── db.js                   # Conexão com o banco de dados
│   ├── middleware/
│   │   └── auth.js             # Verificação de perfil e autenticação
│   └── routes/
│       ├── usuarios.js         # Rotas de cadastro e login
│       ├── livros.js           # Rotas de gerenciamento de livros
│       └── emprestimos.js      # Rotas de empréstimos e devoluções
├── frontend/
│   ├── index.html              # Tela de login e cadastro
│   ├── bibliotecario.html      # Painel do bibliotecário
│   ├── leitor.html             # Painel do leitor
│   └── js/
│       ├── index.js
│       ├── bibliotecario.js
│       └── leitor.js
└── package.json
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) (^18)
- [MySQL](https://www.mysql.com/) (^3.22.5)
- [Express](https://expressjs.com/) (^5.2.1)

---

## Instalação e execução

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/projeto-biblioteca.git
cd projeto-biblioteca
```

### 2. Criar o banco de dados

Com o MySQL rodando, execute o script SQL uma única vez:

```bash
mysql -u root -p < banco/banco.sql
```

Ou abra o arquivo `banco/banco.sql` no MySQL Workbench e execute manualmente.

### 3. Configurar a conexão

Abra o arquivo `backend/db.js` e ajuste as credenciais conforme o seu ambiente:

```js
const conexao = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sua_senha',
  database: 'biblioteca'
});
```

### 4. Instalar as dependências

```bash
npm install
```

### 5. Iniciar o servidor

```bash
node server.js
```

O servidor estará disponível em `http://localhost:3000`.

---

## Funcionalidades

### Bibliotecário
- Cadastrar, editar e remover livros do acervo
- Visualizar todos os empréstimos ativos
- Aprovar devoluções de livros

### Leitor
- Visualizar o catálogo de livros disponíveis
- Solicitar empréstimo de um livro
- Acompanhar seus empréstimos e status

---

## Rotas da API

### Usuários

| Método | Rota                  | Descrição              | Autenticação |
|--------|-----------------------|------------------------|--------------|
| POST   | `/usuarios/cadastro`  | Cadastrar novo usuário | Não          |
| POST   | `/usuarios/login`     | Fazer login            | Não          |

### Livros

| Método | Rota          | Descrição              | Autenticação    |
|--------|---------------|------------------------|-----------------|
| GET    | `/livros`     | Listar todos os livros | Não             |
| POST   | `/livros`     | Cadastrar livro        | Bibliotecário   |
| PUT    | `/livros/:id` | Atualizar livro        | Bibliotecário   |
| DELETE | `/livros/:id` | Remover livro          | Bibliotecário   |

### Empréstimos

| Método | Rota                          | Descrição                    | Autenticação    |
|--------|-------------------------------|------------------------------|-----------------|
| GET    | `/emprestimos`                | Listar empréstimos           | Autenticado     |
| POST   | `/emprestimos`                | Solicitar empréstimo         | Leitor          |
| PUT    | `/emprestimos/:id/devolver`   | Registrar devolução          | Bibliotecário   |

---

## Regras de negócio

- Apenas bibliotecários podem adicionar, editar ou remover livros.
- Apenas leitores podem solicitar empréstimos.
- Ao criar um empréstimo, a quantidade disponível do livro é decrementada automaticamente.
- Ao registrar uma devolução, a quantidade disponível é incrementada automaticamente.
- O prazo padrão de devolução é de 14 dias a partir da data do empréstimo.