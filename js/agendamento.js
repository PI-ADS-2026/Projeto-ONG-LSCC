
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
