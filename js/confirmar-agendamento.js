
/* Confirmação de agendamentos */

(() => {
    "use strict";

    // ==========================================
    // ELEMENTOS
    // ==========================================

    const confirmacaoPaciente = document.getElementById("confirmacao-paciente");
    const confirmacaoCpf = document.getElementById("confirmacao-cpf");

    const confirmacaoProfissao = document.getElementById("confirmacao-profissao");
    const confirmacaoProfissional = document.getElementById("confirmacao-profissional");

    const confirmacaoData = document.getElementById("confirmacao-data");
    const confirmacaoHorario = document.getElementById("confirmacao-horario");
    const confirmacaoSala = document.getElementById("confirmacao-sala");

    const confirmacaoObservacoes = document.getElementById("confirmacao-observacoes");

    const botaoConfirmar = document.getElementById("btn-confirmar-agendamento");

    // ==========================================
    // ARMAZENAMENTO
    // ==========================================

    const CHAVE_RASCUNHO = "agendamentoRascunho";
    const CHAVE_AGENDAMENTOS = "agendamentos";

    function obterRascunho() {
        return JSON.parse(sessionStorage.getItem(CHAVE_RASCUNHO));
    }

    function obterAgendamentos() {
        return JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS)) || [];
    }

    // ==========================================
    // RECUPERAR DADOS
    // ==========================================

    const agendamento = obterRascunho();

    if (!agendamento) {
        alert("Nenhum agendamento encontrado. Inicie novamente.");
        window.location.href = "../pages/selecionar-paciente.html";
        return;
    }

    // ==========================================
    // FORMATAR DATA
    // ==========================================

    function formatarData(data) {
        if (!data) {
            return "Não informada";
        }

        const [ano, mes, dia] = data.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    // ==========================================
    // EXIBIR INFORMAÇÕES
    // ==========================================

    confirmacaoPaciente.textContent =
        agendamento.pacienteNome || "Não informado";

    confirmacaoCpf.textContent =
        agendamento.pacienteCpf || "Não informado";

    confirmacaoProfissao.textContent =
        agendamento.profissao || "Não informada";

    confirmacaoProfissional.textContent =
        agendamento.profissionalNome || "Não informado";

    confirmacaoData.textContent = formatarData(agendamento.data);

    confirmacaoHorario.textContent =
        agendamento.horario || "Não informado";

    confirmacaoObservacoes.textContent =
        agendamento.observacoes || "Nenhuma observação";

    confirmacaoSala.textContent =
    agendamento.salaNome || "Não informada";    

    // ==========================================
    // CONFIRMAR AGENDAMENTO
    // ==========================================

    botaoConfirmar.addEventListener("click", () => {
        const agendamentos = obterAgendamentos();

        // Dupla checagem de conflitos no momento de salvar
        const conflito = agendamentos.find(a => 
            a.data === agendamento.data &&
            a.horario === agendamento.horario &&
            a.status !== "Cancelada" &&
            (
                String(a.pacienteId) === String(agendamento.pacienteId) ||
                String(a.profissionalId) === String(agendamento.profissionalId) ||
                String(a.salaId) === String(agendamento.salaId)
            )
        );

        if (conflito) {
            mostrarNotificacao("Não foi possível concluir: já existe um conflito de horário!", "erro");
            setTimeout(() => {
                window.location.href = "../pages/novo-agendamento.html";
            }, 1500);
            return;
        }

        const novoAgendamento = {
            id: Date.now(),
            pacienteId: agendamento.pacienteId,
            pacienteNome: agendamento.pacienteNome,
            pacienteCpf: agendamento.pacienteCpf,

            profissionalId: agendamento.profissionalId,
            profissionalNome: agendamento.profissionalNome,
            profissao: agendamento.profissao,
            salaId: agendamento.salaId,
            salaNome: agendamento.salaNome,

            data: agendamento.data,
            horario: agendamento.horario,
            observacoes: agendamento.observacoes,

            status: "Agendada"
        };

        agendamentos.push(novoAgendamento);

        localStorage.setItem(
            CHAVE_AGENDAMENTOS,
            JSON.stringify(agendamentos)
        );

        sessionStorage.removeItem(CHAVE_RASCUNHO);
        sessionStorage.removeItem("pacienteAgendamentoId");

        // Mostra a notificação bonita de sucesso e espera 1.5 segundo antes de mudar de página
        mostrarNotificacao("Agendamento confirmado com sucesso!", "sucesso");

        setTimeout(() => {
            window.location.href = "../pages/agendamentos.html";
        }, 1500);
    });
})();
