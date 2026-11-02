import "./ui/style.css";
import {
  initialState,
  transition,
  targets,
  validateAssembly,
} from "./domain/engine";
import type { Command, Kind, Module, State, Target } from "./domain/types";
import { levels } from "./levels";
import { loadPreferences, savePreferences } from "./platform/storage";
import { playTone } from "./platform/audio";
import { board, descriptions, escape, glyph, icon, labels } from "./ui/art";

const root = document.querySelector<HTMLDivElement>("#app")!;
const preferences = loadPreferences();
let screen: "title" | "game" | "final" = "title";
let index = 0,
  state: State,
  history: State[] = [];
let draft: Module[] | null = null,
  selected: Kind | "remove" = "foot",
  choices: Target[] = [],
  choiceIndex = -1;
let message = "",
  error = false,
  hints = 0,
  selector = false;
const kinds: Kind[] = ["foot", "claw", "eye", "extender"];
const button = (action: string, label: string, extra = "") =>
  `<button data-action="${action}" ${extra}>${label}</button>`;
const level = () => levels[index]!;
const atStation = () =>
  level().stations.some(
    (p) => p.x === state.position.x && p.y === state.position.y,
  );
function notify(text: string, isError = false): void {
  message = text;
  error = isError;
}
function start(i: number): void {
  index = i;
  state = initialState(level());
  history = [];
  draft = null;
  choices = [];
  choiceIndex = -1;
  hints = 0;
  selector = false;
  screen = "game";
  notify("Observe o caminho. Seu corpo é parte da solução.");
  render();
}
function execute(command: Command): void {
  const result = transition(level(), state, command);
  if (!result.ok) {
    notify(result.reason, true);
    render();
    return;
  }
  history.push(structuredClone(state));
  state = result.state;
  draft = null;
  choices = [];
  choiceIndex = -1;
  notify(
    state.delivered
      ? "Uma nova vida encontrou seu lugar."
      : command.type === "assemble"
        ? "Corpo pronto. Experimente o caminho."
        : state.carrying
          ? "Semente segura. Leve-a até o berço."
          : "",
  );
  playTone(preferences.sound, state.delivered);
  if (state.delivered) {
    preferences.unlocked = Math.max(
      preferences.unlocked,
      Math.min(levels.length, index + 2),
    );
    savePreferences(preferences);
  }
  render();
  if (command.type === "assemble")
    root.querySelector<SVGElement>(".board")?.focus();
}
function interact(): void {
  if (draft || state.delivered) return;
  if (choices.length) {
    if (choiceIndex >= 0)
      execute({ type: "interact", target: choices[choiceIndex]!.id });
    else {
      notify("Escolha um alvo abaixo ou com as setas; confirme com espaço.");
      render();
    }
    return;
  }
  const available = targets(level(), state);
  if (available.length === 1) {
    execute({ type: "interact", target: available[0]!.id });
    return;
  }
  if (available.length > 1) {
    choices = available;
    choiceIndex = -1;
    notify("Há mais de um alvo. Qual você quer alcançar?");
    render();
    return;
  }
  notify("Aproxime uma garra da semente, de um mecanismo ou do berço.", true);
  render();
}
function move(dx: number, dy: number): void {
  if (draft || state.delivered) return;
  if (choices.length) {
    const matching = choices
      .map((p, i) => ({
        i,
        score: (p.x - state.position.x) * dx + (p.y - state.position.y) * dy,
      }))
      .sort((a, b) => b.score - a.score);
    choiceIndex = matching[0]!.i;
    notify(`Alvo: ${choices[choiceIndex]!.label}. Espaço para confirmar.`);
    render();
    return;
  }
  execute({ type: "move", dx, dy });
}
function undo(): void {
  if (draft) {
    draft = null;
    notify("Montagem cancelada.");
    render();
    return;
  }
  const previous = history.pop();
  if (previous) {
    state = previous;
    choices = [];
    choiceIndex = -1;
    notify("Última ação desfeita.");
    render();
  }
}
function editor(): string {
  const modules = draft!;
  const stock = kinds
    .filter((kind) => level().stock[kind] > 0)
    .map((kind) => {
      const remaining =
        level().stock[kind] - modules.filter((m) => m.kind === kind).length;
      return button(
        `piece:${kind}`,
        `${icon(kind)}<span>${labels[kind]}<small>${remaining} ${remaining === 1 ? "disponível" : "disponíveis"}</small></span>`,
        `class="piece ${selected === kind ? "selected" : ""}" aria-pressed="${selected === kind}" aria-label="Selecionar ${labels[kind]}" title="${descriptions[kind]}"`,
      );
    })
    .join("");
  let cells = "";
  for (let y = -1; y <= 1; y++)
    for (let x = -1; x <= 1; x++) {
      const module = modules.find((m) => m.x === x && m.y === y);
      cells +=
        x === 0 && y === 0
          ? `<div class="assembly-core" aria-label="Núcleo fixo">${icon("core", 42)}</div>`
          : button(
              `cell:${x}:${y}`,
              module
                ? icon(module.kind, 42)
                : '<span aria-hidden="true">+</span>',
              `class="assembly-cell" data-testid="assembly-${x}-${y}" aria-label="Encaixe ${x}, ${y}${module ? `: ${labels[module.kind]}` : ", vazio"}"`,
            );
    }
  const reason = validateAssembly(level(), state, modules);
  return `<div class="editor" data-testid="assembly-editor"><p class="eyebrow">Estação de montagem</p><h2>Que corpo o caminho pede?</h2><p class="muted">Escolha uma peça, depois um encaixe. Clique numa peça igual para removê-la.</p><div class="assembly-workbench"><div class="assembly-grid">${cells}</div><div class="stock">${stock}</div></div>${button("piece:remove", "− Remover peça", `class="text-button ${selected === "remove" ? "selected" : ""}" aria-pressed="${selected === "remove"}"`)}<p class="assembly-rule">Até quatro peças. Pé, garra e olho precisam tocar o núcleo ou um extensor.</p><p class="assembly-validation ${reason ? "invalid" : ""}">${escape(reason ?? "Tudo conectado. Vamos explorar?")}</p><div class="editor-actions">${button("confirm", "Confirmar corpo", 'class="primary" data-testid="confirm-assembly"')}${button("cancel", "Cancelar", 'class="text-button"')}</div>${button("restart", "↻ Reiniciar sala <kbd>R</kbd>", 'class="text-button editor-restart"')}</div>`;
}
function journal(): string {
  const objective = state.delivered
    ? "A semente germinou."
    : state.carrying
      ? "Leve a semente ao berço."
      : "Encontre e recolha a semente.";
  const available = targets(level(), state);
  return `<div class="journal"><p class="eyebrow">Caderno de campo</p><h2>${state.delivered ? "Um lugar para crescer" : objective}</h2><p class="instruction">${escape(level().instruction)}</p><div class="objective">${icon(state.carrying ? "seed" : "nest", 32)}<span>${state.carrying ? "Você carrega uma semente." : "A garra precisa ficar ao lado do alvo."}</span></div>${state.delivered ? `<div class="completion" data-testid="level-complete"><span class="sprout">✺</span><h3>Sala concluída</h3><p>Às vezes, mudar de forma é encontrar um caminho.</p>${button("next", index === levels.length - 1 ? "Ver o jardim →" : "Próxima sala →", 'class="primary" data-testid="next-level"')}${button("undo", "Desfazer entrega", 'class="text-button"')}</div>` : `<div class="controls"><div class="dpad">${button("up", "↑", 'aria-label="Mover para cima"')}${button("left", "←", 'aria-label="Mover para esquerda"')}${button("down", "↓", 'aria-label="Mover para baixo"')}${button("right", "→", 'aria-label="Mover para direita"')}</div><span class="key-note">Setas ou WASD</span></div>${choices.length ? `<div class="targets" role="group" aria-label="Escolher alvo">${choices.map((target, i) => button(`target:${i}`, escape(target.label), `class="${i === choiceIndex ? "selected" : ""}" data-testid="target-${i}"`)).join("")}<small>Setas escolhem · espaço confirma · Esc cancela</small></div>` : button("interact", `${icon("claw", 24)} ${available.length === 1 ? escape(available[0]!.label) : "Interagir"} <kbd>espaço</kbd>`, 'class="interact" data-testid="interact"')}${button("assemble", `${icon("station", 23)} Reorganizar corpo`, `class="assemble" data-testid="open-assembly" ${atStation() ? "" : "disabled"} title="O núcleo precisa estar sobre uma estação"`)}<div class="recovery">${button("undo", "↶ Desfazer <kbd>Z</kbd>", history.length ? "" : "disabled")}${button("restart", "↻ Reiniciar <kbd>R</kbd>")}</div><div class="hint-box">${button("hint", `Uma pista <span>${hints}/2</span>`, 'class="text-button" data-testid="hint"')}${hints ? `<p>${escape(level().hints[hints - 1]!)}</p>` : "<p>Sem pressa. Você pode experimentar à vontade.</p>"}</div>`}</div>`;
}
function titleArt(): string {
  return `<svg class="title-art" viewBox="0 0 500 460" aria-hidden="true"><defs><pattern id="paper-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#b8c2af" stroke-width=".6"/></pattern></defs><circle cx="250" cy="225" r="186" fill="#e9eadb"/><circle cx="250" cy="225" r="159" fill="url(#paper-grid)"/><path d="M101 337Q211 295 366 338" stroke="#889d83" fill="none"/><path d="M330 330Q315 277 341 253M329 302Q293 302 302 278Q328 275 329 302M330 289Q360 287 361 266Q337 264 330 289" fill="#849d80" stroke="#526c56"/>${glyph("core", 220, 210, 100)}${glyph("eye", 220, 125, 80)}${glyph("foot", 220, 295, 80)}${glyph("extender", 305, 210, 80)}${glyph("claw", 305, 295, 80)}${glyph("seed", 125, 280, 65)}<path d="M220 164V175M254 210H271M220 247V258M305 244V262" stroke="#526c56" stroke-width="8"/><text x="65" y="73" class="specimen-label">FIG. 01 — UM CORPO POSSÍVEL</text><path d="M91 92L181 163M380 150L334 196" stroke="#8d9a85" stroke-width="1"/><text x="352" y="137" class="specimen-label">ADAPTAR</text><text x="171" y="406" class="specimen-label">OBSERVAR · MUDAR · CRESCER</text></svg>`;
}
function render(): void {
  const focus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement.dataset.action
      : undefined;
  const header = `<header><a class="wordmark" href="#" data-action="home">${icon("nest", 29)}<span>corpo sob medida</span></a><div class="header-right"><span class="edition">UM PEQUENO ESTUDO SOBRE ADAPTAR-SE</span>${button("sound", preferences.sound ? "♪ Som ligado" : "♪ Som desligado", `class="text-button sound" aria-pressed="${preferences.sound}" data-testid="sound"`)}</div></header>`;
  let body: string;
  if (screen === "title")
    body = `<main class="title-screen"><section class="intro"><p class="eyebrow">Um jardim de possibilidades</p><h1>O caminho muda.<br>Você também.</h1><p class="intro-copy">Monte um corpo. Encontre uma passagem.<br>Leve uma semente a um novo começo.</p><div class="title-actions">${button("play", "Jogar →", 'class="primary" data-testid="play"')}${preferences.unlocked > 1 ? button("continue", "Continuar", 'class="secondary" data-testid="continue"') : ""}</div><p class="title-caption">Seis salas para observar, experimentar e florescer.<br>Sem pressa. Toda tentativa pode ser desfeita.</p></section><div class="specimen">${titleArt()}<span class="plate-number">CADERNO DE ADAPTAÇÕES / 001</span></div></main><footer><span>Inspirado em All Tomorrows, de C. M. Kösemen.</span><span>Uma experiência independente · formas provisórias</span></footer>`;
  else if (screen === "final")
    body = `<main class="final-screen" data-testid="campaign-complete"><p class="eyebrow">Caderno completo · seis novos começos</p><div class="garden" aria-hidden="true">${Array.from({ length: 6 }, (_, i) => `<span style="--i:${i}">${icon("nest", 70)}</span>`).join("")}</div><h1>Nenhum corpo precisa<br>ser a última forma.</h1><p>Seis sementes encontraram um lugar para crescer.<br>Você encontrou seis maneiras de chegar até elas.</p><h2>Que peça você inventaria agora?</h2><p class="muted">A próxima ideia pode começar numa conversa ou num desenho.</p>${button("revisit", "Revisitar as salas", 'class="primary"')}</main>`;
  else
    body = `<main class="game-screen"><div class="room-heading"><div><p class="eyebrow">Sala ${String(index + 1).padStart(2, "0")} / ${String(levels.length).padStart(2, "0")}</p><h1>${escape(level().name)}</h1></div>${button("selector", "Escolher sala", 'class="text-button" data-testid="level-selector"')}</div><div class="game-layout"><section class="field" aria-label="Sala de exploração">${board(level(), state, choices)}<div class="map-legend"><span>${icon("seed", 21)} semente</span><span>${icon("nest", 21)} berço</span><span>${icon("station", 21)} montagem</span><span>◇ mecanismo · ▥ porta</span></div><div class="status ${error ? "error" : ""}" role="status" aria-live="polite" data-testid="status">${escape(message || "Observe a sala. Cada forma abre uma possibilidade.")}</div></section><aside>${draft ? editor() : journal()}</aside></div></main><footer class="game-footer"><span>Seu corpo ocupa todas as peças. Olhe também para as bordas.</span><span>${state.modules.map((m) => labels[m.kind]).join(" · ")}</span></footer>`;
  root.innerHTML =
    header +
    body +
    (selector
      ? `<div class="modal-backdrop"><section class="level-dialog" role="dialog" aria-modal="true" aria-labelledby="selector-title"><p class="eyebrow">Caderno de adaptações</p><h2 id="selector-title">Escolha um novo caminho</h2><div class="level-list">${levels.map((l, i) => button(`level:${i}`, `<span>${String(i + 1).padStart(2, "0")}</span>${escape(l.name)}<small>${i < preferences.unlocked ? "→" : "Bloqueada"}</small>`, `${i < preferences.unlocked ? "" : "disabled"} data-testid="level-${i + 1}"`)).join("")}</div>${button("close-selector", "Voltar", 'class="text-button"')}</section></div>`
      : "");
  if (selector) {
    root
      .querySelectorAll<HTMLElement>("header,main,footer")
      .forEach((element) => {
        element.inert = true;
      });
    root
      .querySelector<HTMLElement>(".level-list button:not(:disabled)")
      ?.focus();
    return;
  }
  if (focus)
    root
      .querySelector<HTMLElement>(`[data-action="${focus}"]`)
      ?.focus({ preventScroll: true });
}
function closeSelector(): void {
  selector = false;
  render();
  root.querySelector<HTMLElement>('[data-action="selector"]')?.focus();
}
root.addEventListener("click", (event) => {
  const element = (event.target as Element).closest<HTMLElement>(
    "[data-action]",
  );
  if (!element) return;
  event.preventDefault();
  const action = element.dataset.action!;
  if (action === "sound") {
    preferences.sound = !preferences.sound;
    savePreferences(preferences);
    playTone(preferences.sound);
    render();
    return;
  }
  if (action === "home") {
    screen = "title";
    selector = false;
    render();
    return;
  }
  if (action === "play") {
    start(0);
    return;
  }
  if (action === "continue") {
    start(Math.min(preferences.unlocked - 1, levels.length - 1));
    return;
  }
  if (action === "revisit") {
    start(levels.length - 1);
    selector = true;
    render();
    return;
  }
  if (action.startsWith("level:")) {
    const i = Number(action.split(":")[1]);
    if (i < preferences.unlocked) start(i);
    return;
  }
  if (action === "close-selector") {
    closeSelector();
    return;
  }
  if (action === "selector") {
    selector = true;
    render();
    root
      .querySelector<HTMLElement>(".level-list button:not(:disabled)")
      ?.focus();
    return;
  }
  if (action === "restart") {
    start(index);
    return;
  }
  if (action === "undo") {
    undo();
    return;
  }
  if (action === "next") {
    if (index === levels.length - 1) {
      screen = "final";
      render();
    } else start(index + 1);
    return;
  }
  if (action === "hint") {
    hints = Math.min(2, hints + 1);
    render();
    return;
  }
  if (action === "assemble" && atStation()) {
    draft = structuredClone(state.modules);
    choices = [];
    notify("Escolha as peças para este trecho do caminho.");
    render();
    return;
  }
  if (action === "cancel") {
    draft = null;
    notify("Montagem cancelada.");
    render();
    return;
  }
  if (action === "confirm" && draft) {
    execute({ type: "assemble", modules: draft });
    return;
  }
  if (action.startsWith("piece:")) {
    selected = action.split(":")[1] as Kind | "remove";
    render();
    return;
  }
  if (action.startsWith("cell:") && draft) {
    const [, sx, sy] = action.split(":");
    const x = Number(sx),
      y = Number(sy),
      existing = draft.find((m) => m.x === x && m.y === y);
    if (selected === "remove" || existing?.kind === selected) {
      draft = draft.filter((m) => m !== existing);
    } else {
      const next = draft.filter((m) => m !== existing);
      if (
        next.filter((m) => m.kind === selected).length >=
        level().stock[selected]
      ) {
        notify("Todas as peças desse tipo já estão no corpo.", true);
        render();
        return;
      }
      if (next.length >= 4) {
        notify("O corpo comporta até quatro peças além do núcleo.", true);
        render();
        return;
      }
      draft = [...next, { x, y, kind: selected }];
    }
    notify("A montagem só muda quando você confirmar.");
    render();
    return;
  }
  if (action.startsWith("target:")) {
    const target = choices[Number(action.split(":")[1])];
    if (target) execute({ type: "interact", target: target.id });
    return;
  }
  if (action === "interact") {
    interact();
    return;
  }
  const directions: Record<string, [number, number]> = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0],
  };
  if (directions[action]) move(...directions[action]);
});
document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (selector) {
    if (event.key === "Escape") {
      closeSelector();
      return;
    }
    if (event.key === "Tab") {
      const nodes = [
        ...root.querySelectorAll<HTMLElement>(
          ".level-dialog button:not(:disabled)",
        ),
      ];
      const first = nodes[0],
        last = nodes.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    return;
  }
  if (screen !== "game") return;
  const key = event.key.toLowerCase();
  if (key === "r") {
    event.preventDefault();
    start(index);
    return;
  }
  if (key === "z") {
    event.preventDefault();
    undo();
    return;
  }
  if (key === "escape") {
    draft = null;
    choices = [];
    choiceIndex = -1;
    notify("Exploração retomada.");
    render();
    return;
  }
  if (draft) return;
  const focused =
    document.activeElement instanceof HTMLElement &&
    document.activeElement.matches("button,a,input,select,textarea");
  if (focused && !choices.length) return;
  const direction: Record<string, [number, number]> = {
    arrowup: [0, -1],
    w: [0, -1],
    arrowdown: [0, 1],
    s: [0, 1],
    arrowleft: [-1, 0],
    a: [-1, 0],
    arrowright: [1, 0],
    d: [1, 0],
  };
  if (direction[key]) {
    event.preventDefault();
    move(...direction[key]);
  } else if (key === " ") {
    event.preventDefault();
    interact();
  }
});
render();
