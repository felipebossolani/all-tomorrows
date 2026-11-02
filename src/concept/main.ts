import "./style.css";

type Point = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };
type Phase = "worms" | "titans";

const host = document.querySelector<HTMLElement>("#concept")!;
host.innerHTML = `
<header><a href="./">Corpo sob Medida</a><span>ESTUDO JOGÁVEL · 01</span><span id="chapter">ALL TOMORROWS / WORMS</span></header>
<section class="intro"><div><p class="eyebrow" id="eyebrow">DEPOIS DOS QU</p><h1 id="title">Sob a superfície</h1><p id="subtitle">O mundo mudou. A vida encontrou outro caminho.</p></div><div class="context" id="context">Star People → intervenção dos Qu → <strong>Worms</strong><br>Um recorte do começo dos pós-humanos. Não é o início completo do livro.</div></section>
<section class="stage" aria-label="Protótipo de movimento entre capítulos">
<div class="status"><strong id="objective">Aprenda a escavar</strong><span id="progress">0 / 3 raízes</span></div>
<svg id="world" data-phase="worms" viewBox="0 0 960 400" role="img" aria-label="Cenário jogável. Use as setas ou WASD para mover e E para usar a habilidade." tabindex="0">
<defs><pattern id="grain" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="7" cy="8" r="1" fill="#b7a79c"/><path d="M16 19h3" stroke="#b7a79c"/></pattern><linearGradient id="earth" x2="0" y2="1"><stop stop-color="#d3b8a0"/><stop offset="1" stop-color="#b0a4b4"/></linearGradient><linearGradient id="savannah" x2="0" y2="1"><stop stop-color="#e7c987"/><stop offset="1" stop-color="#c77f56"/></linearGradient></defs>
<g id="scene"></g><g id="tunnel"></g><g id="rocks"></g><g id="obstacles"></g><g id="food"></g><g id="haven"></g>
<circle id="target" r="9" fill="none" stroke="#426a5f" stroke-width="2" opacity="0"/>
<g id="creature"></g>
</svg>
<div class="under"><span id="message" role="status">Pressione [E] para escavar e abrir a terra.</span><span>FORMAS PROVISÓRIAS</span></div>
<div id="finish" hidden></div>
</section>
<nav class="controls" aria-label="Controles"><div class="directions"><button data-dx="-1" data-dy="0" aria-label="Mover para esquerda">←</button><button data-dx="0" data-dy="-1" aria-label="Mover para cima">↑</button><button data-dx="0" data-dy="1" aria-label="Mover para baixo">↓</button><button data-dx="1" data-dy="0" aria-label="Mover para direita">→</button></div><button id="dig" aria-keyshortcuts="E" aria-pressed="false"></button><button id="restart">Reiniciar</button><span>Setas / WASD · [E]: habilidade · Espaço no cenário · R: reiniciar<br>Mouse: clique no destino ou segure as setas</span></nav>
<footer id="notes"></footer>`;

const get = <T extends Element>(id: string) =>
  document.getElementById(id)! as unknown as T;
const world = get<SVGSVGElement>("world");
const creature = get<SVGGElement>("creature");
const scene = get<SVGGElement>("scene");
const tunnel = get<SVGGElement>("tunnel");
const rocksGroup = get<SVGGElement>("rocks");
const obstacles = get<SVGGElement>("obstacles");
const food = get<SVGGElement>("food");
const haven = get<SVGGElement>("haven");
const message = get<HTMLElement>("message");
const digButton = get<HTMLButtonElement>("dig");
const finish = get<HTMLElement>("finish");
const phaseNotes = get<HTMLElement>("notes");

const wormsRocks: Rect[] = [
  { x: 330, y: 200, w: 45, h: 165 },
  { x: 625, y: 60, w: 45, h: 175 },
];
const titanWalls: Rect[] = [
  { x: 340, y: 0, w: 42, h: 235 },
  { x: 340, y: 305, w: 42, h: 95 },
  { x: 635, y: 0, w: 42, h: 105 },
  { x: 635, y: 175, w: 42, h: 225 },
];
const roots: Point[] = [
  { x: 220, y: 270 },
  { x: 490, y: 140 },
  { x: 790, y: 300 },
];
const trunks: Point[] = [
  { x: 355, y: 270 },
  { x: 650, y: 140 },
];

let phase: Phase = "worms";
let x = 100;
let y = 270;
let angle = 0;
let digging = false;
let digUsed = false;
let done = false;
let target: Point | null = null;
let direction = { x: 0, y: 0 };
let collected = new Set<number>();
let clearedCells = new Set<string>();
let clearedTrunks = new Set<number>();
const keys = new Set<string>();

