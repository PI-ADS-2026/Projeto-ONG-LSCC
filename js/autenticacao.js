// Chaves utilizadas no localStorage.
const CHAVE_USUARIOS = "usuarios";
const CHAVE_SESSAO = "usuarioLogado";

// Recupera os usuários cadastrados.
function obterUsuarios() {
  return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
}

// Cadastra um novo usuário.
function cadastrarUsuario(nome, cpf, email, senha) {
  const usuarios = obterUsuarios();

  // Verifica se já existe uma conta com esse e-mail.
  const emailExistente = usuarios.some(
    (usuario) => usuario.email.toLowerCase() === email.toLowerCase(),
  );

  if (emailExistente) {
    return {
      sucesso: false,
      mensagem: "Este e-mail já está cadastrado.",
    };
  }

  // Verifica se já existe uma conta com esse CPF.
  const cpfExistente = usuarios.some((usuario) => usuario.cpf === cpf);

  if (cpfExistente) {
    return {
      sucesso: false,
      mensagem: "Este CPF já está cadastrado.",
    };
  }

  const novoUsuario = {
    id: crypto.randomUUID(),
    nome,
    cpf,
    email: email.toLowerCase(),
    senha,
  };

  usuarios.push(novoUsuario);

  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));

  return {
    sucesso: true,
    mensagem: "Usuário cadastrado com sucesso!",
  };
}

// Realiza o login do usuário.
function fazerLogin(email, senha) {
  const usuarios = obterUsuarios();

  const usuario = usuarios.find(
    (usuario) =>
      usuario.email === email.toLowerCase() && usuario.senha === senha,
  );

  if (!usuario) {
    return {
      sucesso: false,
      mensagem: "E-mail ou senha incorretos.",
    };
  }

  // Guarda os dados do usuário conectado.
  localStorage.setItem(
    CHAVE_SESSAO,
    JSON.stringify({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    }),
  );

  return {
    sucesso: true,
    mensagem: "Login realizado com sucesso!",
  };
}

// Recupera os dados do usuário conectado.
function obterUsuarioLogado() {
  return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
}

// Encerra a sessão atual.
function sairDaConta() {
  localStorage.removeItem(CHAVE_SESSAO);
}

// Redefine a senha de um usuário cadastrado pelo e-mail.
function redefinirSenhaPorEmail(email, novaSenha) {
  const usuarios = obterUsuarios();
  const emailNormalizado = email.toLowerCase();

  const indiceUsuario = usuarios.findIndex(
    (usuario) => usuario.email === emailNormalizado,
  );

  if (indiceUsuario === -1) {
    return {
      sucesso: false,
      mensagem: "Nenhuma conta encontrada com este e-mail.",
    };
  }

  usuarios[indiceUsuario] = {
    ...usuarios[indiceUsuario],
    senha: novaSenha,
  };

  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));

  return {
    sucesso: true,
    mensagem: "Senha redefinida com sucesso! Faça login novamente.",
  };
} 
// <--- A função redefinirSenhaPorEmail fecha corretamente aqui!

// ==========================================
// MÁSCARA E VALIDAÇÃO DE CPF (FORA DAS FUNÇÕES)
// ==========================================

// --- 1. MÁSCARA AUTOMÁTICA NO CAMPO DE CPF (Apenas se o input existir na página) ---
const inputCpf = document.getElementById("cpf");

if (inputCpf) {
  inputCpf.addEventListener("input", function (e) {
    let valor = e.target.value;

    valor = valor.replace(/\D/g, "");

    if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    e.target.value = valor;
  });
}

// --- 2. FUNÇÃO DE VALIDAÇÃO MATEMÁTICA DO CPF ---
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

// --- 3. INTEGRAÇÃO NO EVENTO DE SUBMIT (Apenas na página de cadastro) ---
const formCadastro = document.getElementById("form-cadastro");

if (formCadastro) {
  formCadastro.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmar-senha").value;

    if (!validarCPF(cpf)) {
      alert("CPF inválido! Por favor, digite um CPF real para continuar.");
      document.getElementById("cpf").focus();
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    const resultado = cadastrarUsuario(nome, cpf, email, senha);

    if (!resultado.sucesso) {
      alert(resultado.mensagem);
      return;
    }

    alert(resultado.mensagem);
    window.location.href = "../pages/entrar.html";
  });
}