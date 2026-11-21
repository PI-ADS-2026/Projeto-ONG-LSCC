
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // ELEMENTOS
    // ==========================================

    const listaConsultas = document.getElementById("lista-consultas");
    const pesquisa = document.getElementById("pesquisa-consultas");
    const abasFiltro = document.querySelectorAll(".aba-consulta");

    const totalConsultas = document.getElementById("total-consultas");
    const totalAgendadas = document.getElementById("total-agendadas");
    const totalConcluidas = document.getElementById("total-concluidas");
    const totalCanceladas = document.getElementById("total-canceladas");
    const totalAusentes = document.getElementById("total-ausentes");

    // ==========================================
    // ARMAZENAMENTO
    // ==========================================

    let filtroAtual = "todos";

    function obterConsultas() {
        try {
            const consultas =
                JSON.parse(localStorage.getItem("agendamentos")) || [];

            return consultas.map(consulta => ({
                ...consulta,
                status: consulta.status || "Agendada"
            }));

        } catch (erro) {
            console.error("Erro ao carregar consultas:", erro);
            return [];
        }
    }

    function salvarConsultas(consultas) {
        localStorage.setItem("agendamentos", JSON.stringify(consultas));
    }

    // ==========================================
    // FORMATAÇÃO
    // ==========================================

    function formatarData(data) {
        if (!data) return "Data não informada";

        const [ano, mes, dia] = data.split("-");

        if (!ano || !mes || !dia) return data;

        return `${dia}/${mes}/${ano}`;
    }

    function obterDataOrdenacao(consulta) {
        const data = consulta.data || "";
        const horario = consulta.horario || "00:00";

        return new Date(`${data}T${horario}`).getTime() || 0;
    }

    function obterClasseStatus(status) {
        const classes = {
            "Agendada": "status-agendada",
            "Concluída": "status-concluida",
            "Cancelada": "status-cancelada",
            "Não compareceu": "status-ausente"
        };

        return classes[status] || "status-agendada";
    }

    // ==========================================
    // INDICADORES
    // ==========================================

    function atualizarIndicadores(consultas) {
        totalConsultas.textContent = consultas.length;

        totalAgendadas.textContent =
            consultas.filter(c => c.status === "Agendada").length;

        totalConcluidas.textContent =
            consultas.filter(c => c.status === "Concluída").length;

        totalCanceladas.textContent =
            consultas.filter(c => c.status === "Cancelada").length;

        totalAusentes.textContent =
            consultas.filter(c => c.status === "Não compareceu").length;
    }

    // ==========================================
    // FILTROS
    // ==========================================

    function filtrarConsultas(consultas) {
        const termo = pesquisa.value.trim().toLowerCase();

        return consultas.filter(consulta => {

            const correspondeStatus =
                filtroAtual === "todos" ||
                consulta.status === filtroAtual;

            const paciente =
                (consulta.pacienteNome || "").toLowerCase();

            const profissional =
                (consulta.profissionalNome || "").toLowerCase();

            const correspondePesquisa =
                paciente.includes(termo) ||
                profissional.includes(termo);

            return correspondeStatus && correspondePesquisa;
        });
    }

    // ==========================================
    // CRIAÇÃO DOS ELEMENTOS
    // ==========================================

    function criarElemento(tag, classe, texto) {
        const elemento = document.createElement(tag);

        if (classe) {
            elemento.className = classe;
        }

        if (texto !== undefined) {
            elemento.textContent = texto;
        }

        return elemento;
    }

    function criarDetalhe(icone, texto) {
        const detalhe = criarElemento("div", "detalhe-consulta-lista");

        const iconeElemento = criarElemento("i", icone);
        const textoElemento = criarElemento("span", "", texto);

        detalhe.append(iconeElemento, textoElemento);

        return detalhe;
    }

    // ==========================================
    // CARD DA CONSULTA
    // ==========================================

    function criarCardConsulta(consulta) {

        const card = criarElemento("article", "card-consulta");

        // Cabeçalho

        const topo = criarElemento("div", "card-consulta-topo");

        const informacoes = criarElemento("div", "card-consulta-identificacao");

        const nomePaciente = criarElemento(
            "h3",
            "nome-paciente-consulta",
            consulta.pacienteNome || "Paciente não informado"
        );

        const identificacao = criarElemento(
            "span",
            "consulta-identificacao",
            `Consulta #${consulta.id}`
        );

        informacoes.append(nomePaciente, identificacao);

        const status = criarElemento(
            "span",
            `consulta-status ${obterClasseStatus(consulta.status)}`,
            consulta.status
        );

        topo.append(informacoes, status);

        // Informações da consulta

        const detalhes = criarElemento("div", "card-consulta-detalhes");

        detalhes.append(
            criarDetalhe(
                "fa-regular fa-calendar",
                formatarData(consulta.data)
            ),
            criarDetalhe(
                "fa-regular fa-clock",
                consulta.horario || "Horário não informado"
            ),
            criarDetalhe(
                "fa-solid fa-user-doctor",
                consulta.profissionalNome || "Profissional não informado"
            ),
            criarDetalhe(
                "fa-solid fa-stethoscope",
                consulta.profissao || "Profissão não informada"
            )
        );

        // Observações

        const observacoes = criarElemento(
            "p",
            "consulta-observacoes",
            consulta.observacoes
                ? `Observações: ${consulta.observacoes}`
                : "Sem observações."
        );

        // Ações

        const acoes = criarElemento("div", "card-consulta-acoes");

        const labelStatus = criarElemento(
            "label",
            "label-status-consulta",
            "Alterar status:"
        );

        const selecionarStatus = criarElemento(
            "select",
            "select-status-consulta"
        );

        selecionarStatus.setAttribute(
            "aria-label",
            `Alterar status da consulta ${consulta.id}`
        );

        const opcoes = [
            "Agendada",
            "Concluída",
            "Cancelada",
            "Não compareceu"
        ];

        opcoes.forEach(opcao => {
            const option = document.createElement("option");

            option.value = opcao;
            option.textContent = opcao;
            option.selected = consulta.status === opcao;

            selecionarStatus.appendChild(option);
        });

        const botaoSalvar = criarElemento(
            "button",
            "btn-atualizar-status",
            "Atualizar status"
        );

        botaoSalvar.type = "button";

        botaoSalvar.addEventListener("click", () => {
            atualizarStatus(consulta.id, selecionarStatus.value);
        });

        labelStatus.appendChild(selecionarStatus);

        acoes.append(labelStatus, botaoSalvar);

        // Montagem do card

        card.append(topo, detalhes, observacoes, acoes);

        return card;
    }

    // ==========================================
    // ATUALIZAR STATUS
    // ==========================================

    function atualizarStatus(id, novoStatus) {

        const consultas = obterConsultas();

        const consultaEncontrada = consultas.find(
            consulta => String(consulta.id) === String(id)
        );

        if (!consultaEncontrada) {
            alert("Não foi possível encontrar essa consulta.");
            return;
        }

        consultaEncontrada.status = novoStatus;

        salvarConsultas(consultas);

        renderizarConsultas();

    }

    // ==========================================
    // ESTADO VAZIO
    // ==========================================

    function exibirMensagemVazia(mensagem) {
        const vazio = criarElemento("div", "consultas-vazio");

        const icone = criarElemento(
            "i",
            "fa-regular fa-calendar-xmark"
        );

        const texto = criarElemento("p", "", mensagem);

        vazio.append(icone, texto);
        listaConsultas.appendChild(vazio);
    }

    // ==========================================
    // RENDERIZAÇÃO
    // ==========================================

    function renderizarConsultas() {

        const consultas = obterConsultas();

        atualizarIndicadores(consultas);

        listaConsultas.innerHTML = "";

        const consultasFiltradas = filtrarConsultas(consultas);

        consultasFiltradas.sort(
            (a, b) => obterDataOrdenacao(b) - obterDataOrdenacao(a)
        );

        if (consultasFiltradas.length === 0) {

            if (pesquisa.value.trim() || filtroAtual !== "todos") {
                exibirMensagemVazia(
                    "Nenhuma consulta encontrada para os filtros selecionados."
                );
            } else {
                exibirMensagemVazia(
                    "Nenhuma consulta cadastrada até o momento."
                );
            }

            return;
        }

        consultasFiltradas.forEach(consulta => {
            const card = criarCardConsulta(consulta);
            listaConsultas.appendChild(card);
        });

    }

    // ==========================================
    // EVENTOS DOS FILTROS
    // ==========================================

    abasFiltro.forEach(aba => {

        aba.addEventListener("click", () => {

            abasFiltro.forEach(item => {
                item.classList.remove("ativo");
                item.setAttribute("aria-pressed", "false");
            });

            aba.classList.add("ativo");
            aba.setAttribute("aria-pressed", "true");

            filtroAtual = aba.dataset.status;

            renderizarConsultas();

        });

    });

    // ==========================================
    // EVENTO DA PESQUISA
    // ==========================================

    pesquisa.addEventListener("input", () => {
        renderizarConsultas();
    });

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    abasFiltro.forEach(aba => {
        aba.setAttribute(
            "aria-pressed",
            aba.classList.contains("ativo") ? "true" : "false"
        );
    });

    renderizarConsultas();

});
