// Chaves utilizadas no localStorage.
const CHAVE_USUARIOS = 'usuarios';
const CHAVE_SESSAO = 'usuarioLogado';
const CHAVE_TEMA = 'tema_clinica';


// Recupera os usuários cadastrados.
function obterUsuarios() {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
}


// Valida o CPF matematicamente.
function validarCPF(cpf) {
    cpf = (cpf || '').replace(/[^\d]+/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10), 10)) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11), 10)) return false;

    return true;
}


// Valida telefone opcional: vazio é válido; se preenchido, exige pelo menos 10 dígitos.
function validarTelefoneOpcional(telefone) {
    const texto = (telefone || '').trim();
    const digitos = texto.replace(/\D/g, '');

    if (digitos !== '' && digitos.length < 10) {
        return {
            valido: false,
            mensagem: 'Informe um telefone com DDD válido (mínimo 10 dígitos).'
        };
    }

    return {
        valido: true,
        valor: texto
    };
}


// Cadastra um novo usuário (com validação de CPF e telefone opcional).
function cadastrarUsuario(nome, cpf, email, senha, telefone = '') {
    if (!validarCPF(cpf)) {
        return {
            sucesso: false,
            mensagem: 'CPF inválido! Por favor, digite um CPF real.'
        };
    }

    const usuarios = obterUsuarios();

    const emailExistente = usuarios.some(
        usuario => usuario.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExistente) {
        return {
            sucesso: false,
            mensagem: 'Este e-mail já está cadastrado.'
        };
    }

    const cpfExistente = usuarios.some(
        usuario => usuario.cpf === cpf
    );

    if (cpfExistente) {
        return {
            sucesso: false,
            mensagem: 'Este CPF já está cadastrado.'
        };
    }

    const validacaoTelefone = validarTelefoneOpcional(telefone);
    if (!validacaoTelefone.valido) {
        return {
            sucesso: false,
            mensagem: validacaoTelefone.mensagem
        };
    }

    const novoUsuario = {
        id: crypto.randomUUID(),
        nome,
        cpf,
        email: email.toLowerCase(),
        senha,
        telefone: validacaoTelefone.valor
    };

    usuarios.push(novoUsuario);

    localStorage.setItem(
        CHAVE_USUARIOS,
        JSON.stringify(usuarios)
    );

    return {
        sucesso: true,
        mensagem: 'Usuário cadastrado com sucesso!'
    };
}


// Realiza o login do usuário.
function fazerLogin(email, senha) {
    const usuarios = obterUsuarios();

    const usuario = usuarios.find(
        usuario =>
            usuario.email === email.toLowerCase() &&
            usuario.senha === senha
    );

    if (!usuario) {
        return {
            sucesso: false,
            mensagem: 'E-mail ou senha incorretos.'
        };
    }

    localStorage.setItem(
        CHAVE_SESSAO,
        JSON.stringify({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        })
    );

    return {
        sucesso: true,
        mensagem: 'Login realizado com sucesso!'
    };
}


// Recupera os dados da sessão do usuário conectado.
function obterUsuarioLogado() {
    return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
}


// Busca o registro completo do usuário logado na lista de usuários.
function obterDadosCompletosUsuarioLogado() {
    const sessao = obterUsuarioLogado();
    if (!sessao) return null;

    const usuarios = obterUsuarios();
    return usuarios.find(u => u.id === sessao.id) || null;
}


// Atualiza os dados cadastrais da conta do usuário autenticado.
function atualizarDadosConta(novosDados) {
    const sessao = obterUsuarioLogado();
    if (!sessao) {
        return {
            sucesso: false,
            mensagem: 'Sessão expirada. Faça login novamente.'
        };
    }

    const nome = (novosDados.nome || '').trim();
    const cpf = (novosDados.cpf || '').trim();
    const email = (novosDados.email || '').trim().toLowerCase();

    if (!nome || !cpf || !email) {
        return {
            sucesso: false,
            mensagem: 'Preencha nome, CPF e e-mail.'
        };
    }

    if (!validarCPF(cpf)) {
        return {
            sucesso: false,
            mensagem: 'CPF inválido! Por favor, digite um CPF real.'
        };
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
        return {
            sucesso: false,
            mensagem: 'Informe um e-mail válido.'
        };
    }

    const validacaoTelefone = validarTelefoneOpcional(novosDados.telefone);
    if (!validacaoTelefone.valido) {
        return {
            sucesso: false,
            mensagem: validacaoTelefone.mensagem
        };
    }

    const usuarios = obterUsuarios();
    const indice = usuarios.findIndex(u => u.id === sessao.id);

    if (indice === -1) {
        return {
            sucesso: false,
            mensagem: 'Usuário não encontrado.'
        };
    }

    const emailEmUso = usuarios.some(
        u => u.id !== sessao.id && u.email.toLowerCase() === email
    );
    if (emailEmUso) {
        return {
            sucesso: false,
            mensagem: 'Este e-mail já está em uso por outra conta.'
        };
    }

    const cpfEmUso = usuarios.some(
        u => u.id !== sessao.id && u.cpf === cpf
    );
    if (cpfEmUso) {
        return {
            sucesso: false,
            mensagem: 'Este CPF já está cadastrado em outra conta.'
        };
    }

    const usuarioAtual = usuarios[indice];

    usuarios[indice] = {
        ...usuarioAtual,
        nome,
        cpf,
        email,
        telefone: validacaoTelefone.valor
    };

    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));

    localStorage.setItem(
        CHAVE_SESSAO,
        JSON.stringify({
            id: usuarioAtual.id,
            nome,
            email
        })
    );

    return {
        sucesso: true,
        mensagem: 'Dados da conta atualizados com sucesso!'
    };
}