const cell = (px: number, py: number) =>
  `${Math.floor(px / 20)},${Math.floor(py / 20)}`;

function clearInputs() {
  keys.clear();
  direction = { x: 0, y: 0 };
  target = null;
}

function abilityLabel() {
  if (phase === "titans") {
    digButton.innerHTML = `Usar força <span aria-hidden="true">[E]</span>`;
    digButton.removeAttribute("aria-pressed");
    digButton.setAttribute("aria-label", "Usar força");
    return;
  }
  digButton.innerHTML = `Escavar <span aria-hidden="true">[E]</span>: ${digging ? "ligado" : "desligado"}`;
  digButton.setAttribute("aria-pressed", String(digging));
  digButton.setAttribute(
    "aria-label",
    `Escavar: ${digging ? "ligado" : "desligado"}`,
  );
}

function drawRocks(rectangles: Rect[]) {
  rocksGroup.innerHTML = rectangles
    .map(
      (r) =>
        `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="14" fill="#6e7475" stroke="#505e59" stroke-width="3"/><path d="M${r.x + 10} ${r.y + 20}l18 35-13 24" fill="none" stroke="#a8acaa" stroke-width="2"/>`,
    )
    .join("");
}

function drawFood() {
  food.innerHTML = roots
    .map((p, index) => {
      if (collected.has(index)) return "";
      return `<g transform="translate(${p.x} ${p.y})"><circle r="23" fill="#e7d7a1" opacity=".6"/><path d="M0-18V10M0-5l-11-7M0 3l10-9" stroke="#5b7555" stroke-width="4" fill="none"/><ellipse cy="12" rx="7" ry="11" fill="#b56850"/></g>`;
    })
    .join("");
}

function drawTrunks() {
  obstacles.innerHTML = trunks
    .map((p, index) => {
      const moved = clearedTrunks.has(index);
      const offsetY = moved ? p.y + 66 : p.y;
      return `<g class="trunk${moved ? " trunk--moved" : ""}" transform="translate(${p.x} ${offsetY}) rotate(${moved ? "-18" : "90"})"><rect x="-34" y="-11" width="68" height="22" rx="9" fill="#76533c" stroke="#4d392d" stroke-width="3"/><circle cx="-23" r="6" fill="#c79b68"/><circle cx="23" r="6" fill="#c79b68"/></g>`;
    })
    .join("");
}

function clear(px: number, py: number) {
  const key = cell(px, py);
  if (clearedCells.has(key)) return;
  clearedCells.add(key);
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  circle.setAttribute("cx", String(Math.floor(px / 20) * 20 + 10));
  circle.setAttribute("cy", String(Math.floor(py / 20) * 20 + 10));
  circle.setAttribute("r", "25");
  circle.setAttribute("fill", "#eee8d8");
  tunnel.append(circle);
}

function setWormCopy() {
  get("chapter").textContent = "ALL TOMORROWS / WORMS";
  get("eyebrow").textContent = "DEPOIS DOS QU";
  get("title").textContent = "Sob a superfície";
  get("subtitle").textContent =
    "O mundo mudou. A vida encontrou outro caminho.";
  get("context").innerHTML =
    "Star People → intervenção dos Qu → <strong>Worms</strong><br>Um recorte do começo dos pós-humanos. Não é o início completo do livro.";
  phaseNotes.innerHTML =
    "<p><strong>Do livro:</strong> Worms vivem sob uma superfície quente, com corpos alongados e membros reduzidos para escavar.</p><p><strong>Da adaptação:</strong> raízes, percurso e abrigo são uma situação criada para testar movimento e exploração. Sem cronômetro ou punição.</p>";
}

function setTitanCopy() {
  get("chapter").textContent = "ALL TOMORROWS / TITANS";
  get("eyebrow").textContent = "OUTRO MUNDO, OUTRO CAPÍTULO";
  get("title").textContent = "Peso e passagem";
  get("subtitle").textContent =
    "Força abre um caminho que o tamanho não atravessa sozinho.";
  get("context").innerHTML =
    "<strong>Titans</strong> são outro capítulo em outro mundo.<br>Worms não evoluem para Titans nesta sequência.";
  phaseNotes.innerHTML =
    "<p><strong>Do livro:</strong> Titans vivem em savanas e usam uma tromba formada pelo lábio inferior para manipular objetos.</p><p><strong>Da adaptação:</strong> troncos, passagens e rota são uma situação criada para testar movimento e força. Sem cronômetro ou punição.</p>";
}

