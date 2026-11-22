
/* Seleção de pacientes para agendamento */

(() => {
    "use strict";

    // ==========================================
    // ELEMENTOS DO HTML
    // ==========================================

    const listaPacientes = document.getElementById("lista-pacientes-agendamento");
    const pesquisaPaciente = document.getElementById("pesquisa-paciente-agendamento");
    const contadorPacientes = document.getElementById("contador-pacientes");
    const estadoVazio = document.getElementById("estado-vazio-pacientes");

    // ==========================================
    // ARMAZENAMENTO
    // ==========================================

    const CHAVE_PACIENTE_SELECIONADO = "pacienteAgendamentoId";

    // Recupera os pacientes cadastrados.
    function obterPacientes() {
        return JSON.parse(localStorage.getItem("pacientes")) || [];
    }

    // ==========================================
    // CRIAÇÃO DOS CARDS
    // ==========================================

    function criarCardPaciente(paciente) {

        const card = document.createElement("div");
        card.className = "paciente-agendamento-card";

        // Informações do paciente.
        const informacoes = document.createElement("div");
        informacoes.className = "paciente-agendamento-info";

        // Avatar com a inicial do nome.
        const avatar = document.createElement("span");
        avatar.className = "paciente-agendamento-avatar";
        avatar.textContent = (paciente.nome || "?").charAt(0).toUpperCase();

        // Dados.
        const dados = document.createElement("div");
        dados.className = "paciente-agendamento-dados";

        const nome = document.createElement("h3");
        nome.textContent = paciente.nome || "Paciente sem nome";

        const cpf = document.createElement("p");
        cpf.textContent = "CPF: " + (paciente.cpf || "Não informado");

        dados.append(nome, cpf);
        informacoes.append(avatar, dados);

        // Botão para selecionar.
        const botaoSelecionar = document.createElement("button");
        botaoSelecionar.type = "button";
        botaoSelecionar.className = "btn-selecionar-paciente";
        botaoSelecionar.textContent = "Selecionar";

        botaoSelecionar.addEventListener("click", () => {
            selecionarPaciente(paciente);
        });

        card.append(informacoes, botaoSelecionar);

        return card;
    }

    // ==========================================
    // SELEÇÃO DO PACIENTE
    // ==========================================

    function selecionarPaciente(paciente) {

        // Guarda o ID para utilizar na próxima tela.
        sessionStorage.setItem(
            CHAVE_PACIENTE_SELECIONADO,
            String(paciente.id)
        );

        // Encaminha para o formulário de agendamento.
        window.location.href = "../pages/novo-agendamento.html";
    }

    // ==========================================
    // RENDERIZAÇÃO DA LISTA
    // ==========================================

    function renderizarPacientes() {

        listaPacientes.innerHTML = "";
        estadoVazio.hidden = false;

        const termo = pesquisaPaciente.value
            .toLowerCase()
            .trim();

        // Filtra os pacientes por nome ou CPF.
        const pacientesFiltrados = obterPacientes()
            .filter(paciente => {

                const nome = String(paciente.nome || "").toLowerCase();
                const cpf = String(paciente.cpf || "").toLowerCase();

                return nome.includes(termo) || cpf.includes(termo);
            })
            .sort((a, b) =>
                (a.nome || "").localeCompare(
                    b.nome || "",
                    "pt-BR",
                    { sensitivity: "base" }
                )
            );

        // Atualiza o contador.
        const quantidade = pacientesFiltrados.length;

        contadorPacientes.textContent =
            quantidade + (quantidade === 1 ? " paciente" : " pacientes");

        // Exibe ou oculta o estado vazio.
        estadoVazio.hidden = quantidade > 0;

        if (quantidade === 0) {
          listaPacientes.appendChild(estadoVazio);
            return;
        }

        // Cria os cards.
        pacientesFiltrados.forEach(paciente => {
            const card = criarCardPaciente(paciente);
            listaPacientes.appendChild(card);
        });
    }

    // ==========================================
    // EVENTOS
    // ==========================================

    pesquisaPaciente.addEventListener("input", renderizarPacientes);

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    renderizarPacientes();

})();
