import "./ui/style.css";
import {
  initialState,
  targets,
  transition,
  validateAssembly,
} from "./domain/engine";
import type { Command, Kind, Module, State, Target } from "./domain/types";
import { levels } from "./levels";
import { loadPreferences, savePreferences } from "./platform/storage";
import { playTone } from "./platform/audio";
import { board, descriptions, escape, icon, labels } from "./ui/art";
const root = document.querySelector<HTMLDivElement>("#app")!;
const preferences = loadPreferences(),
  kinds: Kind[] = ["foot", "claw", "eye", "extender"];
let screen: "title" | "game" | "final" = "title",
  index = 0,
  state: State,
  history: State[] = [],
  draft: Module[] | null = null,
  selected: Kind | "remove" = "foot",
  preset = 0,
  choices: Target[] = [],
  choice = -1,
  message = "",
  error = false,
  hints = 0;
let formsOpen = false,
  selector = false;
const level = () => levels[index]!;
const objective = () =>
  level().objective ?? {
    type: "deliver" as const,
    title: "Leve a semente",
    description: level().instruction,
    itemLabel: "semente",
    destinationLabel: "berço",
    success: "Uma nova vida encontrou seu lugar.",
  };
const station = () =>
  level().stations.some(
    (p) => p.x === state.position.x && p.y === state.position.y,
  );
const btn = (a: string, text: string, extra = "") =>
  `<button data-action="${a}" ${extra}>${text}</button>`;
