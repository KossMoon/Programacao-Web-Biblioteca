const API = 'http://localhost:3000';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-usuario-id': localStorage.getItem('usuarioId'),
    'x-perfil': 'leitor'
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
        <td><button onclick="solicitarEmprestimo(${l.id})" ${l.quantidade_disponivel <= 0 ? 'disabled' : ''}>
          Solicitar
        </button></td>
      </tr>`;
  });
}

async function solicitarEmprestimo(livro_id) {
  const hoje = new Date().toISOString().split('T')[0];
  const previsao = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  await fetch(`${API}/emprestimos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ livro_id, data_emprestimo: hoje, data_devolucao_prevista: previsao })
  });
  carregarLivros();
  carregarMeusEmprestimos();
}

async function carregarMeusEmprestimos() {
  const res = await fetch(`${API}/emprestimos`, { headers: getHeaders() });
  const emprestimos = await res.json();
  const tabela = document.getElementById('tbody-emprestimos');
  tabela.innerHTML = '';
  emprestimos.forEach(e => {
    tabela.innerHTML += `
      <tr>
        <td>${e.livro_titulo}</td>
        <td>${e.data_devolucao_prevista}</td>
        <td>${e.status}</td>
      </tr>`;
  });
}

window.onload = () => { carregarLivros(); carregarMeusEmprestimos(); };