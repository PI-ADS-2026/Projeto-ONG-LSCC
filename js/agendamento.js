
/* Gerenciamento do calendário de agendamentos */

(() => {
    "use strict";

    // ==========================================
    // ELEMENTOS DO HTML
    // ==========================================

    const mesAtual = document.getElementById("mes-atual");
    const descricaoVisualizacao = document.getElementById("descricao-visualizacao");

    const diasSemana = document.getElementById("dias-semana");
    const diasCalendario = document.getElementById("dias-calendario");

    const botaoMesAnterior = document.getElementById("mes-anterior");
    const botaoMesProximo = document.getElementById("mes-proximo");
    const botaoMesHoje = document.getElementById("mes-hoje");

    const botaoVisualizacaoMes = document.getElementById("visualizacao-mes");
    const botaoVisualizacaoSemana = document.getElementById("visualizacao-semana");
    const botaoVisualizacaoDia = document.getElementById("visualizacao-dia");

    // ==========================================
    // DATA E VISUALIZAÇÃO
    // ==========================================

    const hoje = new Date();

    let dataReferencia = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
    );

    let visualizacaoAtual = "mes";

    const nomesDias = [
        "Dom",
        "Seg",
        "Ter",
        "Qua",
        "Qui",
        "Sex",
        "Sáb"
    ];

    // ==========================================
    // ARMAZENAMENTO
    // ==========================================

    function obterAgendamentos() {
        try {
            const agendamentos =
                JSON.parse(localStorage.getItem("agendamentos")) || [];

            return agendamentos.map(agendamento => ({
                ...agendamento,
                status: agendamento.status || "Agendada"
            }));

        } catch (erro) {
            console.error("Erro ao carregar agendamentos:", erro);
            return [];
        }
    }

    // ==========================================
    // FUNÇÕES DE DATA
    // ==========================================

    function formatarData(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }

    function formatarDataCompleta(data) {
        return data.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    function ehHoje(data) {
        return formatarData(data) === formatarData(hoje);
    }

    function obterInicioSemana(data) {
        const inicio = new Date(
            data.getFullYear(),
            data.getMonth(),
            data.getDate()
        );

        const diaSemana = inicio.getDay();
        const diferenca = diaSemana === 0 ? -6 : 1 - diaSemana;

        inicio.setDate(inicio.getDate() + diferenca);

        return inicio;
    }

    function obterAgendamentosDoDia(data) {
        const dataConsultada = formatarData(data);

        return obterAgendamentos()
            .filter(agendamento => agendamento.data === dataConsultada)
            .sort((a, b) =>
                (a.horario || "").localeCompare(b.horario || "")
            );
    }

    // ==========================================
    // ATUALIZAR BOTÕES DE VISUALIZAÇÃO
    // ==========================================

    function atualizarBotoesVisualizacao() {
        const botoes = [
            botaoVisualizacaoMes,
            botaoVisualizacaoSemana,
            botaoVisualizacaoDia
        ];

        botoes.forEach(botao => {
            if (!botao) return;

            const estaAtivo =
                botao.dataset.visualizacao === visualizacaoAtual;

            botao.classList.toggle("ativo", estaAtivo);
            botao.setAttribute("aria-pressed", String(estaAtivo));
        });
    }

    // ==========================================
    // CABEÇALHO DOS DIAS DA SEMANA
    // ==========================================

    function renderizarCabecalhoDias(datas) {
        diasSemana.innerHTML = "";

        datas.forEach(data => {
            const diaSemana = document.createElement("span");

            if (visualizacaoAtual === "mes") {
                diaSemana.textContent = nomesDias[data];
            } else {
                const nomeDia = nomesDias[data.getDay()];
                const numeroDia = String(data.getDate()).padStart(2, "0");
                const mes = String(data.getMonth() + 1).padStart(2, "0");

                diaSemana.textContent = `${nomeDia} ${numeroDia}/${mes}`;
            }

            diasSemana.appendChild(diaSemana);
        });
    }

    // ==========================================
    // CRIAR CÉLULA DE UM DIA
    // ==========================================

    function criarCelulaDia(data, mostrarOutrosMeses = false) {
        const dia = document.createElement("div");
        dia.className = "dia-calendario";

        const numeroDia = document.createElement("span");
        numeroDia.className = "numero-dia";
        numeroDia.textContent = data.getDate();

        if (
            mostrarOutrosMeses &&
            data.getMonth() !== dataReferencia.getMonth()
        ) {
            dia.classList.add("outro-mes");
        }

        if (ehHoje(data)) {
            dia.classList.add("hoje");
        }

        dia.appendChild(numeroDia);

        // Consultas do dia

        const agendamentosDoDia = obterAgendamentosDoDia(data);

        agendamentosDoDia.forEach(agendamento => {
            const consulta = document.createElement("div");
            consulta.className = "consulta-calendario";
            
            const horario = document.createElement("span");
            horario.textContent = agendamento.horario || "Sem horário";

            const paciente = document.createElement("span");
            paciente.textContent = agendamento.pacienteNome || "Paciente";

            const sala = document.createElement("span");
            sala.textContent = `Sala: ${agendamento.salaNome || "Não informada"}`;

            consulta.append(horario, paciente, sala);
            dia.appendChild(consulta);
        });

        // Clicar no dia abre a visualização diária

        dia.addEventListener("click", () => {
            dataReferencia = new Date(
                data.getFullYear(),
                data.getMonth(),
                data.getDate()
            );

            alterarVisualizacao("dia");
        });

        return dia;
    }

    // ==========================================
    // VISUALIZAÇÃO MENSAL
    // ==========================================

    function renderizarMes() {
        const ano = dataReferencia.getFullYear();
        const mes = dataReferencia.getMonth();

        mesAtual.textContent = dataReferencia.toLocaleDateString(
            "pt-BR",
            {
                month: "long",
                year: "numeric"
            }
        );

        descricaoVisualizacao.textContent = "Calendário mensal";

        const primeiroDia = new Date(ano, mes, 1);

        const quantidadeDias = new Date(ano, mes + 1, 0).getDate();

        const diaSemanaInicial = (primeiroDia.getDay() + 6) % 7;

        const quantidadeCelulas = Math.ceil(
            (diaSemanaInicial + quantidadeDias) / 7
        ) * 7;

        renderizarCabecalhoDias([
            1, 2, 3, 4, 5, 6, 0
        ]);

        diasSemana.style.gridTemplateColumns = "";
        diasCalendario.style.gridTemplateColumns = "";

        diasCalendario.innerHTML = "";

        for (let i = 0; i < quantidadeCelulas; i++) {
            const dataDia = new Date(
                ano,
                mes,
                i - diaSemanaInicial + 1
            );

            const dia = criarCelulaDia(dataDia, true);

            diasCalendario.appendChild(dia);
        }
    }

    // ==========================================
    // VISUALIZAÇÃO SEMANAL
    // ==========================================

    function renderizarSemana() {
        const inicioSemana = obterInicioSemana(dataReferencia);

        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(fimSemana.getDate() + 6);

        const mesmaReferencia =
            inicioSemana.getMonth() === fimSemana.getMonth() &&
            inicioSemana.getFullYear() === fimSemana.getFullYear();

        if (mesmaReferencia) {
            mesAtual.textContent =
                `${inicioSemana.getDate()} a ${fimSemana.getDate()} de ` +
                fimSemana.toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric"
                });
        } else {
            mesAtual.textContent =
                `${inicioSemana.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short"
                })} a ${fimSemana.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                })}`;
        }

        descricaoVisualizacao.textContent = "Calendário semanal";

        const datas = [];

        for (let i = 0; i < 7; i++) {
            const data = new Date(inicioSemana);
            data.setDate(data.getDate() + i);
            datas.push(data);
        }

        renderizarCabecalhoDias(datas);

        diasSemana.style.gridTemplateColumns = "repeat(7, minmax(0, 1fr))";
        diasCalendario.style.gridTemplateColumns = "repeat(7, minmax(0, 1fr))";

        diasCalendario.innerHTML = "";

        datas.forEach(data => {
            const dia = criarCelulaDia(data);
            diasCalendario.appendChild(dia);
        });
    }

    // ==========================================
    // VISUALIZAÇÃO DIÁRIA
    // ==========================================

    
    function renderizarDia() {
        mesAtual.textContent = dataReferencia.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

        descricaoVisualizacao.textContent = "Agenda diária";

        renderizarCabecalhoDias([dataReferencia]);

        diasSemana.style.gridTemplateColumns = "1fr";
        diasCalendario.style.gridTemplateColumns = "1fr";

        diasCalendario.innerHTML = "";

        const dia = document.createElement("div");
        dia.className = "dia-calendario";

        if (ehHoje(dataReferencia)) {
            dia.classList.add("hoje");
        }

        const agendamentos = obterAgendamentosDoDia(dataReferencia);

        if (agendamentos.length === 0) {
            const mensagem = document.createElement("p");

            mensagem.textContent = "Nenhuma consulta agendada para este dia.";
            mensagem.style.color = "var(--texto-secundario)";
            mensagem.style.fontSize = "12px";

            dia.appendChild(mensagem);
        } else {
            agendamentos.forEach(agendamento => {
                const consulta = document.createElement("div");
                consulta.className = "consulta-calendario consulta-detalhada";

                const horario = document.createElement("strong");
                horario.className = "consulta-horario";
                horario.textContent = agendamento.horario || "Sem horário";

                const paciente = document.createElement("span");
                paciente.className = "consulta-paciente";
                paciente.textContent = `Paciente: ${agendamento.pacienteNome || "Não informado"}`;

                const profissional = document.createElement("span");
                profissional.className = "consulta-profissional";
                profissional.textContent = `Profissional: ${agendamento.profissionalNome || "Não informado"}`;

                const profissao = document.createElement("span");
                profissao.className = "consulta-profissao";
                profissao.textContent = `Área: ${agendamento.profissao || "Não informada"}`;

                const sala = document.createElement("span");
                sala.className = "consulta-sala";
                sala.textContent = `Sala: ${agendamento.salaNome || "Não informada"}`;

                consulta.append(
                    horario,
                    paciente,
                    profissional,
                    profissao,
                    sala
                );

                if (agendamento.observacoes) {
                    const observacoes = document.createElement("span");
                    observacoes.className = "consulta-observacoes";
                    observacoes.textContent = `Observações: ${agendamento.observacoes}`;

                    consulta.appendChild(observacoes);
                }

                dia.appendChild(consulta);
            });
        }

        diasCalendario.appendChild(dia);
    }


    // ==========================================
    // RENDERIZAR CALENDÁRIO
    // ==========================================

    function renderizarCalendario() {
        atualizarBotoesVisualizacao();

        if (visualizacaoAtual === "mes") {
            renderizarMes();
        } else if (visualizacaoAtual === "semana") {
            renderizarSemana();
        } else {
            renderizarDia();
        }
    }

    // ==========================================
    // ALTERAR VISUALIZAÇÃO
    // ==========================================

    function alterarVisualizacao(novaVisualizacao) {
        visualizacaoAtual = novaVisualizacao;
        renderizarCalendario();
    }

    // ==========================================
    // NAVEGAÇÃO ENTRE PERÍODOS
    // ==========================================

    function periodoAnterior() {
        if (visualizacaoAtual === "mes") {
            dataReferencia.setDate(1);
            dataReferencia.setMonth(dataReferencia.getMonth() - 1);
        } else if (visualizacaoAtual === "semana") {
            dataReferencia.setDate(dataReferencia.getDate() - 7);
        } else {
            dataReferencia.setDate(dataReferencia.getDate() - 1);
        }

        renderizarCalendario();
    }

    function periodoProximo() {
        if (visualizacaoAtual === "mes") {
            dataReferencia.setDate(1);
            dataReferencia.setMonth(dataReferencia.getMonth() + 1);
        } else if (visualizacaoAtual === "semana") {
            dataReferencia.setDate(dataReferencia.getDate() + 7);
        } else {
            dataReferencia.setDate(dataReferencia.getDate() + 1);
        }

        renderizarCalendario();
    }

    function voltarParaHoje() {
        dataReferencia = new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            hoje.getDate()
        );

        renderizarCalendario();
    }

    // ==========================================
    // EVENTOS DOS BOTÕES
    // ==========================================

    botaoMesAnterior.addEventListener("click", periodoAnterior);
    botaoMesProximo.addEventListener("click", periodoProximo);
    botaoMesHoje.addEventListener("click", voltarParaHoje);

    botaoVisualizacaoMes.addEventListener("click", () => {
        alterarVisualizacao("mes");
    });

    botaoVisualizacaoSemana.addEventListener("click", () => {
        alterarVisualizacao("semana");
    });

    botaoVisualizacaoDia.addEventListener("click", () => {
        alterarVisualizacao("dia");
    });

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    renderizarCalendario();

})();
