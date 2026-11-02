import "./style.css";

const host = document.querySelector<HTMLElement>("#concept")!;
host.innerHTML = `
<header><a href="./">Corpo sob Medida</a><span>ESTUDO JOGÁVEL · 01</span><span>ALL TOMORROWS / WORMS</span></header>
<section class="intro"><div><p class="eyebrow">DEPOIS DOS QU</p><h1>Sob a superfície</h1><p>O mundo mudou. A vida encontrou outro caminho.</p></div><div class="context">Star People → intervenção dos Qu → <strong>Worms</strong><br>Um recorte do começo dos pós-humanos. Não é o início completo do livro.</div></section>
<section class="stage" aria-label="Protótipo de escavação">
<div class="status"><strong id="objective">Encontre alimento no subsolo</strong><span id="progress">0 / 3 raízes</span></div>
<svg id="world" viewBox="0 0 960 400" role="img" aria-label="Subsolo escavável. Use as setas e ative escavar, ou clique no terreno." tabindex="0">
<defs><pattern id="grain" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="7" cy="8" r="1" fill="#b7a79c"/><path d="M16 19h3" stroke="#b7a79c"/></pattern><linearGradient id="earth" x2="0" y2="1"><stop stop-color="#d3b8a0"/><stop offset="1" stop-color="#b0a4b4"/></linearGradient></defs>
<rect width="960" height="400" fill="url(#earth)"/><rect width="960" height="400" fill="url(#grain)"/>
<path d="M0 38 Q150 10 300 35T600 30T960 32V0H0Z" fill="#d8cead"/>
<g id="tunnel"></g><g id="rocks"></g><g id="food"></g>
<g id="haven"><ellipse cx="888" cy="300" rx="40" ry="45" fill="#688778" opacity=".25"/><path d="M860 320Q888 245 917 320" fill="none" stroke="#416958" stroke-width="4"/><text x="888" y="363" text-anchor="middle">ABRIGO</text></g>
<circle id="target" r="9" fill="none" stroke="#426a5f" stroke-width="2" opacity="0"/>
<g id="creature"><path d="M-50 2Q-27 16 -8 0" fill="none" stroke="#685e66" stroke-width="16" stroke-linecap="round"/><path d="M-50 2Q-27 16 -8 0" fill="none" stroke="#eee2cc" stroke-width="12" stroke-linecap="round"/><ellipse cx="1" cy="0" rx="13" ry="9" fill="#eee2cc" stroke="#685e66" stroke-width="1.5"/><path d="M-11-7l-6-9m7 23-7 9" stroke="#eee2cc" stroke-width="5" stroke-linecap="round"/><circle cx="6" cy="-3" r="1.2" fill="#514a48"/></g>
</svg>
<div class="under"><span id="message" role="status">Ative escavar e siga as raízes. As rochas precisam ser contornadas.</span><span>FORMAS PROVISÓRIAS</span></div>
<div id="finish" hidden><p class="eyebrow">A VIDA CONTINUA</p><h2>Um pequeno caminho. Um futuro inteiro.</h2><p>Você encontrou alimento e abrigo. Este é o fim da amostra.</p><button id="again">Jogar novamente</button></div>
</section>
<nav class="controls" aria-label="Controles"><div class="directions"><button data-dx="-1" data-dy="0" aria-label="Mover para esquerda">←</button><button data-dx="0" data-dy="-1" aria-label="Mover para cima">↑</button><button data-dx="0" data-dy="1" aria-label="Mover para baixo">↓</button><button data-dx="1" data-dy="0" aria-label="Mover para direita">→</button></div><button id="dig" aria-pressed="false">Escavar: desligado</button><button id="restart">Reiniciar</button><span>Setas / WASD · Espaço: escavar · R: reiniciar<br>Mouse: clique no destino ou segure as setas</span></nav>
<footer><p><strong>Do livro:</strong> Worms vivem sob uma superfície quente, com corpos alongados e membros reduzidos para escavar.</p><p><strong>Da adaptação:</strong> raízes, percurso e abrigo são uma situação criada para testar movimento e exploração. Sem cronômetro ou punição.</p></footer>`;

const get = <T extends Element>(id: string) =>
  document.getElementById(id)! as unknown as T;
const world = get<SVGSVGElement>("world");
const creature = get<SVGGElement>("creature");
const tunnel = get<SVGGElement>("tunnel");
const food = get<SVGGElement>("food");
const message = get<HTMLElement>("message");
const digButton = get<HTMLButtonElement>("dig");
const finish = get<HTMLElement>("finish");
const rocks = [
  { x: 330, y: 200, w: 45, h: 165 },
  { x: 625, y: 60, w: 45, h: 175 },
];
get<SVGGElement>("rocks").innerHTML = rocks
  .map(
    (r) =>
      `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="18" fill="#6e7475" stroke="#505e59" stroke-width="3"/><path d="M${r.x + 10} ${r.y + 20}l18 35-13 24" fill="none" stroke="#a8acaa" stroke-width="2"/>`,
  )
  .join("");
const meals = [
  { x: 220, y: 270 },
  { x: 490, y: 140 },
  { x: 790, y: 300 },
];
let x = 100,
  y = 270,
  angle = 0,
  dig = false,
  done = false;
