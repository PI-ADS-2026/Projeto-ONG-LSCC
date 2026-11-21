// Chaves utilizadas no localStorage.
const CHAVE_USUARIOS = 'usuarios';
const CHAVE_SESSAO = 'usuarioLogado';


// Recupera os usuários cadastrados.
function obterUsuarios() {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
}


// Cadastra um novo usuário.
function cadastrarUsuario(nome, cpf, email, senha) {
    const usuarios = obterUsuarios();

    // Verifica se já existe uma conta com esse e-mail.
    const emailExistente = usuarios.some(
        usuario => usuario.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExistente) {
        return {
            sucesso: false,
            mensagem: 'Este e-mail já está cadastrado.'
        };
    }

    // Verifica se já existe uma conta com esse CPF.
    const cpfExistente = usuarios.some(
        usuario => usuario.cpf === cpf
    );

    if (cpfExistente) {
        return {
            sucesso: false,
            mensagem: 'Este CPF já está cadastrado.'
        };
    }

    const novoUsuario = {
        id: crypto.randomUUID(),
        nome,
        cpf,
        email: email.toLowerCase(),
        senha
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

    // Guarda os dados do usuário conectado.
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


// Recupera os dados do usuário conectado.
function obterUsuarioLogado() {
    return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
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
function configurarDropdown(botao, menu, iconeSeta, aoFecharExtra) {
    if (!botao || !menu) return;

    function fechar() {
        menu.classList.remove('aberto');
        botao.setAttribute('aria-expanded', 'false');
        if (iconeSeta) {
            atualizarRotacaoSeta(iconeSeta, false);
        }
        if (typeof aoFecharExtra === 'function') {
            aoFecharExtra();
        }
    }

    if (botao.dataset.dropdownInicializado !== 'true') {
        botao.dataset.dropdownInicializado = 'true';

        botao.addEventListener('click', function (event) {
            event.stopPropagation();

            // Fecha outros menus abertos antes de alternar este.
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

document.addEventListener('DOMContentLoaded', function () {
    const temTopoLogado =
        document.getElementById('nome-usuario') ||
        document.getElementById('btn-menu-conta') ||
        document.getElementById('menu-conta') ||
        document.getElementById('menu-config');

    if (temTopoLogado) {
        inicializarTopoAutenticado();
    }
});