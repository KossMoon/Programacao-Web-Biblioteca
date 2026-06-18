const API = 'http://localhost:3000';

function trocarAba(aba) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('painel-' + aba).classList.add('active');
  event.target.classList.add('active');
}

async function cadastrar() {
  const nomeInput  = document.getElementById('cad-nome');
  const emailInput = document.getElementById('cad-email');
  const senhaInput = document.getElementById('cad-senha');

  const nome   = nomeInput.value.trim();
  const email  = emailInput.value.trim();
  const senha  = senhaInput.value.trim();
  const perfil = document.getElementById('cad-perfil').value;
  
  [nomeInput, emailInput, senhaInput].forEach(el => {
    el.style.borderColor = '';
    el.placeholder = el.dataset.placeholder;
  });

  let valido = true;

  if (!nome) {
    nomeInput.style.borderColor = '#c0392b';
    nomeInput.placeholder = 'Obrigatório';
    valido = false;
  }
  if (!email) {
    emailInput.style.borderColor = '#c0392b';
    emailInput.placeholder = 'Obrigatório';
    valido = false;
  }
  if (!senha) {
    senhaInput.style.borderColor = '#c0392b';
    senhaInput.placeholder = 'Obrigatório';
    valido = false;
  }

  if (!valido) return;

  const res = await fetch(`${API}/usuarios/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha, perfil })
  });

  const data = await res.json();
  const msg = document.getElementById('msg-cadastro');
  msg.textContent = data.mensagem || data.erro;
  msg.className = 'msg ' + (res.ok ? 'sucesso' : 'erro');

  if (res.ok) {
    nomeInput.value = '';
    emailInput.value = '';
    senhaInput.value = '';
  }
}

async function login() {
  const emailInput = document.getElementById('login-email');
  const senhaInput = document.getElementById('login-senha');
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  emailInput.style.borderColor = '';
  senhaInput.style.borderColor = '';
  emailInput.placeholder = emailInput.dataset.placeholder;
  senhaInput.placeholder = senhaInput.dataset.placeholder;

  let valido = true;

  if (!email) {
    emailInput.style.borderColor = '#c0392b';
    emailInput.placeholder = 'Obrigatório';
    valido = false;
  }
  if (!senha) {
    senhaInput.style.borderColor = '#c0392b';
    senhaInput.placeholder = 'Obrigatório';
    valido = false;
  }

  if (!valido) return;

  const res = await fetch(`${API}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem('usuarioId', data.id);
    localStorage.setItem('perfil', data.perfil);
    localStorage.setItem('nome', data.nome);

    if (data.perfil === 'bibliotecario') {
      window.location.href = '/bibliotecario.html';
    } else {
      window.location.href = '/leitor.html';
    }
  } else {
    const msg = document.getElementById('msg-login');
    msg.textContent = data.erro;
    msg.className = 'msg erro';
  }
}

document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('login-email').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') login();
  });
  document.getElementById('login-senha').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') login();
  });

  document.getElementById('cad-nome').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') cadastrar();
  });
  document.getElementById('cad-email').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') cadastrar();
  });
  document.getElementById('cad-senha').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') cadastrar();
  });

  document.getElementById('login-email').addEventListener('input', (e) => {
    e.target.style.borderColor = '';
    e.target.placeholder = e.target.dataset.placeholder;
  });
  document.getElementById('login-senha').addEventListener('input', (e) => {
    e.target.style.borderColor = '';
    e.target.placeholder = e.target.dataset.placeholder;
  });

  ['cad-nome', 'cad-email', 'cad-senha'].forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
      e.target.style.borderColor = '';
      e.target.placeholder = e.target.dataset.placeholder;
    });
  });
});