let target: { x: number; y: number } | null = null;
let direction = { x: 0, y: 0 };
let collected = new Set<number>();
let cleared = new Set<string>();
const keys = new Set<string>();
const cell = (px: number, py: number) =>
  `${Math.floor(px / 20)},${Math.floor(py / 20)}`;
function clear(px: number, py: number) {
  const key = cell(px, py);
  if (cleared.has(key)) return;
  cleared.add(key);
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
function drawFood() {
  food.innerHTML = meals
    .map((p, i) =>
      collected.has(i)
        ? ""
        : `<g transform="translate(${p.x} ${p.y})"><circle r="23" fill="#e7d7a1" opacity=".6"/><path d="M0-18V10M0-5l-11-7M0 3l10-9" stroke="#5b7555" stroke-width="4" fill="none"/><ellipse cy="12" rx="7" ry="11" fill="#b56850"/></g>`,
    )
    .join("");
}
function toggleDig() {
  dig = !dig;
  digButton.textContent = `Escavar: ${dig ? "ligado" : "desligado"}`;
  digButton.setAttribute("aria-pressed", String(dig));
}
function reset() {
  x = 100;
  y = 270;
  angle = 0;
  dig = false;
  done = false;
  target = null;
  direction = { x: 0, y: 0 };
  keys.clear();
  collected = new Set();
  cleared = new Set();
  tunnel.innerHTML = "";
  clear(x, y);
  drawFood();
  finish.hidden = true;
  digButton.textContent = "Escavar: desligado";
  digButton.setAttribute("aria-pressed", "false");
  get("progress").textContent = "0 / 3 raízes";
  get("objective").textContent = "Encontre alimento no subsolo";
  message.textContent =
    "Ative escavar e siga as raízes. As rochas precisam ser contornadas.";
}
function render() {
  creature.setAttribute("transform", `translate(${x} ${y}) rotate(${angle})`);
  get("target").setAttribute("opacity", target ? "1" : "0");
  if (target) {
    get("target").setAttribute("cx", String(target.x));
    get("target").setAttribute("cy", String(target.y));
  }
}
digButton.addEventListener("click", toggleDig);
get("restart").addEventListener("click", reset);
get("again").addEventListener("click", () => {
  reset();
  world.focus();
});
world.addEventListener("pointerdown", (e) => {
  if (done) return;
  const matrix = world.getScreenCTM();
  if (!matrix) return;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
    matrix.inverse(),
  );
  target = { x: p.x, y: p.y };
  world.focus();
});
for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-dx]",
)) {
  button.addEventListener("pointerdown", (e) => {
    button.setPointerCapture(e.pointerId);
    target = null;
    direction = { x: Number(button.dataset.dx), y: Number(button.dataset.dy) };
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    button.addEventListener(type, () => {
      direction = { x: 0, y: 0 };
    });
}
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "r") {
    reset();
    return;
  }
  if (e.target instanceof HTMLButtonElement && (k === " " || k === "enter"))
    return;
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
      " ",
    ].includes(k)
  ) {
    e.preventDefault();
    if (k === " ") {
      if (!e.repeat) toggleDig();
    } else {
      keys.add(k);
      target = null;
    }
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener("blur", () => {
  keys.clear();
  direction = { x: 0, y: 0 };
  target = null;
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    keys.clear();
    direction = { x: 0, y: 0 };
    target = null;
  }
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
    const length = Math.hypot(dx, dy);
    if (length) {
      const speed = dig ? 125 : 175;
      const nx = Math.max(60, Math.min(920, x + (dx / length) * speed * dt));
      const ny = Math.max(65, Math.min(365, y + (dy / length) * speed * dt));
      const blocked = rocks.some(
        (r) =>
          nx > r.x - 15 &&
          nx < r.x + r.w + 15 &&
          ny > r.y - 15 &&
          ny < r.y + r.h + 15,
      );
      if (blocked) {
        message.textContent =
          "Rocha firme. Procure uma passagem acima ou abaixo.";
        target = null;
      } else if (dig || cleared.has(cell(nx, ny))) {
        x = nx;
        y = ny;
        angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (dig) clear(x, y);
        message.textContent =
          collected.size === 3
            ? "Agora alcance o abrigo à direita."
            : "Seu corpo abre o caminho. Explore e encontre as três raízes.";
      } else {
        message.textContent = "Terra fechada: ative Escavar (Espaço ou botão).";
        target = null;
      }
    }
    meals.forEach((p, i) => {
      if (!collected.has(i) && Math.hypot(x - p.x, y - p.y) < 27) {
        collected.add(i);
        drawFood();
        get("progress").textContent = `${collected.size} / 3 raízes`;
        if (collected.size === 3)
          get("objective").textContent = "Alcance o abrigo";
      }
    });
    if (collected.size === 3 && Math.hypot(x - 888, y - 300) < 35) {
      done = true;
      target = null;
      finish.hidden = false;
      get<HTMLButtonElement>("again").focus();
    }
  }
  render();
  requestAnimationFrame(tick);
}
reset();
requestAnimationFrame(tick);