function setWormScene() {
  scene.innerHTML = `<rect width="960" height="400" fill="url(#earth)"/><rect width="960" height="400" fill="url(#grain)"/><path d="M0 38Q150 10 300 35T600 30T960 32V0H0Z" fill="#d8cead"/>`;
  creature.innerHTML = `<path d="M-50 2Q-27 16 -8 0" fill="none" stroke="#685e66" stroke-width="16" stroke-linecap="round"/><path d="M-50 2Q-27 16 -8 0" fill="none" stroke="#eee2cc" stroke-width="12" stroke-linecap="round"/><ellipse cx="1" cy="0" rx="13" ry="9" fill="#eee2cc" stroke="#685e66" stroke-width="1.5"/><path d="M-11-7l-6-9m7 23-7 9" stroke="#eee2cc" stroke-width="5" stroke-linecap="round"/><circle cx="6" cy="-3" r="1.2" fill="#514a48"/>`;
  haven.innerHTML = `<ellipse cx="888" cy="300" rx="40" ry="45" fill="#688778" opacity=".25"/><path d="M860 320Q888 245 917 320" fill="none" stroke="#416958" stroke-width="4"/><text x="888" y="363" text-anchor="middle">ABRIGO</text>`;
  drawRocks(wormsRocks);
  obstacles.innerHTML = "";
  drawFood();
}

function setTitanScene() {
  scene.innerHTML = `<rect width="960" height="400" fill="url(#savannah)"/><path d="M0 85Q200 55 390 88T690 58T960 80V0H0Z" fill="#efd99d"/><path d="M0 350Q200 320 430 348T960 330V400H0Z" fill="#b66a4d" opacity=".42"/><path d="M85 104v50m-18-29h36M845 92v62m-24-33h48" stroke="#8d6e45" stroke-width="4" opacity=".65"/>`;
  creature.innerHTML = `<g class="titan-placeholder"><path d="M-66 4Q-24-23 27-9L49 15Q8 34-59 22Z" fill="#745c4d" stroke="#493b35" stroke-width="3"/><path d="M-32 16v27m22-23v27m26-22v28m20-30v28" stroke="#493b35" stroke-width="12" stroke-linecap="round"/><path d="M-32 43h13m13 4h13m16-2h13m12-2h13" stroke="#d4a877" stroke-width="5" stroke-linecap="round"/><path d="M30-8Q35-31 57-30L74-20Q83-8 74 8L48 10Q34 6 30-8Z" fill="#9b765b" stroke="#493b35" stroke-width="3"/><ellipse cx="67" cy="-15" rx="3" ry="2" fill="#342d2a"/><path d="M73-7l8 4-7 3" fill="none" stroke="#493b35" stroke-width="3" stroke-linecap="round"/><path d="M55 3Q69 8 75 5" fill="none" stroke="#493b35" stroke-width="3" stroke-linecap="round"/><path d="M74 6Q94 16 82 43Q78 51 70 55" fill="none" stroke="#9b765b" stroke-width="12" stroke-linecap="round"/><path d="M73 8Q92 16 80 41" fill="none" stroke="#493b35" stroke-width="3" stroke-linecap="round"/><path d="M18 10l12 12m-4-15l11 6" stroke="#493b35" stroke-width="5" stroke-linecap="round"/></g>`;
  haven.innerHTML = `<ellipse cx="888" cy="300" rx="42" ry="42" fill="#fff0bd" opacity=".34"/><path d="M860 320h56" stroke="#80523e" stroke-width="4"/><text x="888" y="350" text-anchor="middle">HORIZONTE</text>`;
  food.innerHTML = "";
  drawRocks(titanWalls);
  drawTrunks();
}

function updateWormGuidance() {
  if (!digUsed) {
    get("objective").textContent = "Aprenda a escavar";
    message.textContent = "Pressione [E] para escavar e abrir a terra.";
    return;
  }
  if (collected.size === 0) {
    get("objective").textContent = "Alcance a primeira raiz";
    return;
  }
  if (collected.size === 1) {
    get("objective").textContent = "Contorne a rocha até a raiz alta";
    return;
  }
  if (collected.size === 2) {
    get("objective").textContent = "Escave e contorne a próxima rocha";
    return;
  }
  get("objective").textContent = "Alcance o abrigo";
}

