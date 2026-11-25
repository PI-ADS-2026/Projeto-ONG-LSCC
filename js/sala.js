document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // ARMAZENAMENTO
    // ==========================================

    const CHAVE_SALAS = "salas";

    function carregarSalas() {
        try {
            const dados = localStorage.getItem(CHAVE_SALAS);
            return dados ? JSON.parse(dados) : [];
        } catch (erro) {
            console.error("Erro ao carregar salas:", erro);
            return [];
        }
    }

    function salvarSalas() {
        try {
            localStorage.setItem(CHAVE_SALAS, JSON.stringify(salas));
            return true;
        } catch (erro) {
            console.error("Erro ao salvar salas:", erro);
            alert("Não foi possível salvar as salas.");
            return false;
        }
    }

    let salas = carregarSalas();
    let salaParaExcluir = null;

    // ==========================================
    // ELEMENTOS DA LISTAGEM
    // ==========================================

    const listaSalas = document.getElementById("lista-salas");
    const pesquisaSala = document.getElementById("pesquisa-sala");


    function gerarAvatar(nome) {
        const palavras = nome.trim().split(/\s+/);

        if (palavras.length > 1) {
            return (palavras[0][0] + palavras[1][0]).toUpperCase();
        }

        return nome.substring(0, 2).toUpperCase();
    }

    // ==========================================
    // LISTAR SALAS
    // ==========================================

    function listarSalas(filtro = "") {

        if (!listaSalas) return;

        // Limpa o container antes de renderizar
        listaSalas.innerHTML = "";

        // Cria e insere o cabeçalho da tabela dinamicamente para ele nunca sumir
        const cabecalho = document.createElement("div");
        cabecalho.className = "cabecalho-lista";
        cabecalho.innerHTML = `
            <span>Nome</span>
            <span>Metros²</span>
            <span>Ações</span>
        `;
        listaSalas.appendChild(cabecalho);

        const termo = filtro.trim().toLowerCase();

        const resultado = salas.filter(sala =>
            String(sala.nome || "").toLowerCase().includes(termo) ||
            String(sala.tamanho || "").toLowerCase().includes(termo)
        );

        if (resultado.length === 0) {
            const mensagem = document.createElement("p");
            mensagem.className = "lista-vazia";

            mensagem.textContent = salas.length === 0
                ? "Nenhuma sala cadastrada."
                : "Nenhuma sala encontrada.";

            listaSalas.appendChild(mensagem);
            return;
        }

        resultado.forEach(sala => {

            const linha = document.createElement("div");
            linha.className = "profissional";

            const informacoes = document.createElement("div");
            informacoes.className = "info-profissional";

            const avatar = document.createElement("span");
            avatar.className = "avatar-profissional";
            avatar.textContent = gerarAvatar(sala.nome);

            const nome = document.createElement("span");
            nome.className = "nome-profissional";
            nome.textContent = sala.nome;

            informacoes.append(avatar, nome);

            const tamanho = document.createElement("div");
            tamanho.className = "profissao-profissional";
            tamanho.textContent = sala.tamanho;

            const acoes = document.createElement("div");
            acoes.className = "acoes-profissional";

            const editar = document.createElement("button");
            editar.type = "button";
            editar.textContent = "Editar";

            editar.addEventListener("click", () => {
                window.location.href =
                    `atualizar-sala.html?id=${encodeURIComponent(sala.id)}`;
            });

            const excluir = document.createElement("button");
            excluir.type = "button";
            excluir.className = "btn-excluir-sala";
            excluir.textContent = "Excluir";

            excluir.addEventListener("click", () => {
                abrirModal(sala.id);
            });

            acoes.append(editar, excluir);
            linha.append(informacoes, tamanho, acoes);

            listaSalas.appendChild(linha);
        });
    }

    // ==========================================
    // PESQUISAR SALAS
    // ==========================================

    if (pesquisaSala) {
        pesquisaSala.addEventListener("input", () => {
            listarSalas(pesquisaSala.value);
        });
    }

    // ==========================================
    // MODAL DE EXCLUSÃO
    // ==========================================

    const modal = document.getElementById("modal-exclusao");
    const nomeExclusao = document.getElementById("nome-exclusao");
    const cancelar = document.getElementById("cancelar-exclusao");
    const confirmar = document.getElementById("confirmar-exclusao");

    function abrirModal(id) {

        const sala = salas.find(item =>
            String(item.id) === String(id)
        );

        if (!sala || !modal) return;

        salaParaExcluir = id;

        if (nomeExclusao) {
            nomeExclusao.textContent = sala.nome;
        }

        modal.hidden = false;
    }

    function fecharModal() {
        salaParaExcluir = null;

        if (modal) {
            modal.hidden = true;
        }
    }

    if (cancelar) {
        cancelar.addEventListener("click", fecharModal);
    }

    if (confirmar) {
        confirmar.addEventListener("click", () => {

            if (salaParaExcluir === null) return;

            const novasSalas = salas.filter(sala =>
                String(sala.id) !== String(salaParaExcluir)
            );

            const salasAnteriores = salas;
            salas = novasSalas;

            if (salvarSalas()) {
                listarSalas(pesquisaSala ? pesquisaSala.value : "");
                fecharModal();
            } else {
                salas = salasAnteriores;
            }
        });
    }

    // ==========================================
    // FORMULÁRIO DE CADASTRO E ATUALIZAÇÃO
    // ==========================================

    const formulario = document.querySelector(".formulario-sala");

    if (formulario) {

        const nome = formulario.elements.namedItem("nome");
        const tamanho = formulario.elements.namedItem("tamanho");
        const materiais = formulario.elements.namedItem("materiais");
        const cidade = formulario.elements.namedItem("cidade");
        const estado = formulario.elements.namedItem("estado");

        const parametros = new URLSearchParams(window.location.search);
        const idEdicao = parametros.get("id");

        let salaEditada = null;

        // Preencher os campos na atualização
        if (idEdicao) {

            salaEditada = salas.find(sala =>
                String(sala.id) === String(idEdicao)
            );

            if (!salaEditada) {
                alert("Sala não encontrada.");
                window.location.href = "sala.html";
                return;
            }

            nome.value = salaEditada.nome;
            tamanho.value = salaEditada.tamanho;
            materiais.value = salaEditada.materiais;
            cidade.value = salaEditada.cidade;
            estado.value = salaEditada.estado;
        }

        // Salvar cadastro ou atualização
        formulario.addEventListener("submit", event => {

            event.preventDefault();

            const nomeDigitado = nome.value.trim();
            const nomeNormalizado = nomeDigitado.toLowerCase();

            const dados = {
                nome: nomeDigitado,
                tamanho: Number(tamanho.value),
                materiais: materiais.value.trim(),
                cidade: cidade.value,
                estado: estado.value
            };

            if (
                !dados.nome ||
                !tamanho.value ||
                !dados.materiais ||
                !dados.cidade ||
                !dados.estado
            ) {
                alert("Preencha todos os campos.");
                return;
            }

            if (!Number.isFinite(dados.tamanho) || dados.tamanho <= 0) {
                alert("Informe uma metragem válida.");
                tamanho.focus();
                return;
            }

            // VERIFICAÇÃO DE DUPLICIDADE (Ignorando maiúsculas/minúsculas)
            const salaDuplicada = salas.find(sala => 
                String(sala.nome || "").trim().toLowerCase() === nomeNormalizado &&
                (!salaEditada || String(sala.id) !== String(salaEditada.id))
            );

            if (salaDuplicada) {
                alert("Já existe uma sala cadastrada com esse nome!");
                nome.focus();
                return;
            }

            const salasAnteriores = salas;

            if (salaEditada) {

                salas = salas.map(sala =>
                    String(sala.id) === String(idEdicao)
                        ? { ...sala, ...dados }
                        : sala
                );

            } else {

                const novaSala = {
                    id: window.crypto && window.crypto.randomUUID
                        ? window.crypto.randomUUID()
                        : String(Date.now()),
                    ...dados
                };

                salas = [...salas, novaSala];
            }

            if (salvarSalas()) {

                alert(
                    salaEditada
                        ? "Sala atualizada com sucesso!"
                        : "Sala cadastrada com sucesso!"
                );

                window.location.href = "sala.html";

            } else {
                salas = salasAnteriores;
            }
        });
    } // <--- CHAVE QUE FALTAVA PARA FECHAR O "if (formulario)"

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    listarSalas();

});