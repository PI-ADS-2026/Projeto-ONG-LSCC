document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario');

    if (!formulario) return;

    const campos = [
        'nome',
        'endereco',
        'numero',
        'cidade',
        'estado',
        'celular',
        'cpf',
        'nascimento',
        'email',
        'convenio',
        'plano',
        'carteirinha',
        'validade',
        'observacoes'
    ];

    let idEdicao = Number(
        new URLSearchParams(window.location.search).get('id')
    ) || null;

    function obterPacientes() {
        return JSON.parse(localStorage.getItem('pacientes')) || [];
    }

    // Se for edição, preenche os campos com os dados existentes.
    if (idEdicao) {
        const existente = obterPacientes().find(
            p => p.id === idEdicao
        );

        if (existente) {
            campos.forEach(c => {
                const campo = document.getElementById(c);

                if (campo) {
                    campo.value = existente[c] || '';
                }
            });
        } else {
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

    // Salva um paciente novo ou atualiza um existente.
    function salvarPaciente() {
        const dados = {};

        campos.forEach(c => {
            const campo = document.getElementById(c);

            if (campo) {
                dados[c] = campo.value.trim();
            }
        });

        if (dados.nome === '') {
            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao('Digite o nome do paciente.', 'aviso');
            } else {
                alert('Digite o nome do paciente.');
            }
            document.getElementById('nome').focus();
            return null;
        }

        // --- 3. VALIDAÇÃO DO CPF ANTES DE SALVAR ---
        if (dados.cpf !== '' && !validarCPF(dados.cpf)) {
            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao('CPF inválido! Por favor, digite um CPF real para continuar.', 'aviso');
            } else {
                alert('CPF inválido! Por favor, digite um CPF real para continuar.');
            }
            document.getElementById('cpf').focus();
            return null; // Interrompe o salvamento
        }

        const pacientes = obterPacientes();

        if (idEdicao) {
            const indice = pacientes.findIndex(
                p => p.id === idEdicao
            );

            if (indice === -1) {
                if (typeof mostrarNotificacao === 'function') {
                    mostrarNotificacao('Paciente não encontrado.', 'erro');
                } else {
                    alert('Paciente não encontrado.');
                }
                return null;
            }

            // Mantém o ID e atualiza os dados do paciente.
            pacientes[indice] = {
                ...pacientes[indice],
                ...dados
            };
        } else {
            idEdicao = Date.now();

            pacientes.push({
                id: idEdicao,
                ...dados
            });
        }

        localStorage.setItem(
            'pacientes',
            JSON.stringify(pacientes)
        );

        return idEdicao;
    }

    formulario.addEventListener('submit', function(event) {
        event.preventDefault();

        const id = salvarPaciente();

        if (id) {
            const mensagemSucesso = new URLSearchParams(window.location.search).get('id')
                ? 'Paciente atualizado com sucesso!'
                : 'Paciente cadastrado com sucesso!';

            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao(mensagemSucesso, 'sucesso');
            } else {
                alert(mensagemSucesso);
            }

            setTimeout(() => {
                window.location.href = '../pages/paciente.html';
            }, 1500);
        }
    });
});