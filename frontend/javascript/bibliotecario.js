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

let livrosCache = [];

async function carregarLivros() {
  const res = await fetch(`${API}/livros`);
  const livros = await res.json();
  livrosCache = livros;

  const tabela = document.getElementById('tbody-livros');
  tabela.innerHTML = '';

  if (livros.length === 0) {
    tabela.innerHTML = '<tr><td colspan="6" class="vazio">Nenhum livro cadastrado.</td></tr>';
    return;
  }

  livros.forEach(l => {
    tabela.innerHTML += `
      <tr>
        <td>${l.id}</td><td>${l.titulo}</td><td>${l.autor}</td>
        <td>${l.ano_publicacao || '—'}</td><td>${l.quantidade_disponivel}</td>
        <td class="acoes">
          <button class="btn btn-edit btn-sm" onclick="abrirModalEdicao(${l.id})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="removerLivro(${l.id})">Excluir</button>
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
  const res = await fetch(`${API}/livros`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
  const data = await res.json();

  if (res.ok) {
    mostrarMensagem('msg-livro', data.mensagem, 'sucesso');
    document.getElementById('novo-titulo').value = '';
    document.getElementById('novo-autor').value = '';
    document.getElementById('novo-ano').value = '';
    document.getElementById('novo-qtd').value = '';
  } else {
    mostrarMensagem('msg-livro', data.erro || 'Erro ao cadastrar livro.', 'erro');
  }

  carregarLivros();
}

async function removerLivro(id) {
  await fetch(`${API}/livros/${id}`, { method: 'DELETE', headers: getHeaders() });
  carregarLivros();
}

function abrirModalEdicao(id) {
  const livro = livrosCache.find(l => l.id === id);
  if (!livro) return;

  document.getElementById('edit-id').value = livro.id;
  document.getElementById('edit-titulo').value = livro.titulo;
  document.getElementById('edit-autor').value = livro.autor;
  document.getElementById('edit-ano').value = livro.ano_publicacao || '';
  document.getElementById('edit-qtd').value = livro.quantidade_disponivel;

  document.getElementById('modal-overlay').classList.add('ativo');
}

function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('ativo');
}

async function salvarEdicao() {
  const id = document.getElementById('edit-id').value;
  const body = {
    titulo: document.getElementById('edit-titulo').value,
    autor: document.getElementById('edit-autor').value,
    ano_publicacao: document.getElementById('edit-ano').value,
    quantidade_disponivel: document.getElementById('edit-qtd').value
  };

  const res = await fetch(`${API}/livros/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  const data = await res.json();

  if (res.ok) {
    mostrarMensagem('msg-livro', data.mensagem, 'sucesso');
    fecharModal();
    carregarLivros();
  } else {
    mostrarMensagem('msg-livro', data.erro || 'Erro ao atualizar livro.', 'erro');
  }
}

async function carregarEmprestimos() {
  const res = await fetch(`${API}/emprestimos`, { headers: getHeaders() });
  const emprestimos = await res.json();
  const tabela = document.getElementById('tbody-emprestimos');
  tabela.innerHTML = '';

  const ativos = emprestimos.filter(e => e.status === 'ativo' || e.status === 'atrasado');

  if (ativos.length === 0) {
    tabela.innerHTML = '<tr><td colspan="7" class="vazio">Nenhum empréstimo ativo.</td></tr>';
    return;
  }

  ativos.forEach(e => {
    const solicitacao = e.devolucao_solicitada
      ? '<span class="badge badge-atrasado">Solicitada</span>'
      : '<span class="badge badge-ativo" style="opacity:.6">Sem solicitação</span>';

    const botaoAprovar = e.devolucao_solicitada
      ? `<button class="btn btn-success btn-sm" onclick="aprovarDevolucao(${e.id}, ${e.livro_id})">Aprovar devolução</button>`
      : `<button class="btn btn-success btn-sm" disabled title="Aguardando o leitor solicitar a devolução">Aprovar devolução</button>`;

    tabela.innerHTML += `
      <tr>
        <td>${e.leitor_nome}</td><td>${e.livro_titulo}</td>
        <td>${formatarData(e.data_emprestimo)}</td><td>${formatarData(e.data_devolucao_prevista)}</td>
        <td>${badgeStatus(e.status)}</td>
        <td>${solicitacao}</td>
        <td>${botaoAprovar}</td>
      </tr>`;
  });
}

async function aprovarDevolucao(id, livro_id) {
  const hoje = new Date().toISOString().split('T')[0];
  const res = await fetch(`${API}/emprestimos/${id}/devolver`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ data_devolucao_real: hoje, livro_id })
  });
  const data = await res.json();

  if (res.ok) {
    mostrarMensagem('msg-emprestimo', data.mensagem, 'sucesso');
  } else {
    mostrarMensagem('msg-emprestimo', data.erro || 'Erro ao registrar devolução.', 'erro');
  }

  carregarEmprestimos();
  carregarLivros();
  carregarHistorico();
}

async function carregarHistorico() {
  const res = await fetch(`${API}/emprestimos`, { headers: getHeaders() });
  const emprestimos = await res.json();
  const tabela = document.getElementById('tbody-historico');
  tabela.innerHTML = '';

  const historico = emprestimos.filter(e => e.status === 'devolvido');

  if (historico.length === 0) {
    tabela.innerHTML = '<tr><td colspan="7" class="vazio">Nenhum empréstimo no histórico ainda.</td></tr>';
    return;
  }

  historico.forEach(e => {
    tabela.innerHTML += `
      <tr>
        <td>${e.leitor_nome}</td><td>${e.livro_titulo}</td>
        <td>${formatarData(e.data_emprestimo)}</td><td>${formatarData(e.data_devolucao_prevista)}</td>
        <td>${formatarData(e.data_devolucao_real)}</td>
        <td>${badgeStatus(e.status)}</td>
        <td>
          <select class="btn-sm" onchange="alterarStatus(${e.id}, this.value)">
            <option value="">Alterar...</option>
            <option value="ativo">Ativo</option>
            <option value="devolvido">Devolvido</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </td>
      </tr>`;
  });
}

async function alterarStatus(id, novoStatus) {
  if (!novoStatus) return;

  const res = await fetch(`${API}/emprestimos/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status: novoStatus })
  });
  const data = await res.json();

  if (res.ok) {
    mostrarMensagem('msg-emprestimo', data.mensagem, 'sucesso');
  } else {
    mostrarMensagem('msg-emprestimo', data.erro || 'Erro ao alterar status.', 'erro');
  }

  carregarEmprestimos();
  carregarHistorico();
}

window.onload = () => { carregarLivros(); carregarEmprestimos(); carregarHistorico(); };