function reset(focusWorld = true) {
  clearInputs();
  x = 100;
  y = 270;
  angle = 0;
  digging = false;
  digUsed = false;
  done = false;
  collected = new Set();
  clearedCells = new Set();
  clearedTrunks = new Set();
  tunnel.innerHTML = "";
  finish.hidden = true;
  if (phase === "worms") {
    setWormScene();
    clear(x, y);
    get("progress").textContent = "0 / 3 raízes";
    updateWormGuidance();
  } else {
    setTitanScene();
    get("progress").textContent = "0 / 2 passagens";
    get("objective").textContent = "Liberte a primeira passagem";
    message.textContent = "Aproxime-se do tronco caído e use força com [E].";
  }
  abilityLabel();
  render();
  if (focusWorld) world.focus();
}

function begin(nextPhase: Phase) {
  clearInputs();
  phase = nextPhase;
  if (phase === "worms") setWormCopy();
  else setTitanCopy();
  world.dataset.phase = phase;
  reset();
}

function toggleDig() {
  digging = !digging;
  digUsed = true;
  abilityLabel();
  updateWormGuidance();
  message.textContent = digging
    ? "Escavação ativa. Abra a terra até a primeira raiz."
    : "Escavação pausada. Pressione [E] para retomar quando precisar.";
}

function useForce() {
  const closest = trunks
    .map((trunk, index) => ({
      index,
      distance: Math.hypot(x - trunk.x, y - trunk.y),
    }))
    .filter(({ index }) => !clearedTrunks.has(index))
    .sort((a, b) => a.distance - b.distance)[0];
  if (!closest || closest.distance > 95) {
    message.textContent = "Aproxime-se de um tronco caído para usar força.";
    return;
  }
  clearedTrunks.add(closest.index);
  drawTrunks();
  get("progress").textContent = `${clearedTrunks.size} / 2 passagens`;
  if (clearedTrunks.size === 1) {
    get("objective").textContent = "Encontre a segunda passagem";
    message.textContent = "O tronco cedeu. Siga pela rota até a passagem alta.";
  } else {
    get("objective").textContent = "Alcance o horizonte";
    message.textContent =
      "As duas passagens estão livres. Continue até o horizonte.";
  }
}

function useAbility() {
  if (done) return;
  if (phase === "worms") toggleDig();
  else useForce();
}

function isBlocked(nx: number, ny: number) {
  const radius = phase === "titans" ? 20 : 15;
  const barriers = phase === "worms" ? wormsRocks : titanWalls;
  if (
    barriers.some(
      (r) =>
        nx > r.x - radius &&
        nx < r.x + r.w + radius &&
        ny > r.y - radius &&
        ny < r.y + r.h + radius,
    )
  )
    return true;
  if (phase === "titans") {
    return trunks.some(
      (trunk, index) =>
        !clearedTrunks.has(index) &&
        Math.abs(nx - trunk.x) < 27 &&
        Math.abs(ny - trunk.y) < 40,
    );
  }
  return false;
}

function move(dx: number, dy: number, distance: number) {
  const length = Math.hypot(dx, dy);
  if (!length || done) return false;
  const nx = Math.max(60, Math.min(920, x + (dx / length) * distance));
  const ny = Math.max(65, Math.min(365, y + (dy / length) * distance));
  if (isBlocked(nx, ny)) {
    if (phase === "worms")
      message.textContent =
        "Rocha firme. Procure uma passagem acima ou abaixo.";
    else
      message.textContent =
        "A passagem está fechada. Aproxime-se do tronco e use [E].";
    target = null;
    return false;
  }
  if (phase === "worms" && !digging && !clearedCells.has(cell(nx, ny))) {
    message.textContent = digUsed
      ? "Terra fechada: ative Escavar com [E]."
      : "Pressione [E] para escavar e abrir a terra.";
    target = null;
    return false;
  }
  x = nx;
  y = ny;
  angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (phase === "worms") {
    if (digging) clear(x, y);
    if (digUsed && collected.size < 3)
      message.textContent = "Seu corpo abre o caminho. Siga a próxima raiz.";
  }
  return true;
}

function nudge(dx: number, dy: number) {
  clearInputs();
  move(dx, dy, 18);
  render();
}

