const lista = document.getElementById('lista-fornecedores');
const pesquisa = document.getElementById('pesquisa');

const modalExclusao = document.getElementById('modal-exclusao');
const nomeExclusao = document.getElementById('nome-exclusao');
const cancelarExclusao = document.getElementById('cancelar-exclusao');
const confirmarExclusao = document.getElementById('confirmar-exclusao');

let fornecedorParaExcluir = null;


function obterFornecedores() {
    return JSON.parse(
        localStorage.getItem('fornecedores')
    ) || [];
}


function criarBotao(texto, aoClicar) {
    const botao = document.createElement('button');

    botao.type = 'button';
    botao.textContent = texto;
    botao.addEventListener('click', aoClicar);

    return botao;
}


function renderizar() {

    lista.querySelectorAll('.paciente, .lista-vazia')
        .forEach(el => el.remove());

    const termo = pesquisa.value.toLowerCase().trim();

    const filtrados = obterFornecedores()
        .filter(f => {
            return [
                f.nome,
                f.cnpj,
                f.telefone,
                f.email,
                f.endereco,
                f.numero,
                f.cidade,
                f.estado,
                f.cep
            ].some(valor =>
                String(valor || '')
                    .toLowerCase()
                    .includes(termo)
            );
        })
        .sort((a, b) =>
            (a.nome || '').localeCompare(
                b.nome || '',
                'pt-BR',
                { sensitivity: 'base' }
            )
        );


    if (filtrados.length === 0) {
        const vazio = document.createElement('div');

        vazio.className = 'lista-vazia';
        vazio.textContent = 'Nenhum fornecedor encontrado.';

        lista.appendChild(vazio);

        return;
    }


    filtrados.forEach(f => {
        const item = document.createElement('div');
        item.className = 'paciente';

        // NOME E ÍCONE
        const info = document.createElement('div');
        info.className = 'info-paciente';

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = '<i class="fa-solid fa-store"></i>';

        const nome = document.createElement('span');
        nome.textContent = f.nome || 'Fornecedor sem nome';

        info.append(avatar, nome);

        // AÇÕES
        const acoes = document.createElement('div');
        acoes.className = 'acoes-paciente';

        const botaoVisualizar = criarBotao('Visualizar Registro', () => {
            window.location.href =
                '../pages/cadastro-fornecedor.html?id=' + f.id;
        });

        const botaoHistorico = criarBotao('Histórico Produtos', () => {
            alert('Histórico de produtos de: ' + f.nome);
        });

        const botaoExcluir = criarBotao('Excluir', () => {
            excluirFornecedor(f.id);
        });

        acoes.append(
            botaoVisualizar,
            botaoHistorico,
            botaoExcluir
        );

        item.append(info, acoes);
        lista.appendChild(item);
    });
}


function excluirFornecedor(id) {
    const fornecedor = obterFornecedores().find(
        f => Number(f.id) === Number(id)
    );

    if (!fornecedor) {
        return;
    }

    fornecedorParaExcluir = id;
    nomeExclusao.textContent = fornecedor.nome || 'este fornecedor';
    modalExclusao.hidden = false;
    cancelarExclusao.focus();
}


function fecharModal() {
    modalExclusao.hidden = true;
    fornecedorParaExcluir = null;
}


confirmarExclusao.addEventListener('click', function () {
    if (fornecedorParaExcluir === null) {
        return;
    }

    const restantes = obterFornecedores().filter(
        f => Number(f.id) !== Number(fornecedorParaExcluir)
    );

    localStorage.setItem(
        'fornecedores',
        JSON.stringify(restantes)
    );

    fecharModal();
    renderizar();
});


cancelarExclusao.addEventListener('click', fecharModal);


modalExclusao.addEventListener('click', function (event) {
    if (event.target === modalExclusao) {
        fecharModal();
    }
});


document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modalExclusao.hidden) {
        fecharModal();
    }
});


pesquisa.addEventListener('input', renderizar);

renderizar();