// Redefine a senha de um usuário cadastrado a partir do e-mail.
function redefinirSenhaPorEmail(email, novaSenha, confirmarSenha) {
    const emailLimpo = (email || '').trim().toLowerCase();
    const senhaNova = (novaSenha || '').trim();

    if (!emailLimpo || !senhaNova) {
        return {
            sucesso: false,
            mensagem: 'Preencha o e-mail e a nova senha.'
        };
    }

    if (confirmarSenha !== undefined && senhaNova !== String(confirmarSenha).trim()) {
        return {
            sucesso: false,
            mensagem: 'As senhas não coincidem!'
        };
    }

    if (senhaNova.length < 4) {
        return {
            sucesso: false,
            mensagem: 'A nova senha deve ter pelo menos 4 caracteres.'
        };
    }

    const usuarios = obterUsuarios();
    const indice = usuarios.findIndex(
        u => (u.email || '').toLowerCase() === emailLimpo
    );

    if (indice === -1) {
        return {
            sucesso: false,
            mensagem: 'Nenhuma conta encontrada com este e-mail.'
        };
    }

    usuarios[indice] = {
        ...usuarios[indice],
        senha: senhaNova
    };

    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));

    return {
        sucesso: true,
        mensagem: 'Senha redefinida com sucesso!'
    };
}


// Encerra a sessão atual.
function sairDaConta() {
    localStorage.removeItem(CHAVE_SESSAO);
}


// Atualiza rotação da setinha do perfil.
function atualizarRotacaoSeta(iconeSeta, aberto) {
    if (!iconeSeta) return;
    iconeSeta.style.transition = 'transform 0.2s ease';
    iconeSeta.style.transform = aberto ? 'rotate(180deg)' : 'rotate(0deg)';
}


// Configura um par botão + menu suspenso sem duplicar eventos.
function configurarDropdown(botao, menu, iconeSeta) {
    if (!botao || !menu) return;

    function fechar() {
        menu.classList.remove('aberto');
        botao.setAttribute('aria-expanded', 'false');
        if (iconeSeta) {
            atualizarRotacaoSeta(iconeSeta, false);
        }
    }

    if (botao.dataset.dropdownInicializado !== 'true') {
        botao.dataset.dropdownInicializado = 'true';

        botao.addEventListener('click', function (event) {
            event.stopPropagation();

            document.querySelectorAll('.topo .menu-suspenso.aberto').forEach(menuAberto => {
                if (menuAberto !== menu) {
                    menuAberto.classList.remove('aberto');
                    const wrapper = menuAberto.closest('.menu-dropdown-wrapper');
                    const outroBotao = wrapper ? wrapper.querySelector('button[aria-expanded]') : null;
                    if (outroBotao) {
                        outroBotao.setAttribute('aria-expanded', 'false');
                    }
                    const outraSeta = wrapper ? wrapper.querySelector('.fa-chevron-down') : null;
                    if (outraSeta) {
                        atualizarRotacaoSeta(outraSeta, false);
                    }
                }
            });

            const vaiAbrir = !menu.classList.contains('aberto');
            menu.classList.toggle('aberto', vaiAbrir);
            botao.setAttribute('aria-expanded', String(vaiAbrir));
            if (iconeSeta) {
                atualizarRotacaoSeta(iconeSeta, vaiAbrir);
            }
        });
    }

    return fechar;
}