function complete() {
  done = true;
  clearInputs();
  if (phase === "worms") {
    finish.innerHTML = `<p class="eyebrow">CAMINHO ABERTO</p><h2>Você aprendeu a transformar o terreno.</h2><p>O próximo capítulo acontece em outro mundo. Worms não se transformam em Titans.</p><button id="next">Seguir para Titans</button><button id="again">Jogar Worms novamente</button>`;
  } else {
    finish.innerHTML = `<p class="eyebrow">FIM DA AMOSTRA</p><h2>Dois capítulos, dois corpos, duas formas de abrir caminho.</h2><p>Este é o fim da amostra de dois capítulos.</p><button id="again">Jogar Titans novamente</button><button id="journey-start">Voltar para Worms</button>`;
  }
  finish.hidden = false;
  get<HTMLButtonElement>(phase === "worms" ? "next" : "again").focus();
  get<HTMLButtonElement>("again").addEventListener("click", () => reset());
  if (phase === "worms")
    get<HTMLButtonElement>("next").addEventListener("click", () =>
      begin("titans"),
    );
  else
    get<HTMLButtonElement>("journey-start").addEventListener("click", () =>
      begin("worms"),
    );
}

function checkObjectives() {
  if (phase === "worms") {
    roots.forEach((root, index) => {
      if (!collected.has(index) && Math.hypot(x - root.x, y - root.y) < 27) {
        collected.add(index);
        drawFood();
        get("progress").textContent = `${collected.size} / 3 raízes`;
        updateWormGuidance();
        message.textContent =
          collected.size === 3
            ? "As raízes estão reunidas. Agora alcance o abrigo."
            : "Raiz encontrada. O próximo percurso pede outro desvio.";
      }
    });
    if (collected.size === 3 && Math.hypot(x - 888, y - 300) < 35) complete();
    return;
  }
  if (clearedTrunks.size === 2 && Math.hypot(x - 888, y - 300) < 35) complete();
}

function render() {
  creature.setAttribute("transform", `translate(${x} ${y}) rotate(${angle})`);
  const targetCircle = get<SVGCircleElement>("target");
  targetCircle.setAttribute("opacity", target ? "1" : "0");
  if (target) {
    targetCircle.setAttribute("cx", String(target.x));
    targetCircle.setAttribute("cy", String(target.y));
  }
}

digButton.addEventListener("click", useAbility);
get<HTMLButtonElement>("restart").addEventListener("click", () => reset());
world.addEventListener("pointerdown", (event) => {
  if (done) return;
  const matrix = world.getScreenCTM();
  if (!matrix) return;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
    matrix.inverse(),
  );
  target = { x: point.x, y: point.y };
  world.focus();
});
for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-dx]",
)) {
  button.addEventListener("pointerdown", (event) => {
    button.setPointerCapture(event.pointerId);
    target = null;
    direction = { x: Number(button.dataset.dx), y: Number(button.dataset.dy) };
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    button.addEventListener(type, () => {
      direction = { x: 0, y: 0 };
    });
  button.addEventListener("click", (event) => {
    if (event.detail === 0)
      nudge(Number(button.dataset.dx), Number(button.dataset.dy));
  });
}

function isWorldOrBody(targetElement: EventTarget | null) {
  return (
    targetElement === document.body ||
    targetElement === document.documentElement ||
    targetElement === world ||
    (targetElement instanceof Element && world.contains(targetElement))
  );
}

window.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === "e") {
    event.preventDefault();
    if (!event.repeat) useAbility();
    return;
  }
  if (key === "r") {
    event.preventDefault();
    if (!event.repeat) reset();
    return;
  }
  if (key === " ") {
    if (isWorldOrBody(event.target)) {
      event.preventDefault();
      if (!event.repeat) useAbility();
    }
    return;
  }
  if (
    [
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "w",
      "a",
      "s",
      "d",
    ].includes(key)
  ) {
    event.preventDefault();
    keys.add(key);
    target = null;
  }
});
window.addEventListener("keyup", (event) =>
  keys.delete(event.key.toLowerCase()),
);
window.addEventListener("blur", clearInputs);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearInputs();
});

let last = 0;
function tick(time: number) {
  const dt = Math.min((time - last) / 1000, 0.04);
  last = time;
  if (!done) {
    let dx =
      direction.x +
      Number(keys.has("arrowright") || keys.has("d")) -
      Number(keys.has("arrowleft") || keys.has("a"));
    let dy =
      direction.y +
      Number(keys.has("arrowdown") || keys.has("s")) -
      Number(keys.has("arrowup") || keys.has("w"));
    if (target) {
      dx = target.x - x;
      dy = target.y - y;
      if (Math.hypot(dx, dy) < 4) {
        target = null;
        dx = 0;
        dy = 0;
      }
    }
    if (Math.hypot(dx, dy))
      move(dx, dy, (phase === "worms" && digging ? 125 : 190) * dt);
    checkObjectives();
  }
  render();
  requestAnimationFrame(tick);
}

setWormCopy();
reset(false);
requestAnimationFrame(tick);
