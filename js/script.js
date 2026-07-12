const CHAVE_ARMAZENAMENTO = "lista-tarefas-dinamica";

/** @type {{ id: number, texto: string, concluida: boolean }[]} */
let tarefas = [];
/** @type {"todas" | "ativas" | "concluidas"} */
let filtroAtual = "todas";

const formularioTarefa = document.getElementById("formulario-tarefa");
const entradaTarefa = document.getElementById("entrada-tarefa");
const listaTarefas = document.getElementById("lista-tarefas");
const contadorPendentes = document.getElementById("contador-pendentes");
const botaoLimparHistorico = document.getElementById("botao-limpar-historico");
const botoesFiltro = document.querySelectorAll(".botao-filtro");
const modalConfirmacao = document.getElementById("modal-confirmacao");
const botaoCancelarLimpeza = document.getElementById("botao-cancelar-limpeza");

let elementoFocoAnterior = null;

function carregarDoLocalStorage() {
  const dadosSalvos = localStorage.getItem(CHAVE_ARMAZENAMENTO);

  if (!dadosSalvos) {
    tarefas = [];
    return;
  }

  try {
    const dadosParseados = JSON.parse(dadosSalvos);
    tarefas = Array.isArray(dadosParseados) ? dadosParseados : [];
  } catch {
    tarefas = [];
  }
}

function salvarNoLocalStorage() {
  localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(tarefas));
}

function obterTarefasFiltradas() {
  if (filtroAtual === "ativas") {
    return tarefas.filter((tarefa) => !tarefa.concluida);
  }

  if (filtroAtual === "concluidas") {
    return tarefas.filter((tarefa) => tarefa.concluida);
  }

  return tarefas;
}

function atualizarContador() {
  const quantidadePendentes = tarefas.filter((tarefa) => !tarefa.concluida).length;
  const rotulo = quantidadePendentes === 1 ? "item pendente" : "itens pendentes";
  contadorPendentes.textContent = `${quantidadePendentes} ${rotulo}`;
}

function criarElementoTarefa(tarefa) {
  const item = document.createElement("li");
  item.className = `tarefa${tarefa.concluida ? " concluida" : ""}`;
  item.dataset.id = String(tarefa.id);

  const caixaSelecao = document.createElement("input");
  caixaSelecao.type = "checkbox";
  caixaSelecao.className = "caixa-selecao";
  caixaSelecao.checked = tarefa.concluida;
  caixaSelecao.dataset.acao = "alternar";
  caixaSelecao.setAttribute("aria-label", "Marcar tarefa como concluída");

  const texto = document.createElement("span");
  texto.className = "texto-tarefa";
  texto.textContent = tarefa.texto;
  texto.dataset.acao = "alternar";

  const acoes = document.createElement("div");
  acoes.className = "acoes-tarefa";

  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.className = "botao-acao botao-editar";
  botaoEditar.dataset.acao = "editar";
  botaoEditar.setAttribute("aria-label", "Editar tarefa");
  botaoEditar.innerHTML = `
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.921-.922l.93-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086ZM11.189 6.25 9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.25.25 0 0 0 .108-.064l6.286-6.286Z"
      />
    </svg>
  `;

  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "botao-acao botao-excluir";
  botaoExcluir.dataset.acao = "excluir";
  botaoExcluir.setAttribute("aria-label", "Excluir tarefa");
  botaoExcluir.innerHTML = `
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.5 1h3a.5.5 0 0 1 .5.5V3h3.5a.5.5 0 0 1 0 1H14v9.5A1.5 1.5 0 0 1 12.5 15h-9A1.5 1.5 0 0 1 2 13.5V4h.5a.5.5 0 0 1 0-1H6V1.5a.5.5 0 0 1 .5-.5ZM7 3h2V2H7v1ZM3 4v9.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V4H3Zm3 2.5a.5.5 0 0 1 1 0v5a.5.5 0 0 1-1 0v-5Zm3 0a.5.5 0 0 1 1 0v5a.5.5 0 0 1-1 0v-5Z"
      />
    </svg>
  `;

  acoes.append(botaoEditar, botaoExcluir);
  item.append(caixaSelecao, texto, acoes);
  return item;
}

function renderizarLista() {
  const tarefasVisiveis = obterTarefasFiltradas();
  listaTarefas.innerHTML = "";

  tarefasVisiveis.forEach((tarefa) => {
    listaTarefas.appendChild(criarElementoTarefa(tarefa));
  });

  atualizarContador();
}

function adicionarTarefa(evento) {
  evento.preventDefault();

  const texto = entradaTarefa.value.trim();

  if (!texto) {
    entradaTarefa.value = "";
    entradaTarefa.focus();
    return;
  }

  const novaTarefa = {
    id: Date.now(),
    texto,
    concluida: false,
  };

  tarefas.push(novaTarefa);
  salvarNoLocalStorage();
  renderizarLista();

  entradaTarefa.value = "";
  entradaTarefa.focus();
}

function alternarStatus(id) {
  tarefas = tarefas.map((tarefa) => {
    if (tarefa.id === id) {
      return { ...tarefa, concluida: !tarefa.concluida };
    }
    return tarefa;
  });

  salvarNoLocalStorage();
  renderizarLista();
}

