import type { Kind, Level, Module, State, Target } from "../domain/types";

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
  foot: "Faz o corpo caminhar.",
  claw: "Alcança, pega e ativa.",
  eye: "Revela sinais escondidos.",
  extender: "Leva uma peça até a dobra.",
};
type GlyphKind =
  Kind | "core" | "seed" | "nest" | "station" | "companion" | "arrival";

export function glyph(kind: GlyphKind, x = 0, y = 0, size = 40): string {
  const paths: Record<GlyphKind, string> = {
    core: '<path d="M-15 5C-16-11-8-18 0-17C9-18 16-10 15 5C14 14 8 18 0 18C-8 18-14 14-15 5Z" fill="#c4b8c8"/><path d="M-8-2Q0-8 8-2M-8 5Q0 11 8 5" fill="none"/>',
    foot: '<path d="M-7-13C-10-5-9 4-12 9C-16 15-7 16 2 15L13 14C17 10 12 7 6 6L5-13Z" fill="#738f89"/>',
    claw: '<path d="M-3 15V4M-3 5C-16 2-15-10-11-14L-4-5L2-14C14-8 13 2 4 6L3 15" fill="#c98270"/>',
    eye: '<path d="M-18 0Q0-20 18 0Q0 20-18 0Z" fill="#ded0a0"/><ellipse rx="5" ry="7" fill="#3b5952"/><circle cx="2" cy="-3" r="1.8" fill="#fbf8ef"/>',
    extender:
      '<path d="M-16-6C-10-12 10-12 16-6V6C10 12-10 12-16 6Z" fill="#b5aebb"/><path d="M-7-7V7M0-9V9M7-7V7" fill="none"/>',
    seed: '<path d="M-9 10Q-17-2 7-13Q17 5-9 10Z" fill="#c88b61"/><path d="M-8 8L6-8" fill="none"/>',
    nest: '<path d="M-18 5Q0 23 18 5M-14 1Q0 16 14 1M-10-3Q0 7 10-3" fill="none"/><path d="M0 2V-12M0-7Q-11-16-10-19Q0-19 0-7M0-9Q10-19 13-15Q13-7 0-6" fill="#76958a"/>',
    station:
      '<path d="M-16-16H16V16H-16Z" fill="none" stroke-dasharray="3 3"/><path d="M-7 0H7M0-7V7" fill="none"/>',
    companion:
      '<path d="M-13 7C-15-7-8-16 0-16C9-16 15-7 13 7C12 14 7 18 0 18C-7 18-12 14-13 7Z" fill="#a8a2ba"/><path d="M-8-3Q0-9 8-3M-8 5Q0 10 8 5" fill="none"/><path d="M-17 12Q-22 4-18-2" fill="none"/>',
    arrival:
      '<path d="M-16 10Q0-17 16 10" fill="none"/><path d="M-10 10V-2M0 10V-9M10 10V-2" fill="none"/>',
  };
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ") scale(" +
    size / 40 +
    ')" stroke="#304b45" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    paths[kind] +
    "</g>"
  );
}
export function icon(kind: GlyphKind, size = 36): string {
  return (
    '<svg aria-hidden="true" width="' +
    size +
    '" height="' +
    size +
    '" viewBox="-22 -22 44 44">' +
    glyph(kind) +
    "</svg>"
  );
}
function bodyShape(
  position: { x: number; y: number },
  modules: Module[],
  cell: number,
): string {
  const parts = [{ x: 0, y: 0 }, ...modules];
  const halos = parts
    .map(
      (part) =>
        '<ellipse cx="' +
        ((position.x + part.x) * cell + 24) +
        '" cy="' +
        ((position.y + part.y) * cell + 24) +
        '" rx="19" ry="17"/>',
    )
    .join("");
  const joins = modules
    .filter(
      (part) =>
        Math.abs(part.x) + Math.abs(part.y) === 1 || part.kind === "extender",
    )
    .map(
      (part) =>
        '<path d="M' +
        (position.x * cell + 24) +
        " " +
        (position.y * cell + 24) +
        "L" +
        ((position.x + part.x) * cell + 24) +
        " " +
        ((position.y + part.y) * cell + 24) +
        '"/>',
    )
    .join("");
  return (
    '<g class="creature-body"><g class="creature-halos">' +
    halos +
    '</g><g class="creature-joins">' +
    joins +
    "</g></g>"
  );
}
function objectiveMark(level: Level, cell: number): string {
  const objective = level.objective;
  if (objective?.type !== "arrive" || !objective.at) return "";
  return (
    '<g class="arrival-mark" transform="translate(' +
    (objective.at.x * cell + 24) +
    " " +
    (objective.at.y * cell + 24) +
    ')"><circle r="18"/><circle r="11"/>' +
    glyph("arrival", 0, 2, 30) +
    "</g>"
  );
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
          ? '<rect class="wall" x="' +
            (x * cell + 2) +
            '" y="' +
            (y * cell + 2) +
            '" width="44" height="44" rx="8"/><path class="wall-vein" d="M' +
            (x * cell + 11) +
            " " +
            (y * cell + 32) +
            'l12-15m-2 22 11-14"/>'
          : '<rect class="floor" x="' +
            (x * cell + 1) +
            '" y="' +
            (y * cell + 1) +
            '" width="46" height="46" rx="7"/>';
    }),
  );
  level.stations.forEach((point) => {
    content += glyph("station", point.x * cell + 24, point.y * cell + 24);
  });
  content += objectiveMark(level, cell);
  if ((level.objective?.type ?? "deliver") === "deliver")
    content += glyph(
      "nest",
      level.nest.x * cell + 24,
      level.nest.y * cell + 24,
    );
  if (
    !state.carrying &&
    !state.delivered &&
    (level.objective?.type ?? "deliver") === "deliver"
  )
    content += glyph(
      "seed",
      level.seed.x * cell + 24,
      level.seed.y * cell + 24,
      32,
    );
  level.switches.forEach((point) => {
    const visible =
      !point.hidden || state.modules.some((module) => module.kind === "eye");
    content +=
      '<g class="switch ' +
      (state.opened.includes(point.id) ? "opened" : "") +
      '" transform="translate(' +
      (point.x * cell + 24) +
      " " +
      (point.y * cell + 24) +
      ')"><circle r="14"/><text text-anchor="middle" y="5">' +
      (state.opened.includes(point.id) ? "✓" : visible ? "◇" : "◉") +
      "</text></g>";
  });
  level.doors.forEach((point) => {
    if (!state.opened.includes(point.switchId))
      content +=
        '<g class="door" transform="translate(' +
        point.x * cell +
        " " +
        point.y * cell +
        ')"><rect x="4" y="4" width="40" height="40" rx="5"/><path d="M17 8v32m14-32v32"/></g>';
  });
  if (level.companion)
    content +=
      '<g class="companion ' +
      (state.delivered ? "celebrate" : "") +
      '" transform="translate(' +
      (level.companion.position.x * cell + 24) +
      " " +
      (level.companion.position.y * cell + 24) +
      ')">' +
      glyph("companion", 0, 0, 38) +
      "</g>";
  if (state.delivered) {
    const point =
      level.objective?.at ??
      level.switches.find((item) => item.id === level.objective?.switchId) ??
      level.nest;
    content +=
      '<g class="room-bloom" transform="translate(' +
      (point.x * cell + 24) +
      " " +
      (point.y * cell + 24) +
      ')"><circle r="25"/><path d="M0 16V-15M0-5Q-19-20-17-2M0-8Q19-22 18-2"/></g>';
  }
  content += bodyShape(state.position, state.modules, cell);
  state.modules.forEach((module) => {
    content += glyph(
      module.kind,
      (state.position.x + module.x) * cell + 24,
      (state.position.y + module.y) * cell + 24,
      36,
    );
  });
  content +=
    '<g class="creature-core">' +
    glyph(
      "core",
      state.position.x * cell + 24,
      state.position.y * cell + 24,
      48,
    ) +
    "</g>";
  if (state.carrying)
    content +=
      '<g class="carried-seed">' +
      glyph(
        "seed",
        state.position.x * cell + 35,
        state.position.y * cell + 12,
        23,
      ) +
      "</g>";
  choices.forEach((point) => {
    content +=
      '<rect class="target-ring" x="' +
      (point.x * cell + 2) +
      '" y="' +
      (point.y * cell + 2) +
      '" width="44" height="44" rx="9"/>';
  });
  return (
    '<svg class="board ' +
    (state.delivered ? "room-complete" : "") +
    '" data-testid="board" tabindex="0" role="application" aria-label="' +
    escape(level.name) +
    ". Corpo na coluna " +
    (state.position.x + 1) +
    ", linha " +
    (state.position.y + 1) +
    ". " +
    (state.carrying ? "Carregando semente." : "") +
    '" viewBox="-8 -8 ' +
    (w * cell + 16) +
    " " +
    (h * cell + 16) +
    '">' +
    content +
    "</svg>"
  );
}