const say = (text: string, bad = false) => {
  message = text;
  error = bad;
};
function coach() {
  const nearby = targets(level(), state);
  return !history.length
    ? (level().intro ?? "Comece andando. Este corpo já tem um pé.")
    : nearby.length
      ? `A garra alcança: ${nearby.map((item) => item.label).join(" · ")}.`
      : station() && level().presets?.length
        ? "A estação oferece formas prontas."
        : (level().companion?.dialogue ?? objective().description);
}
function start(next: number) {
  index = next;
  state = initialState(level());
  history = [];
  draft = null;
  formsOpen = false;
  choices = [];
  choice = -1;
  preset = 0;
  hints = 0;
  formsOpen = false;
  selector = false;
  screen = "game";
  say(level().intro ?? "Seu corpo já pode se mover.");
  render();
  root.querySelector<HTMLElement>('[data-action="selector"]')?.focus();
}
function run(command: Command) {
  const result = transition(level(), state, command);
  if (!result.ok) {
    say(result.reason, true);
    render();
    return;
  }
  history.push(structuredClone(state));
  state = result.state;
  draft = null;
  formsOpen = false;
  choices = [];
  choice = -1;
  if (state.delivered) {
    preferences.unlocked = Math.max(
      preferences.unlocked,
      Math.min(levels.length, index + 2),
    );
    savePreferences(preferences);
    say(objective().success);
  } else if (command.type === "assemble")
    say("Forma pronta. Veja o que ela permite.");
  else
    say(
      state.carrying
        ? objective().itemLabel +
            " segura. Continue até " +
            objective().destinationLabel +
            "."
        : coach(),
    );
  playTone(preferences.sound, state.delivered);
  render();
  if (command.type === "assemble")
    root.querySelector<SVGElement>(".board")?.focus();
}
function move(dx: number, dy: number) {
  if (draft || state.delivered) return;
  if (choices.length) {
    choice = choices
      .map((p, i) => ({
        i,
        score: (p.x - state.position.x) * dx + (p.y - state.position.y) * dy,
      }))
      .sort((a, b) => b.score - a.score)[0]!.i;
    say("Alvo: " + choices[choice]!.label + ". Interaja para confirmar.");
    render();
  } else run({ type: "move", dx, dy });
}
function interact() {
  if (draft || state.delivered) return;
  if (choices.length) {
    if (choice >= 0) run({ type: "interact", target: choices[choice]!.id });
    else {
      say("Escolha explicitamente qual alvo ajudar.", true);
      render();
    }
    return;
  }
  const available = targets(level(), state);
  if (available.length === 1)
    run({ type: "interact", target: available[0]!.id });
  else if (available.length > 1) {
    choices = available;
    say("Há mais de um alvo ao alcance.");
    render();
  } else {
    say("Aproxime a garra do que precisa de ajuda.", true);
    render();
  }
}
function undo() {
  if (draft) {
    draft = null;
    say("Edição cancelada.");
  } else {
    const previous = history.pop();
    if (!previous) return;
    state = previous;
    choices = [];
    choice = -1;
    say("Última ação desfeita.");
  }
  render();
}
function forms() {
  const presets = level().presets ?? [];
  if (!presets.length) return "";
  const cards = presets
    .map((item, i) => {
      const diagram = item.modules
        .map(
          (module) =>
            `<span class="preset-module" style="grid-column:${module.x + 2};grid-row:${module.y + 2}">${icon(module.kind, 18)}</span>`,
        )
        .join("");
      return btn(
        "preset:" + i,
        `<span class="preset-diagram"><span class="preset-core">${icon("core", 22)}</span>${diagram}</span><span><strong>${escape(item.name)}</strong><small>${escape(item.description)}</small></span>`,
        `class="preset ${i === preset ? "selected" : ""}" data-testid="preset-${item.id}"`,
      );
    })
    .join("");
  return `<section class="preset-section"><p class="eyebrow">Formas para esta sala</p><div class="preset-list">${cards}</div>${btn("preset-confirm", "Usar esta forma", 'class="primary" data-testid="preset-confirm"')}${btn("free-editor", "Editar cada peça", 'class="text-button"')}<div class="recovery">${btn("close-forms", "Cancelar", 'data-testid="cancel-forms"')}${btn("restart", "Reiniciar", 'aria-label="Reiniciar missão"')}</div></section>`;
}
function editor() {
  const modules = draft!,
    stock = kinds
      .filter((kind) => level().stock[kind])
      .map((kind) =>
        btn(
          "piece:" + kind,
          icon(kind) +
            "<span>" +
            labels[kind] +
            "<small>" +
            (level().stock[kind] -
              modules.filter((item) => item.kind === kind).length) +
            " disponível</small></span>",
          `class="piece ${selected === kind ? "selected" : ""}" title="${descriptions[kind]}"`,
        ),
      )
      .join("");
  let cells = "";
  for (let y = -1; y <= 1; y += 1)
    for (let x = -1; x <= 1; x += 1) {
      const item = modules.find((m) => m.x === x && m.y === y);
      cells +=
        x === 0 && y === 0
          ? `<div class="assembly-core">${icon("core", 42)}</div>`
          : btn(
              "cell:" + x + ":" + y,
              item ? icon(item.kind, 42) : "+",
              `class="assembly-cell" data-testid="assembly-${x}-${y}" aria-label="Encaixe ${x}, ${y}: ${item ? labels[item.kind] : "vazio"}"`,
            );
    }
  const reason = validateAssembly(level(), state, modules);
  return `<div class="editor" data-testid="assembly-editor"><p class="eyebrow">Laboratório livre</p><h2>Desenhe uma forma</h2><p class="muted">Opcional: Tab percorre as peças e a grade; setas não movem o corpo aqui.</p><div class="assembly-workbench"><div class="assembly-grid">${cells}</div><div class="stock">${stock}</div></div>${btn("piece:remove", "− Remover peça", 'class="text-button"')}<p class="assembly-validation ${reason ? "invalid" : ""}">${escape(reason ?? "Forma válida. Confirme quando quiser.")}</p>${btn("confirm", "Confirmar corpo", 'class="primary" data-testid="confirm-assembly"')}${btn("cancel", "Voltar", 'class="text-button"')}${btn("restart", "Reiniciar", 'class="text-button"')}</div>`;
}
function side() {
  const companion = level().companion,
    done = state.delivered,
    available = targets(level(), state);
  const companionHtml = companion
    ? `<section class="companion-card" data-testid="companion">${icon("companion", 30)}<p><strong>${escape(companion.name)}</strong><br>“${escape(companion.dialogue)}”</p></section>`
    : "";
  const targetsHtml = choices.length
    ? `<div class="targets" role="group" aria-label="Escolher alvo">${choices.map((item, i) => btn("target:" + i, escape(item.label), `class="${i === choice ? "selected" : ""}" data-testid="target-${i}"`)).join("")}${btn("cancel-targets", "Cancelar escolha", 'class="text-button"')}</div>`
    : btn(
        "interact",
        icon("claw", 22) +
          (available.length === 1
            ? " " + escape(available[0]!.label)
            : " Interagir") +
          " <kbd>E / espaço</kbd>",
        'class="interact" data-testid="interact"',
      );
  const controls = `<div class="controls"><div class="dpad">${btn("up", "↑", 'aria-label="Mover para cima"')}${btn("left", "←", 'aria-label="Mover para esquerda"')}${btn("down", "↓", 'aria-label="Mover para baixo"')}${btn("right", "→", 'aria-label="Mover para direita"')}</div><span class="key-note">Setas / WASD<br>clique ou toque</span></div>`;
  const completed = `<div class="completion" data-testid="level-complete"><span class="sprout">✺</span><h3>${escape(objective().success)}</h3><p>${companion ? escape(companion.name) + " comemora a transformação." : "A sala mudou com a ajuda."}</p>${btn("next", index === levels.length - 1 ? "Ver a comunidade" : "Próxima missão", 'class="primary" data-testid="next-level"')}<small>N ou Enter para continuar</small><div class="recovery">${btn("undo", "Desfazer conclusão")}${btn("restart", "Reiniciar")}</div></div>`;
  return `<div class="journal"><p class="eyebrow">Missão cooperativa</p><h2 data-testid="mission-title">${escape(objective().title)}</h2><p class="instruction">${escape(objective().description)}</p>${companionHtml}<div class="objective">${icon("nest", 30)}<span>${state.carrying ? "Você carrega " + escape(objective().itemLabel) + "." : escape(objective().type === "arrive" ? "Chegue a " + objective().destinationLabel + "." : "Ajude em " + objective().destinationLabel + ".")}</span></div>${done ? completed : controls + targetsHtml + (formsOpen ? forms() : "") + btn("assemble", icon("station", 22) + " Mudar corpo <kbd>M</kbd>", 'class="assemble" data-testid="open-assembly" ' + (station() ? "" : "disabled")) + '<div class="recovery">' + btn("undo", "↶ Desfazer <kbd>Z</kbd>", history.length ? "" : "disabled") + btn("restart", "↻ Reiniciar <kbd>R</kbd>") + "</div>" + btn("hint", "Uma pista <span>" + hints + "/2</span>", 'class="text-button" data-testid="hint"')}</div>`;
}
function levelDialog(): string {
  const rows = levels
    .map((item, itemIndex) =>
      btn(
        "level:" + itemIndex,
        "<span>" +
          String(itemIndex + 1).padStart(2, "0") +
          "</span>" +
          escape(item.name),
        (itemIndex < preferences.unlocked ? "" : "disabled") +
          ' data-testid="level-' +
          (itemIndex + 1) +
          '"',
      ),
    )
    .join("");
  return (
    '<div class="modal-backdrop"><section class="level-dialog" role="dialog"><h2>Escolha um caminho</h2><div class="level-list">' +
    rows +
    "</div>" +
    btn("close-selector", "Voltar") +
    "</section></div>"
  );
}
function render() {
  const header = `<header><a class="wordmark" href="#" data-action="home">${icon("nest", 29)}<span>corpo sob medida</span></a>${btn("sound", preferences.sound ? "♪ Som ligado" : "♪ Som desligado", 'class="text-button sound"')}</header>`;
  let body: string;
  if (screen === "title")
    body = `<main class="title-screen"><section class="intro"><p class="eyebrow">Um jardim de muitos corpos</p><h1>O caminho muda.<br>Alguém precisa de você.</h1><p class="intro-copy">Comece andando. Observe quem espera ajuda.<br>Depois, escolha uma forma para a situação.</p><div class="title-actions">${btn("new", "Nova jornada", 'class="primary" data-testid="play"')}${preferences.unlocked > 1 ? btn("continue", "Continuar", 'class="secondary" data-testid="continue"') : ""}</div></section><div class="specimen">${icon("companion", 180)}</div></main>`;
  else if (screen === "final")
    body = `<main class="final-screen" data-testid="campaign-complete"><p class="eyebrow">A comunidade se reúne</p><div class="garden community">${Array.from({ length: 6 }, () => "<span>" + icon("companion", 62) + "</span>").join("")}</div><h1>Nenhum corpo resolve<br>o jardim sozinho.</h1><p>As seis salas agora guardam encontros que vocês transformaram juntos.</p>${btn("revisit", "Revisitar missões", 'class="primary"')}</main>`;
  else
    body = `<main class="game-screen"><div class="room-heading"><div><p class="eyebrow">Missão ${String(index + 1).padStart(2, "0")} / ${String(levels.length).padStart(2, "0")}</p><h1>${escape(level().name)}</h1></div><button data-action="selector" data-testid="level-selector">Escolher missão</button></div><div class="game-layout"><section class="field">${board(level(), state, choices)}<div class="status ${error ? "error" : ""}" data-testid="status">${escape(message || coach())}</div></section><aside>${draft ? editor() : formsOpen ? forms() : side()}</aside></div></main>`;
  root.innerHTML = header + body + (selector ? levelDialog() : "");
  if (selector)
    root
      .querySelector<HTMLElement>(".level-list button:not(:disabled)")
      ?.focus();
}
root.addEventListener("click", (event) => {
  const element = (event.target as Element).closest<HTMLElement>(
    "[data-action]",
  );
  if (!element) {
    (event.target as Element).closest<SVGElement>(".board")?.focus();
    return;
  }
  event.preventDefault();
  const action = element.dataset.action!;
  if (action === "sound") {
    preferences.sound = !preferences.sound;
    savePreferences(preferences);
    render();
    return;
  }
  if (action === "home") {
    screen = "title";
    render();
    return;
  }
  if (action === "new") {
    start(0);
    return;
  }
  if (action === "continue") {
    start(Math.min(preferences.unlocked - 1, levels.length - 1));
    return;
  }
  if (action === "revisit") {
    selector = true;
    screen = "game";
    render();
    return;
  }
  if (action === "selector") {
    selector = true;
    render();
    return;
  }
  if (action === "close-selector") {
    selector = false;
    render();
    return;
  }
  if (action.startsWith("level:")) {
    const next = Number(action.slice(6));
    if (next < preferences.unlocked) start(next);
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
    say(level().hints[hints - 1]!);
    render();
    root.querySelector<HTMLElement>('[data-action="hint"]')?.focus();
    return;
  }
  if (action === "assemble" && station()) {
    if (level().presets?.length) {
      preset = 0;
      formsOpen = true;
      say("Escolha uma forma pronta ou edite livremente.");
      render();
    } else {
      draft = structuredClone(state.modules);
      render();
    }
    return;
  }
  if (action.startsWith("preset:")) {
    preset = Number(action.slice(7));
    say(level().presets?.[preset]?.description ?? "");
    render();
    return;
  }
  if (action === "preset-confirm") {
    const item = level().presets?.[preset];
    if (item) run({ type: "assemble", modules: item.modules });
    return;
  }
  if (action === "free-editor") {
    draft = structuredClone(state.modules);
    render();
    return;
  }
  if (action === "close-forms" || action === "cancel-targets") {
    draft = null;
    formsOpen = false;
    choices = [];
    choice = -1;
    render();
    root.querySelector<SVGElement>(".board")?.focus();
    return;
  }
  if (action === "cancel") {
    draft = null;
    render();
    return;
  }
  if (action === "confirm" && draft) {
    run({ type: "assemble", modules: draft });
    return;
  }
  if (action.startsWith("piece:")) {
    selected = action.slice(6) as Kind | "remove";
    render();
    return;
  }
  if (action.startsWith("cell:") && draft) {
    const [, sx, sy] = action.split(":");
    const x = Number(sx),
      y = Number(sy),
      existing = draft.find((item) => item.x === x && item.y === y);
    if (selected === "remove" || existing?.kind === selected)
      draft = draft.filter((item) => item !== existing);
    else {
      const next = draft.filter((item) => item !== existing);
      if (
        next.length < 4 &&
        next.filter((item) => item.kind === selected).length <
          level().stock[selected]
      )
        draft = [...next, { x, y, kind: selected }];
    }
    render();
    return;
  }
  if (action.startsWith("target:")) {
    const item = choices[Number(action.slice(7))];
    if (item) run({ type: "interact", target: item.id });
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
  if (screen !== "game" || event.altKey || event.ctrlKey || event.metaKey)
    return;
  const key = event.key.toLowerCase();
  if (selector) {
    if (key === "escape") {
      selector = false;
      render();
    }
    return;
  }
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
    formsOpen = false;
    choices = [];
    choice = -1;
    render();
    return;
  }
  if (
    state.delivered &&
    (key === "n" ||
      (key === "enter" &&
        !(
          document.activeElement instanceof HTMLElement &&
          document.activeElement.matches("button,a,input,select,textarea")
        )))
  ) {
    event.preventDefault();
    if (index === levels.length - 1) {
      screen = "final";
      render();
    } else start(index + 1);
    return;
  }
  if (draft) return;
  if (key === "m" && station()) {
    event.preventDefault();
    if (level().presets?.length) {
      preset = 0;
      formsOpen = true;
      render();
    } else {
      draft = structuredClone(state.modules);
      render();
    }
    return;
  }
  if (station() && /^[123]$/.test(key) && level().presets?.[Number(key) - 1]) {
    preset = Number(key) - 1;
    render();
    return;
  }
  if (
    formsOpen &&
    station() &&
    key === "enter" &&
    level().presets?.length &&
    !(
      document.activeElement instanceof HTMLElement &&
      document.activeElement.matches("button,a,input,select,textarea")
    )
  ) {
    run({ type: "assemble", modules: level().presets![preset]!.modules });
    return;
  }
  const focused =
    document.activeElement instanceof HTMLElement &&
    document.activeElement.matches("button,a,input,select,textarea");
  if (focused && !choices.length) return;
  const directions: Record<string, [number, number]> = {
    arrowup: [0, -1],
    w: [0, -1],
    arrowdown: [0, 1],
    s: [0, 1],
    arrowleft: [-1, 0],
    a: [-1, 0],
    arrowright: [1, 0],
    d: [1, 0],
  };
  if (directions[key]) {
    event.preventDefault();
    move(...directions[key]);
  } else if (key === " " || key === "e") {
    event.preventDefault();
    interact();
  }
});
render();
