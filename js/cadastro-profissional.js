const formulario = document.getElementById('formulario');

// Todos os campos existentes no HTML.
const campos = [
    'nome',
    'cpf',
    'nascimento',
    'celular',
    'email',
    'endereco',
    'numero',
    'cidade',
    'estado',
    'profissao',
    'especialidade',
    'conselho',
    'registro',
    'uf-conselho',
    'formacao',
    'instituicao',
    'observacoes-profissionais',
    'tipo-vinculo',
    'data-admissao',
    'horario',
    'situacao'
];

// Recupera o ID da URL, caso seja uma edição.
const parametros = new URLSearchParams(window.location.search);

let idEdicao = Number(parametros.get('id')) || null;

// Recupera os profissionais cadastrados.
function obterProfissionais() {
    return JSON.parse(localStorage.getItem('profissionais')) || [];
}

// Se for edição, preenche os campos com os dados existentes.
if (idEdicao !== null) {

    const existente = obterProfissionais().find(
        p => p.id === idEdicao
    );

    if (existente) {

        campos.forEach(c => {

            const campo = document.getElementById(c);

            if (campo) {
                campo.value = existente[c] ?? '';
            }

        });

    } else {

        alert('Profissional não encontrado.');
        idEdicao = null;

    }
}

// --- 1. MÁSCARA AUTOMÁTICA NO CAMPO DE CPF ---
const inputCpf = document.getElementById('cpf');

if (inputCpf) {
    inputCpf.addEventListener('input', function (e) {
        let valor = e.target.value;

        // Remove tudo que não for número
        valor = valor.replace(/\D/g, "");

        // Aplica os pontos e o traço conforme o usuário digita
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


// Salva um profissional novo ou atualiza um existente.
function salvarProfissional() {

    const dados = {};

    // Obtém os valores de todos os campos.
    campos.forEach(c => {

        const campo = document.getElementById(c);

        if (campo) {
            dados[c] = campo.value.trim();
        }

    });


    // Valida o preenchimento do nome.
    if (dados.nome === '') {

        alert('Digite o nome do profissional.');
        document.getElementById('nome').focus();

        return null;
    }


    // Valida o preenchimento do CPF.
    if (dados.cpf === '') {

        alert('Digite o CPF do profissional.');
        document.getElementById('cpf').focus();

        return null;
    }


    // --- 3. VALIDAÇÃO DE TAMANHO E MATEMÁTICA DO CPF ---
    const apenasNumerosCpf = dados.cpf.replace(/\D/g, '');

    if (apenasNumerosCpf.length !== 11) {
        alert('O CPF deve conter exatamente 11 dígitos.');
        document.getElementById('cpf').focus();
        return null;
    }

    if (!validarCPF(dados.cpf)) {
        alert('CPF inválido! Por favor, digite um CPF real para continuar.');
        document.getElementById('cpf').focus();
        return null;
    }


    // Valida o preenchimento do celular.
    if (dados.celular === '') {

        alert('Digite o celular do profissional.');
        document.getElementById('celular').focus();

        return null;
    }


    // Valida o preenchimento do e-mail.
    if (dados.email === '') {

        alert('Digite o e-mail do profissional.');
        document.getElementById('email').focus();

        return null;
    }


    // Valida a profissão.
    if (dados.profissao === '') {

        alert('Selecione a profissão.');
        document.getElementById('profissao').focus();

        return null;
    }


    // Valida o conselho profissional.
    if (dados.conselho === '') {

        alert('Selecione o conselho profissional.');
        document.getElementById('conselho').focus();

        return null;
    }


    // Valida o número de registro.
    if (dados.registro === '') {

        alert('Digite o número de registro profissional.');
        document.getElementById('registro').focus();

        return null;
    }


    // Valida a UF do conselho.
    if (dados['uf-conselho'] === '') {

        alert('Digite a UF do registro profissional.');
        document.getElementById('uf-conselho').focus();

        return null;
    }


    const profissionais = obterProfissionais();


    // Verifica se o CPF já está cadastrado.
    // Na edição, ignora o próprio profissional.
    const cpfExistente = profissionais.find(
        p =>
            p.cpf === dados.cpf &&
            p.id !== idEdicao
    );

    if (cpfExistente) {

        alert('Já existe um profissional cadastrado com este CPF.');
        document.getElementById('cpf'.focus());

        return null;
    }


    if (idEdicao !== null) {

        // UPDATE - Atualiza um profissional existente.
        const indice = profissionais.findIndex(
            p => p.id === idEdicao
        );

        if (indice === -1) {

            alert('Profissional não encontrado.');

            return null;
        }


        // Mantém o ID e atualiza todos os dados.
        profissionais[indice] = {
            ...profissionais[indice],
            ...dados
        };


    } else {

        // CREATE - Cadastra um novo profissional.
        idEdicao = Date.now();

        profissionais.push({
            id: idEdicao,
            ...dados
        });

    }


    // Salva os dados no localStorage.
    localStorage.setItem(
        'profissionais',
        JSON.stringify(profissionais)
    );

    return idEdicao;

}


// Evento de envio do formulário.
formulario.addEventListener('submit', function(event) {

    event.preventDefault();

    // Guarda se o formulário estava em modo de edição.
    const estavaEditando = parametros.has('id');

    const id = salvarProfissional();

    if (id !== null) {

        alert(
            'Profissional ' +
            (estavaEditando ? 'atualizado' : 'cadastrado') +
            ' com sucesso!'
        );

        // Retorna para a listagem de profissionais.
        window.location.href = 'profissional.html';

    }

});