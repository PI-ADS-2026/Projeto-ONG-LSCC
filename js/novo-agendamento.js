
/* Cadastro de agendamentos */

(() => {
    "use strict";

    // ==========================================
    // ELEMENTOS
    // ==========================================

    const nomePaciente = document.getElementById("nome-paciente-selecionado");
    const cpfPaciente = document.getElementById("cpf-paciente-selecionado");

    const formulario = document.getElementById("form-novo-agendamento");
    const campoProfissao = document.getElementById("profissao");
    const campoProfissional = document.getElementById("profissional");
    const campoData = document.getElementById("data-consulta");
    const campoHorario = document.getElementById("horario-consulta");
    const campoObservacoes = document.getElementById("observacoes");
    const campoSala = document.getElementById("sala");

    // ==========================================
    // ARMAZENAMENTO
    // ==========================================

    const CHAVE_PACIENTE_SELECIONADO = "pacienteAgendamentoId";
    const CHAVE_RASCUNHO = "agendamentoRascunho";

    function obterPacientes() {
        return JSON.parse(localStorage.getItem("pacientes")) || [];
    }

    function obterProfissionais() {
        return JSON.parse(localStorage.getItem("profissionais")) || [];
    }

    function obterSalas() {
    try {
        return JSON.parse(localStorage.getItem("salas")) || [];
    } catch (erro) {
        console.error("Erro ao carregar salas:", erro);
        return [];
    }
}

    // ==========================================
    // PACIENTE SELECIONADO
    // ==========================================

    const pacienteId = sessionStorage.getItem(CHAVE_PACIENTE_SELECIONADO);

    const paciente = obterPacientes().find(
        paciente => String(paciente.id) === pacienteId
    );

    if (!paciente) {
        alert("Paciente não encontrado. Selecione novamente.");
        window.location.href = "../pages/selecionar-paciente.html";
        return;
    }

    nomePaciente.textContent = paciente.nome || "Nome não informado";
    cpfPaciente.textContent = "CPF: " + (paciente.cpf || "Não informado");

    // ==========================================
    // PROFISSIONAIS
    // ==========================================

    function atualizarProfissionais() {
        const profissaoSelecionada = campoProfissao.value;

        campoProfissional.innerHTML =
            '<option value="">Selecione o profissional</option>';

        campoProfissional.disabled = true;

        if (!profissaoSelecionada) {
            return;
        }

        const profissionaisFiltrados = obterProfissionais().filter(
            profissional =>
                profissional.profissao === profissaoSelecionada
        );

        if (profissionaisFiltrados.length === 0) {
            campoProfissional.innerHTML =
                '<option value="">Nenhum profissional encontrado</option>';
            return;
        }

        profissionaisFiltrados.forEach(profissional => {
            const opcao = document.createElement("option");

            opcao.value = String(profissional.id);
            opcao.textContent = profissional.nome;

            campoProfissional.appendChild(opcao);
        });

        campoProfissional.disabled = false;
    }

    campoProfissao.addEventListener("change", atualizarProfissionais);

    // ==========================================
    // SALAS
    // ==========================================

    function atualizarSalas() {
        campoSala.innerHTML = '<option value="">Selecione uma sala</option>';

        const salas = obterSalas();

        if (salas.length === 0) {
            campoSala.innerHTML =
                '<option value="">Nenhuma sala cadastrada</option>';
            campoSala.disabled = true;
            return;
        }

        salas.forEach(sala => {
            const opcao = document.createElement("option");

            opcao.value = String(sala.id);
            opcao.textContent = sala.nome;

            campoSala.appendChild(opcao);
        });

        campoSala.disabled = false;
    }

    atualizarSalas();
    // ==========================================
    // DATA MÍNIMA
    // ==========================================

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    campoData.min = `${ano}-${mes}-${dia}`;

    // ==========================================
    // ENVIO DO FORMULÁRIO
    // ==========================================

    formulario.addEventListener("submit", (event) => {
        event.preventDefault();

        const profissionalId = campoProfissional.value;

        const profissional = obterProfissionais().find(
            profissional => String(profissional.id) === profissionalId
        );
        const sala = obterSalas().find(
            sala => String(sala.id) === campoSala.value
        );

        if (!profissional) {
            alert("Selecione um profissional válido.");
            return;
        }
        if (!sala) {
            alert("Selecione uma sala.");
            return;
        }

        const dadosAgendamento = {
            pacienteId: paciente.id,
            pacienteNome: paciente.nome,
            pacienteCpf: paciente.cpf,

            profissionalId: profissional.id,
            profissionalNome: profissional.nome,
            profissao: profissional.profissao,

            data: campoData.value,
            horario: campoHorario.value,
            observacoes: campoObservacoes.value.trim(),
            salaId: sala.id,
            salaNome: sala.nome
        };

        sessionStorage.setItem(
            CHAVE_RASCUNHO,
            JSON.stringify(dadosAgendamento)
        );

        window.location.href = "../pages/confirmar-agendamento.html";
    });

})();
