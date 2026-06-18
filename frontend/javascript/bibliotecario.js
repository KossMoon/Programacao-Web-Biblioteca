const API = 'http://localhost:3000';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-usuario-id': localStorage.getItem('usuarioId'),
    'x-perfil': 'bibliotecario'
  };
}

function sair() {
  localStorage.clear();
  window.location.href = '/index.html';
}

async function carregarLivros() {
  const res = await fetch(`${API}/livros`);
  const livros = await res.json();
  const tabela = document.getElementById('tbody-livros');
  tabela.innerHTML = '';
  livros.forEach(l => {
    tabela.innerHTML += `
      <tr>
        <td>${l.id}</td><td>${l.titulo}</td><td>${l.autor}</td>
        <td>${l.ano_publicacao || '—'}</td><td>${l.quantidade_disponivel}</td>
        <td>
          <button onclick="removerLivro(${l.id})">Excluir</button>
        </td>
      </tr>`;
  });
}

async function adicionarLivro() {
  const body = {
    titulo: document.getElementById('novo-titulo').value, 
    autor: document.getElementById('novo-autor').value,   
    ano_publicacao: document.getElementById('novo-ano').value,
    quantidade_disponivel: document.getElementById('novo-qtd').value
  };
  await fetch(`${API}/livros`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
  carregarLivros();
}

async function removerLivro(id) {
  await fetch(`${API}/livros/${id}`, { method: 'DELETE', headers: getHeaders() });
  carregarLivros();
}

async function carregarEmprestimos() {
  const res = await fetch(`${API}/emprestimos`, { headers: getHeaders() });
  const emprestimos = await res.json();
  const tabela = document.getElementById('tbody-emprestimos');
  tabela.innerHTML = '';

  const ativos = emprestimos.filter(e => e.status === 'ativo' || e.status === 'atrasado');

  if (ativos.length === 0) {
    tabela.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#888">Nenhum empréstimo ativo.</td></tr>';
    return;
  }

  ativos.forEach(e => {
    tabela.innerHTML += `
      <tr>
        <td>${e.leitor_nome}</td><td>${e.livro_titulo}</td>
        <td>${e.data_emprestimo}</td><td>${e.data_devolucao_prevista}</td>
        <td>${e.status}</td>
        <td><button onclick="aprovarDevolucao(${e.id}, ${e.livro_id})">Aprovar devolução</button></td>
      </tr>`;
  });
}

async function aprovarDevolucao(id, livro_id) {
  const hoje = new Date().toISOString().split('T')[0];
  await fetch(`${API}/emprestimos/${id}/devolver`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ data_devolucao_real: hoje, livro_id })
  });
  carregarEmprestimos();
  carregarLivros();
}

window.onload = () => { carregarLivros(); carregarEmprestimos(); };