
/* Gerenciamento do histórico de consultas do paciente */

(() => {
    "use strict";

    // ==========================================
    // ELEMENTOS DO HTML
    // ==========================================

    const nomePaciente = document.getElementById("nome-paciente");
    const cpfPaciente = document.getElementById("cpf-paciente");
    const totalConsultas = document.getElementById("total-consultas");
    const listaHistorico = document.getElementById("lista-historico");

    // ==========================================
    // IDENTIFICAÇÃO DO PACIENTE
    // ==========================================

    const parametros = new URLSearchParams(window.location.search);
    const pacienteId = parametros.get("id");

    // ==========================================
    // ARMAZENAMENTO
    // ==========================================

    function obterPacientes() {
        try {
            return JSON.parse(localStorage.getItem("pacientes")) || [];
        } catch (erro) {
            console.error("Erro ao carregar pacientes:", erro);
            return [];
        }
    }

    function obterAgendamentos() {
        try {
            return JSON.parse(localStorage.getItem("agendamentos")) || [];
        } catch (erro) {
            console.error("Erro ao carregar agendamentos:", erro);
            return [];
        }
    }

    // ==========================================
    // FORMATAÇÃO
    // ==========================================

    function formatarData(data) {
        if (!data) {
            return "Data não informada";
        }

        const [ano, mes, dia] = data.split("-");

        if (!ano || !mes || !dia) {
            return data;
        }

        return `${dia}/${mes}/${ano}`;
    }

    // ==========================================
    // EXIBIR PACIENTE
    // ==========================================

    function renderizarPaciente(paciente) {
        nomePaciente.textContent = paciente.nome || "Paciente sem nome";
        cpfPaciente.textContent = `CPF: ${paciente.cpf || "Não informado"}`;
    }

    // ==========================================
    // CRIAR CARD DE CONSULTA
    // ==========================================

    function criarCardConsulta(agendamento) {
        const card = document.createElement("article");
        card.className = "card-consulta-historico";

        // Cabeçalho da consulta.
        const topo = document.createElement("div");
        topo.className = "consulta-historico-topo";

        const data = document.createElement("div");
        data.className = "consulta-historico-data";

        const iconeData = document.createElement("i");
        iconeData.className = "fa-regular fa-calendar";

        const textoData = document.createElement("span");
        textoData.textContent = formatarData(agendamento.data);

        data.append(iconeData, textoData);

        const horario = document.createElement("span");
        horario.className = "consulta-historico-horario";
        horario.textContent = agendamento.horario || "Sem horário";

        topo.append(data, horario);
        // Status da consulta.
        const status = document.createElement("span");
        const statusConsulta = agendamento.status || "Agendada";

        status.className = `status-historico status-${statusConsulta
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-")}`;

        status.textContent = statusConsulta;

        topo.appendChild(status);

        // Detalhes da consulta.
        const detalhes = document.createElement("div");
        detalhes.className = "consulta-historico-detalhes";

        const profissional = criarDetalhe(
            "Profissional responsável",
            agendamento.profissionalNome || "Não informado"
        );

        const profissao = criarDetalhe(
            "Área profissional",
            agendamento.profissao || "Não informada"
        );

        detalhes.append(profissional, profissao);

        card.append(topo, detalhes);

        // Observações, quando existirem.
        if (agendamento.observacoes) {
            const observacoes = document.createElement("div");
            observacoes.className = "consulta-historico-observacoes";

            const titulo = document.createElement("span");
            titulo.textContent = "Observações";

            const texto = document.createElement("p");
            texto.textContent = agendamento.observacoes;

            observacoes.append(titulo, texto);
            card.appendChild(observacoes);
        }

        return card;
    }

    // Cria um campo de informação.
    function criarDetalhe(titulo, valor) {
        const detalhe = document.createElement("div");
        detalhe.className = "detalhe-consulta";

        const label = document.createElement("span");
        label.textContent = titulo;

        const texto = document.createElement("strong");
        texto.textContent = valor;

        detalhe.append(label, texto);

        return detalhe;
    }

    // ==========================================
    // EXIBIR HISTÓRICO
    // ==========================================

    function renderizarHistorico(paciente) {
        const consultas = obterAgendamentos()
            .filter(agendamento =>
                String(agendamento.pacienteId) === String(paciente.id)
            )
            .sort((a, b) => {
                const dataA = `${a.data || ""} ${a.horario || ""}`;
                const dataB = `${b.data || ""} ${b.horario || ""}`;

                return dataB.localeCompare(dataA);
            });

        totalConsultas.textContent = consultas.length;

        listaHistorico.innerHTML = "";

        if (consultas.length === 0) {
            const vazio = document.createElement("div");
            vazio.className = "historico-vazio";

            const icone = document.createElement("i");
            icone.className = "fa-regular fa-calendar-xmark";

            const titulo = document.createElement("h3");
            titulo.textContent = "Nenhuma consulta encontrada";

            const mensagem = document.createElement("p");
            mensagem.textContent =
                "Este paciente ainda não possui consultas registradas.";

            vazio.append(icone, titulo, mensagem);
            listaHistorico.appendChild(vazio);

            return;
        }

        consultas.forEach(agendamento => {
            const card = criarCardConsulta(agendamento);
            listaHistorico.appendChild(card);
        });
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    function inicializar() {
        if (!pacienteId) {
            nomePaciente.textContent = "Paciente não identificado";
            cpfPaciente.textContent = "Não foi informado um ID de paciente.";

            totalConsultas.textContent = "0";
            listaHistorico.innerHTML = "";

            return;
        }

        const paciente = obterPacientes().find(
            p => String(p.id) === String(pacienteId)
        );

        if (!paciente) {
            nomePaciente.textContent = "Paciente não encontrado";
            cpfPaciente.textContent = "Verifique o cadastro do paciente.";

            totalConsultas.textContent = "0";
            listaHistorico.innerHTML = "";

            return;
        }

        renderizarPaciente(paciente);
        renderizarHistorico(paciente);
    }

    inicializar();

})();
