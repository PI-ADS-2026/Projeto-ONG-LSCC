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
    (paciente) => String(paciente.id) === pacienteId,
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
      (profissional) => profissional.profissao === profissaoSelecionada,
    );

    if (profissionaisFiltrados.length === 0) {
      campoProfissional.innerHTML =
        '<option value="">Nenhum profissional encontrado</option>';
      return;
    }

    profissionaisFiltrados.forEach((profissional) => {
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
      campoSala.innerHTML = '<option value="">Nenhuma sala cadastrada</option>';
      campoSala.disabled = true;
      return;
    }

    salas.forEach((sala) => {
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

  function obterAgendamentosExistentes() {
    return JSON.parse(localStorage.getItem("agendamentos")) || [];
  }

  formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const profissionalId = campoProfissional.value;
    const salaId = campoSala.value;
    const dataSelecionada = campoData.value;
    const horarioSelecionado = campoHorario.value;

    const profissional = obterProfissionais().find(
      (p) => String(p.id) === profissionalId,
    );
    const sala = obterSalas().find((s) => String(s.id) === salaId);

    if (!profissional) {
      alert("Selecione um profissional válido.");
      return;
    }
    if (!sala) {
      alert("Selecione uma sala.");
      return;
    }
    if (!dataSelecionada || !horarioSelecionado) {
      alert("Preencha a data e o horário da consulta.");
      return;
    }

    // ==========================================
    // VALIDAÇÃO DE CONFLITOS DE AGENDAMENTO
    // ==========================================
    const agendamentos = obterAgendamentosExistentes();

    // 1. O mesmo paciente já tem consulta no mesmo dia e horário?
    const conflitoPaciente = agendamentos.find(
      (a) =>
        String(a.pacienteId) === String(paciente.id) &&
        a.data === dataSelecionada &&
        a.horario === horarioSelecionado &&
        a.status !== "Cancelada",
    );

    if (conflitoPaciente) {
      mostrarNotificacao(
        "Este paciente já possui uma consulta agendada para este mesmo dia e horário!",
        "erro",
      );
      return;
    }

    // 2. O mesmo médico já está ocupado no mesmo dia e horário?
    const conflitoProfissional = agendamentos.find(
      (a) =>
        String(a.profissionalId) === String(profissionalId) &&
        a.data === dataSelecionada &&
        a.horario === horarioSelecionado &&
        a.status !== "Cancelada",
    );

    if (conflitoProfissional) {
      mostrarNotificacao(
        "Este profissional já possui um agendamento neste mesmo dia e horário!",
        "erro",
      );
      return;
    }

    // 3. A sala já está ocupada no mesmo dia e horário?
    const conflitoSala = agendamentos.find(
      (a) =>
        String(a.salaId) === String(salaId) &&
        a.data === dataSelecionada &&
        a.horario === horarioSelecionado &&
        a.status !== "Cancelada",
    );

    if (conflitoSala) {
      mostrarNotificacao(
        "Esta sala já está ocupada por outro agendamento neste mesmo dia e horário!",
        "erro",
      );
      return;
    }
    // ==========================================

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
      salaNome: sala.nome,
    };

    sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(dadosAgendamento));

    window.location.href = "../pages/confirmar-agendamento.html";
  });
})();
