
/* Gerenciamento do calendário de agendamentos */

(() => {
    "use strict";

    // ==========================================
    // ELEMENTOS DO HTML
    // ==========================================

    const mesAtual = document.getElementById("mes-atual");
    const diasCalendario = document.getElementById("dias-calendario");

    const botaoMesAnterior = document.getElementById("mes-anterior");
    const botaoMesProximo = document.getElementById("mes-proximo");
    const botaoMesHoje = document.getElementById("mes-hoje");

    // ==========================================
    // ARMAZENAMENTO
    // ==========================================

    function obterAgendamentos() {
        return JSON.parse(localStorage.getItem("agendamentos")) || [];
    }

    // ==========================================
    // DATA ATUAL
    // ==========================================

    const hoje = new Date();

    // Representa o mês que está sendo exibido.
    let dataExibida = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
    );

    // ==========================================
    // EXIBIÇÃO DO CALENDÁRIO
    // ==========================================

    function renderizarCalendario() {

        // Limpa os dias exibidos anteriormente.
        diasCalendario.innerHTML = "";

        // Obtém o mês e o ano selecionados.
        const ano = dataExibida.getFullYear();
        const mes = dataExibida.getMonth();

        // Atualiza o título do calendário.
        mesAtual.textContent = dataExibida.toLocaleDateString(
            "pt-BR",
            {
                month: "long",
                year: "numeric"
            }
        );

        // Primeiro dia do mês.
        const primeiroDia = new Date(ano, mes, 1);

        // Quantidade de dias do mês.
        const quantidadeDias = new Date(ano, mes + 1, 0).getDate();

        // Ajusta a semana para começar na segunda-feira.
        const diaSemanaInicial = (primeiroDia.getDay() + 6) % 7;

        // Calcula quantas semanas serão necessárias.
        const quantidadeCelulas = Math.ceil(
            (diaSemanaInicial + quantidadeDias) / 7
        ) * 7;

        // Cria cada célula do calendário.
        for (let i = 0; i < quantidadeCelulas; i++) {

            const dia = document.createElement("div");
            dia.className = "dia-calendario";

            // Calcula a data correspondente à célula.
            const dataDia = new Date(
                ano,
                mes,
                i - diaSemanaInicial + 1
            );

            const numeroDia = document.createElement("span");
            numeroDia.className = "numero-dia";
            numeroDia.textContent = dataDia.getDate();

            // Identifica os dias de outros meses.
            if (dataDia.getMonth() !== mes) {
                dia.classList.add("outro-mes");
            }

            // Identifica o dia atual.
            const ehHoje =
                dataDia.getDate() === hoje.getDate() &&
                dataDia.getMonth() === hoje.getMonth() &&
                dataDia.getFullYear() === hoje.getFullYear();

            if (ehHoje) {
                dia.classList.add("hoje");
            }

            dia.appendChild(numeroDia);

            // Busca os agendamentos deste dia.
            const dataFormatada =
                `${dataDia.getFullYear()}-${String(dataDia.getMonth() + 1).padStart(2, "0")}-${String(dataDia.getDate()).padStart(2, "0")}`;

            const agendamentosDoDia = obterAgendamentos()
                .filter(agendamento => agendamento.data === dataFormatada)
                .sort((a, b) => a.horario.localeCompare(b.horario));

            // Exibe cada consulta no calendário.
            agendamentosDoDia.forEach(agendamento => {
                const consulta = document.createElement("div");
                consulta.className = "consulta-calendario";

                const horario = document.createElement("span");
                horario.textContent = agendamento.horario;

                const paciente = document.createElement("span");
                paciente.textContent = agendamento.pacienteNome;

                consulta.append(horario, paciente);
                dia.appendChild(consulta);
            });

            diasCalendario.appendChild(dia);
        }
    }

    // ==========================================
    // NAVEGAÇÃO ENTRE OS MESES
    // ==========================================

    function mesAnterior() {
        dataExibida.setMonth(dataExibida.getMonth() - 1);
        renderizarCalendario();
    }

    function mesProximo() {
        dataExibida.setMonth(dataExibida.getMonth() + 1);
        renderizarCalendario();
    }

    function voltarParaHoje() {
        dataExibida = new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            1
        );

        renderizarCalendario();
    }

    // ==========================================
    // EVENTOS DOS BOTÕES
    // ==========================================

    botaoMesAnterior.addEventListener("click", mesAnterior);
    botaoMesProximo.addEventListener("click", mesProximo);
    botaoMesHoje.addEventListener("click", voltarParaHoje);

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    renderizarCalendario();

})();