function excluirTarefa(id, elementoItem) {
  let exclusaoFinalizada = false;

  const finalizarExclusao = () => {
    if (exclusaoFinalizada) {
      return;
    }

    exclusaoFinalizada = true;
    tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
    salvarNoLocalStorage();
    renderizarLista();
  };

  if (!elementoItem) {
    finalizarExclusao();
    return;
  }

  elementoItem.classList.add("saindo");
  elementoItem.addEventListener("transitionend", finalizarExclusao, { once: true });
  window.setTimeout(finalizarExclusao, 280);
}

function abrirModalConfirmacao() {
  if (tarefas.length === 0) {
    return;
  }

  elementoFocoAnterior = document.activeElement;
  modalConfirmacao.hidden = false;
  document.body.style.overflow = "hidden";
  botaoCancelarLimpeza.focus();
}

function fecharModalConfirmacao() {
  modalConfirmacao.hidden = true;
  document.body.style.overflow = "";

  if (elementoFocoAnterior instanceof HTMLElement) {
    elementoFocoAnterior.focus();
  } else {
    botaoLimparHistorico.focus();
  }

  elementoFocoAnterior = null;
}

function confirmarLimpezaHistorico() {
  tarefas = [];
  salvarNoLocalStorage();
  renderizarLista();
  fecharModalConfirmacao();
}

function tratarCliqueNoModal(evento) {
  const acao = evento.target.closest("[data-acao-modal]")?.dataset.acaoModal;

  if (acao === "cancelar") {
    fecharModalConfirmacao();
  }

  if (acao === "confirmar") {
    confirmarLimpezaHistorico();
  }
}

function tratarTeclaNoModal(evento) {
  if (modalConfirmacao.hidden) {
    return;
  }

  if (evento.key === "Escape") {
    evento.preventDefault();
    fecharModalConfirmacao();
  }
}

function limparHistorico() {
  abrirModalConfirmacao();
}

function definirFiltro(novoFiltro) {
  filtroAtual = novoFiltro;

  botoesFiltro.forEach((botao) => {
    const estaAtivo = botao.dataset.filtro === novoFiltro;
    botao.classList.toggle("ativo", estaAtivo);
    botao.setAttribute("aria-pressed", String(estaAtivo));
  });

  renderizarLista();
}

function iniciarEdicaoTarefa(id, elementoTexto) {
  const tarefa = tarefas.find((item) => item.id === id);

  if (!tarefa || !elementoTexto) {
    return;
  }

  const item = elementoTexto.closest(".tarefa");
  const entradaEdicao = document.createElement("input");
  entradaEdicao.type = "text";
  entradaEdicao.className = "entrada-edicao";
  entradaEdicao.value = tarefa.texto;
  entradaEdicao.maxLength = 120;

  elementoTexto.replaceWith(entradaEdicao);
  entradaEdicao.focus();
  entradaEdicao.select();

  let edicaoEncerrada = false;

  const salvarEdicao = () => {
    if (edicaoEncerrada) {
      return;
    }

    edicaoEncerrada = true;
    const textoAtualizado = entradaEdicao.value.trim();

    if (!textoAtualizado) {
      renderizarLista();
      return;
    }

    tarefas = tarefas.map((itemTarefa) => {
      if (itemTarefa.id === id) {
        return { ...itemTarefa, texto: textoAtualizado };
      }
      return itemTarefa;
    });

    salvarNoLocalStorage();
    renderizarLista();
  };

  const cancelarEdicao = () => {
    if (edicaoEncerrada) {
      return;
    }

    edicaoEncerrada = true;
    renderizarLista();
  };

  entradaEdicao.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
      evento.preventDefault();
      salvarEdicao();
    }

    if (evento.key === "Escape") {
      evento.preventDefault();
      cancelarEdicao();
    }
  });

  entradaEdicao.addEventListener("blur", salvarEdicao);

  if (item) {
    item.querySelector(".caixa-selecao")?.setAttribute("disabled", "true");
  }
}

function tratarCliqueNaLista(evento) {
  const alvo = evento.target;
  const item = alvo.closest(".tarefa");

  if (!item) {
    return;
  }

  const id = Number(item.dataset.id);
  const acao = alvo.dataset.acao || alvo.closest("[data-acao]")?.dataset.acao;

  if (acao === "excluir") {
    excluirTarefa(id, item);
    return;
  }

  if (acao === "editar") {
    const elementoTexto = item.querySelector(".texto-tarefa");
    iniciarEdicaoTarefa(id, elementoTexto);
    return;
  }

  if (acao === "alternar") {
    if (alvo.classList.contains("entrada-edicao")) {
      return;
    }
    alternarStatus(id);
  }
}

function tratarDuploCliqueNaLista(evento) {
  const alvo = evento.target;

  if (!alvo.classList.contains("texto-tarefa")) {
    return;
  }

  const item = alvo.closest(".tarefa");
  if (!item) {
    return;
  }

  const id = Number(item.dataset.id);
  iniciarEdicaoTarefa(id, alvo);
}

function inicializarAplicacao() {
  carregarDoLocalStorage();
  renderizarLista();

  formularioTarefa.addEventListener("submit", adicionarTarefa);
  listaTarefas.addEventListener("click", tratarCliqueNaLista);
  listaTarefas.addEventListener("dblclick", tratarDuploCliqueNaLista);
  botaoLimparHistorico.addEventListener("click", limparHistorico);
  modalConfirmacao.addEventListener("click", tratarCliqueNoModal);
  document.addEventListener("keydown", tratarTeclaNoModal);

  botoesFiltro.forEach((botao) => {
    botao.addEventListener("click", () => {
      definirFiltro(botao.dataset.filtro);
    });
  });

  entradaTarefa.focus();
}

inicializarAplicacao();
