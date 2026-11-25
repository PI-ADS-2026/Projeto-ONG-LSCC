document.addEventListener("DOMContentLoaded", () => {
    const campoFiltroData = document.getElementById("filtro-data");
    const corpoTabela = document.getElementById("lista-agenda-corpo");

    // Define a data de hoje como padrão no filtro
    const hoje = new Date().toISOString().split("T")[0];
    campoFiltroData.value = hoje;

    function carregarAgenda(dataFiltro) {
        const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
        const salas = JSON.parse(localStorage.getItem("salas")) || [];

        corpoTabela.innerHTML = "";

        // Filtra agendamentos da data selecionada e que não estejam cancelados
        const agendamentosDoDia = agendamentos.filter(a => a.data === dataFiltro && a.status !== "Cancelada");

        if (agendamentosDoDia.length === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #771;">Nenhuma sala ocupada nesta data.</td></tr>`;
            return;
        }

        agendamentosDoDia.forEach(a => {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid #eee";
            tr.innerHTML = `
                <td style="padding: 12px; font-weight: 600;">${a.salaNome || "Sala"}</td>
                <td style="padding: 12px;">${a.horario}</td>
                <td style="padding: 12px;">${a.pacienteNome}</td>
                <td style="padding: 12px;">${a.profissionalNome} (${a.profissao})</td>
                <td style="padding: 12px;"><span style="background: #e3f2fd; color: #1565c0; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Ocupada</span></td>
            `;
            corpoTabela.appendChild(tr);
        });
    }

    carregarAgenda(campoFiltroData.value);

    campoFiltroData.addEventListener("change", (e) => {
        carregarAgenda(e.target.value);
    });
});