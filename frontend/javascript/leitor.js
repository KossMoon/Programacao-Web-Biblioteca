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

function formatarData(data) {
  if (!data) return '—';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function badgeStatus(status) {
  const rotulos = { ativo: 'Ativo', devolvido: 'Devolvido', atrasado: 'Atrasado' };
  return `<span class="badge badge-${status}">${rotulos[status] || status}</span>`;
}

function mostrarMensagem(id, texto, tipo) {
  const el = document.getElementById(id);
  el.textContent = texto;
  el.className = `msg ${tipo}`;
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
        <td><button class="btn btn-primary" onclick="solicitarEmprestimo(${l.id})" ${l.quantidade_disponivel <= 0 ? 'disabled' : ''}>
          Solicitar
        </button></td>
      </tr>`;
  });
}

async function solicitarEmprestimo(livro_id) {
  const hoje = new Date().toISOString().split('T')[0];
  
  const previsao = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const res = await fetch(`${API}/emprestimos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ livro_id, data_emprestimo: hoje, data_devolucao_prevista: previsao })
  });
  const data = await res.json();

  if (res.ok) {
    mostrarMensagem('msg-catalogo', `Empréstimo solicitado! Devolução prevista para ${formatarData(previsao)}.`, 'sucesso');
  } else {
    mostrarMensagem('msg-catalogo', data.erro || 'Erro ao solicitar empréstimo.', 'erro');
  }

  carregarLivros();
  carregarMeusEmprestimos();
}

async function solicitarDevolucao(id) {
  const res = await fetch(`${API}/emprestimos/${id}/solicitar-devolucao`, {
    method: 'PUT',
    headers: getHeaders()
  });
  const data = await res.json();

  if (res.ok) {
    mostrarMensagem('msg-emprestimo', 'Solicitação de devolução enviada ao bibliotecário.', 'sucesso');
  } else {
    mostrarMensagem('msg-emprestimo', data.erro || 'Erro ao solicitar devolução.', 'erro');
  }

  carregarMeusEmprestimos();
}

async function carregarMeusEmprestimos() {
  const res = await fetch(`${API}/emprestimos`, { headers: getHeaders() });
  const emprestimos = await res.json();
  const tabela = document.getElementById('tbody-emprestimos');
  tabela.innerHTML = '';

  if (emprestimos.length === 0) {
    tabela.innerHTML = '<tr><td colspan="5" class="vazio">Você ainda não possui empréstimos.</td></tr>';
    return;
  }

  emprestimos.forEach(e => {
    let acao = '—';

    if (e.status === 'ativo' || e.status === 'atrasado') {
      if (e.devolucao_solicitada) {
        acao = `<button class="btn btn-warning" disabled>Solicitação enviada</button>`;
      } else {
        acao = `<button class="btn btn-warning" onclick="solicitarDevolucao(${e.id})">Solicitar devolução</button>`;
      }
    }

    tabela.innerHTML += `
      <tr>
        <td>${e.livro_titulo}</td>
        <td>${formatarData(e.data_emprestimo)}</td>
        <td>${formatarData(e.data_devolucao_prevista)}</td>
        <td>${badgeStatus(e.status)}</td>
        <td>${acao}</td>
      </tr>`;
  });
}

window.onload = () => { carregarLivros(); carregarMeusEmprestimos(); };