// Padroniza nome do usuário, menus da setinha e da engrenagem, e ações de conta.
function inicializarTopoAutenticado() {
    const usuario = obterUsuarioLogado();

    if (!usuario) {
        window.location.href = '../pages/entrar.html';
        return;
    }

    const spanNome = document.getElementById('nome-usuario');
    if (spanNome && usuario.nome) {
        spanNome.textContent = `Olá, ${usuario.nome}`;
    }

    const btnPerfil = document.getElementById('btn-menu-conta') || document.querySelector('.usuario-perfil');
    const menuConta = document.getElementById('menu-conta');
    const iconeSeta = btnPerfil ? btnPerfil.querySelector('.fa-chevron-down') : null;

    const btnConfig = document.getElementById('btn-menu-config') || document.querySelector('.btn-configuracoes');
    const menuConfig = document.getElementById('menu-config');

    const fecharConta = configurarDropdown(btnPerfil, menuConta, iconeSeta);
    const fecharConfig = configurarDropdown(btnConfig, menuConfig, null);

    if (document.body.dataset.topoEventosGlobais !== 'true') {
        document.body.dataset.topoEventosGlobais = 'true';

        document.addEventListener('click', function (event) {
            if (menuConta && menuConta.classList.contains('aberto')) {
                const clicouDentro = menuConta.contains(event.target) || (btnPerfil && btnPerfil.contains(event.target));
                if (!clicouDentro && fecharConta) fecharConta();
            }

            if (menuConfig && menuConfig.classList.contains('aberto')) {
                const clicouDentro = menuConfig.contains(event.target) || (btnConfig && btnConfig.contains(event.target));
                if (!clicouDentro && fecharConfig) fecharConfig();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                if (fecharConta) fecharConta();
                if (fecharConfig) fecharConfig();
            }
        });
    }

    const btnTrocarConta = document.getElementById('btn-trocar-conta');
    if (btnTrocarConta && btnTrocarConta.dataset.inicializado !== 'true') {
        btnTrocarConta.dataset.inicializado = 'true';
        btnTrocarConta.addEventListener('click', function () {
            sairDaConta();
            window.location.href = '../pages/entrar.html';
        });
    }

    const btnSair = document.getElementById('btn-sair');
    if (btnSair && btnSair.dataset.inicializado !== 'true') {
        btnSair.dataset.inicializado = 'true';
        btnSair.addEventListener('click', function () {
            sairDaConta();
            window.location.href = '../pages/index.html';
        });
    }
}


// ==========================================
// TEMA (MODO CLARO / MODO ESCURO)
// ==========================================
function sincronizarBotaoTema() {
    const escuroAtivo = document.body.classList.contains('modo-escuro');
    const textoTema = document.getElementById('texto-modo-escuro');
    if (textoTema) {
        textoTema.textContent = escuroAtivo ? 'Modo claro' : 'Modo escuro';
    }
}

function aplicarTemaSalvo() {
    const tema = localStorage.getItem(CHAVE_TEMA);
    document.body.classList.toggle('modo-escuro', tema === 'escuro');
    sincronizarBotaoTema();
}

function alternarModoEscuro() {
    const ativado = document.body.classList.toggle('modo-escuro');
    localStorage.setItem(CHAVE_TEMA, ativado ? 'escuro' : 'claro');
    sincronizarBotaoTema();
}

function inserirOpcaoModoEscuroNoMenu() {
    const menuConfig = document.querySelector('.topo #menu-config') || document.getElementById('menu-config');
    if (!menuConfig || document.getElementById('btn-modo-escuro')) return;

    const divisor = document.createElement('div');
    divisor.className = 'divisor-menu';

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.id = 'btn-modo-escuro';
    botao.setAttribute('role', 'menuitem');
    botao.innerHTML = `
        <i class="fa-solid fa-circle-half-stroke" id="icone-modo-escuro"></i>
        <span id="texto-modo-escuro">Modo escuro</span>
    `;

    botao.addEventListener('click', alternarModoEscuro);

    menuConfig.appendChild(divisor);
    menuConfig.appendChild(botao);
    sincronizarBotaoTema();
}

aplicarTemaSalvo();


// ==========================================
// CONFIGURAÇÕES GLOBAIS AO CARREGAR A PÁGINA
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    inserirOpcaoModoEscuroNoMenu();
    aplicarTemaSalvo();

    const temTopoLogado =
        document.getElementById('nome-usuario') ||
        document.getElementById('btn-menu-conta') ||
        document.getElementById('menu-conta') ||
        document.getElementById('menu-config');

    if (temTopoLogado) {
        inicializarTopoAutenticado();
    }

    // 1. Máscara automática de CPF (aplica em qualquer input com id="cpf")
    const inputCpf = document.getElementById('cpf');
    if (inputCpf) {
        inputCpf.addEventListener('input', function (e) {
            let valor = e.target.value.replace(/\D/g, '');

            if (valor.length <= 11) {
                valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
                valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
                valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            }

            e.target.value = valor;
        });
    }

    // 2. Intercepta o envio do formulário de cadastro automaticamente
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', function (event) {
            event.preventDefault();

            const nome = document.getElementById('nome').value.trim();
            const cpf = document.getElementById('cpf').value.trim();
            const email = document.getElementById('email').value.trim();
            const telefone = document.getElementById('telefone') ? document.getElementById('telefone').value.trim() : '';
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmar-senha').value;

            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem!');
                document.getElementById('confirmar-senha').focus();
                return;
            }

            const resultado = cadastrarUsuario(nome, cpf, email, senha, telefone);

            if (!resultado.sucesso) {
                alert(resultado.mensagem);
                document.getElementById('cpf').focus();
                return;
            }

            alert(resultado.mensagem);
            window.location.href = '../pages/entrar.html';
        });
    }
});