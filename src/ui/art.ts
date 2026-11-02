import type { Kind, Level, State, Target } from "../domain/types";
export function escape(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export const labels: Record<Kind, string> = {
  foot: "Pé",
  claw: "Garra",
  eye: "Olho",
  extender: "Extensor",
};
export const descriptions: Record<Kind, string> = {
  foot: "Move o corpo inteiro.",
  claw: "Pega, entrega e aciona.",
  eye: "Revela mecanismos ocultos.",
  extender: "Sustenta peças na diagonal.",
};
export function glyph(
  kind: Kind | "core" | "seed" | "nest" | "station",
  x = 0,
  y = 0,
  size = 40,
): string {
  const paths = {
    core: '<rect x="-15" y="-15" width="30" height="30" rx="10" fill="#d6b89b"/><path d="M-8 -3Q0 -9 8 -3M-8 4Q0 10 8 4"/>',
    foot: '<path d="M-6 -12L-4 5Q-16 13 -10 15H12Q17 10 7 7L6 -12Z" fill="#739486"/>',
    claw: '<path d="M-3 14V3M-3 4Q-18 0 -12 -13L-5 -5L1 -13Q14 -3 4 5L3 14" fill="#cc8d72"/>',
    eye: '<path d="M-17 0Q0 -21 17 0Q0 21 -17 0Z" fill="#e3c677"/><circle r="6" fill="#304b45"/><circle cx="2" cy="-2" r="2" fill="#fbf8ef"/>',
    extender:
      '<rect x="-15" y="-8" width="30" height="16" rx="7" fill="#c4b9a7"/><path d="M-7 -7V7M0 -7V7M7 -7V7"/>',
    seed: '<path d="M-8 9Q-15 -2 7 -12Q15 6 -8 9Z" fill="#c88b61"/><path d="M-7 8L5 -7"/>',
    nest: '<path d="M-17 5Q0 23 17 5M-14 1Q0 15 14 1M-10 -3Q0 6 10 -3" fill="none"/><path d="M0 2V-11M0 -7Q-12 -15 -9 -17Q0 -18 0 -7M0 -9Q10 -19 13 -15Q13 -7 0 -6" fill="#739486"/>',
    station:
      '<rect x="-17" y="-17" width="34" height="34" rx="5" fill="none" stroke-dasharray="3 3"/><path d="M-7 0H7M0 -7V7"/>',
  };
  return `<g transform="translate(${x} ${y}) scale(${size / 40})" stroke="#304b45" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[kind]}</g>`;
}
export function icon(
  kind: Kind | "core" | "seed" | "nest" | "station",
  size = 36,
): string {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="-22 -22 44 44">${glyph(kind)}</svg>`;
}
export function board(
  level: Level,
  state: State,
  choices: Target[] = [],
): string {
  const cell = 48,
    w = level.map[0]!.length,
    h = level.map.length;
  let content = "";
  level.map.forEach((row, y) =>
    [...row].forEach((tile, x) => {
      content +=
        tile === "#"
          ? `<rect x="${x * cell + 2}" y="${y * cell + 2}" width="44" height="44" rx="5" fill="#d2d1bf"/><path d="M${x * cell + 11} ${y * cell + 32}l12 -15m-2 22 11 -14" stroke="#b8beac" stroke-width="1"/>`
          : `<rect x="${x * cell + 1}" y="${y * cell + 1}" width="46" height="46" rx="4" fill="#f5f1e5" stroke="#e8e1d2" stroke-width=".6"/>`;
    }),
  );
  level.stations.forEach((p) => {
    content += glyph("station", p.x * cell + 24, p.y * cell + 24);
  });
  content += glyph("nest", level.nest.x * cell + 24, level.nest.y * cell + 24);
  if (!state.carrying && !state.delivered)
    content += glyph(
      "seed",
      level.seed.x * cell + 24,
      level.seed.y * cell + 24,
      32,
    );
  level.switches.forEach((p) => {
    const visible = !p.hidden || state.modules.some((m) => m.kind === "eye");
    content += `<g transform="translate(${p.x * cell + 24} ${p.y * cell + 24})"><circle r="14" fill="${state.opened.includes(p.id) ? "#739486" : "#d9c888"}" stroke="#526758"/><text text-anchor="middle" y="5" font-size="17" fill="#304b45">${state.opened.includes(p.id) ? "✓" : visible ? "◇" : "◉"}</text></g>`;
  });
  level.doors.forEach((p) => {
    if (!state.opened.includes(p.switchId))
      content += `<rect x="${p.x * cell + 4}" y="${p.y * cell + 4}" width="40" height="40" rx="4" fill="#ba9878" stroke="#796e56"/><path d="M${p.x * cell + 17} ${p.y * cell + 8}v32m14 -32v32" stroke="#e4d2b7" stroke-width="3"/>`;
  });
  state.modules.forEach((m) => {
    content +=
      `<rect x="${(state.position.x + m.x) * cell + 4}" y="${(state.position.y + m.y) * cell + 4}" width="40" height="40" rx="13" fill="#f9f6ec" stroke="#7d9180" stroke-width="1.5"/>` +
      glyph(
        m.kind,
        (state.position.x + m.x) * cell + 24,
        (state.position.y + m.y) * cell + 24,
        36,
      );
  });
  content += glyph(
    "core",
    state.position.x * cell + 24,
    state.position.y * cell + 24,
    48,
  );
  if (state.carrying)
    content += glyph(
      "seed",
      state.position.x * cell + 35,
      state.position.y * cell + 12,
      23,
    );
  choices.forEach((p) => {
    content += `<rect x="${p.x * cell + 2}" y="${p.y * cell + 2}" width="44" height="44" rx="8" fill="none" stroke="#bb654d" stroke-width="3" stroke-dasharray="6 3"/>`;
  });
  return `<svg class="board" data-testid="board" tabindex="0" role="img" aria-label="${escape(level.name)}. Corpo na coluna ${state.position.x + 1}, linha ${state.position.y + 1}. ${state.carrying ? "Carregando semente." : ""}" viewBox="-8 -8 ${w * cell + 16} ${h * cell + 16}">${content}</svg>`;
}
