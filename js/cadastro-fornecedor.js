const formulario = document.getElementById('formulario');
const tituloCadastro = document.getElementById('titulo-cadastro');
const btnSalvar = document.getElementById('btn-salvar');

const campos = [
    'nome',
    'cnpj',
    'telefone',
    'email',
    'endereco',
    'numero',
    'cep',
    'cidade',
    'estado'
];

const parametros = new URLSearchParams(window.location.search);

let idEdicao = Number(parametros.get('id')) || null;


function obterFornecedores() {
    return JSON.parse(localStorage.getItem('fornecedores')) || [];
}


// Se for visualização/edição, preenche os campos com os dados existentes.
if (idEdicao !== null) {

    const existente = obterFornecedores().find(
        f => f.id === idEdicao
    );

    if (existente) {
        tituloCadastro.textContent = 'Visualizar / Editar Fornecedor';
        btnSalvar.innerHTML = '<i class="fa-solid fa-check"></i> Salvar alterações';

        campos.forEach(c => {
            const campo = document.getElementById(c);

            if (campo) {
                campo.value = existente[c] ?? '';
            }
        });
    } else {
        alert('Fornecedor não encontrado.');
        idEdicao = null;
    }
}


function salvarFornecedor() {

    const dados = {};

    campos.forEach(c => {
        const campo = document.getElementById(c);

        if (campo) {
            dados[c] = campo.value.trim();
        }
    });


    if (dados.nome === '') {
        alert('Digite o nome do fornecedor.');
        document.getElementById('nome').focus();
        return null;
    }

    if (dados.cnpj === '') {
        alert('Digite o CNPJ do fornecedor.');
        document.getElementById('cnpj').focus();
        return null;
    }

    if (dados.telefone === '') {
        alert('Digite o telefone do fornecedor.');
        document.getElementById('telefone').focus();
        return null;
    }

    if (dados.email === '') {
        alert('Digite o e-mail do fornecedor.');
        document.getElementById('email').focus();
        return null;
    }


    const fornecedores = obterFornecedores();

    const cnpjExistente = fornecedores.find(
        f =>
            f.cnpj === dados.cnpj &&
            f.id !== idEdicao
    );

    if (cnpjExistente) {
        alert('Já existe um fornecedor cadastrado com este CNPJ.');
        document.getElementById('cnpj').focus();
        return null;
    }


    if (idEdicao !== null) {
        const indice = fornecedores.findIndex(
            f => f.id === idEdicao
        );

        if (indice === -1) {
            alert('Fornecedor não encontrado.');
            return null;
        }

        fornecedores[indice] = {
            ...fornecedores[indice],
            ...dados
        };
    } else {
        idEdicao = Date.now();

        fornecedores.push({
            id: idEdicao,
            ...dados
        });
    }


    localStorage.setItem(
        'fornecedores',
        JSON.stringify(fornecedores)
    );

    return idEdicao;
}


formulario.addEventListener('submit', function (event) {
    event.preventDefault();

    const estavaEditando = parametros.has('id');

    const id = salvarFornecedor();

    if (id !== null) {
        alert(
            'Fornecedor ' +
            (estavaEditando ? 'atualizado' : 'cadastrado') +
            ' com sucesso!'
        );

        window.location.href = 'fornecedor.html';
    }
});