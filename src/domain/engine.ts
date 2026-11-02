import type {
  Command,
  Level,
  Module,
  Point,
  Result,
  State,
  Target,
} from "./types";

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
const adjacent = (a: Point, b: Point) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
const world = (position: Point, module: Point): Point => ({
  x: position.x + module.x,
  y: position.y + module.y,
});
const core = { x: 0, y: 0 };
const kinds = ["foot", "claw", "eye", "extender"] as const;

function free(level: Level, state: State, point: Point): boolean {
  return (
    level.map[point.y]?.[point.x] === "." &&
    !level.doors.some(
      (door) => same(door, point) && !state.opened.includes(door.switchId),
    )
  );
}

export function initialState(level: Level): State {
  return {
    position: { ...level.start },
    modules: level.initial.map((module) => ({ ...module })),
    carrying: false,
    delivered: false,
    opened: [],
  };
}

export function validateAssembly(
  level: Level,
  state: State,
  modules: Module[],
): string | null {
  if (!level.stations.some((station) => same(station, state.position)))
    return "Volte a uma estação para montar.";
  if (!Array.isArray(modules) || modules.length > 4)
    return "Use no máximo quatro módulos.";
  const occupied = new Set(["0,0"]);
  const counts = { foot: 0, claw: 0, eye: 0, extender: 0 };
  for (const module of modules) {
    if (
      !module ||
      !kinds.includes(module.kind) ||
      !Number.isInteger(module.x) ||
      !Number.isInteger(module.y) ||
      Math.abs(module.x) > 1 ||
      Math.abs(module.y) > 1
    )
      return "Use os encaixes da grade 3 × 3.";
    const key = `${module.x},${module.y}`;
    if (occupied.has(key)) return "Cada encaixe recebe apenas uma peça.";
    occupied.add(key);
    if (++counts[module.kind] > level.stock[module.kind])
      return "Não há essa peça no estoque.";
  }
  if (!counts.foot) return "Adicione um pé para sair da estação.";
  if (state.carrying && !counts.claw)
    return "Mantenha uma garra para carregar a semente.";
  const connected: Point[] = [core];
  const remaining = modules.filter((module) => module.kind === "extender");
  while (remaining.length) {
    const index = remaining.findIndex((module) =>
      connected.some((support) => adjacent(module, support)),
    );
    if (index < 0)
      return "Conecte os extensores ao núcleo por outros extensores.";
    connected.push(remaining.splice(index, 1)[0]);
  }
  if (
    modules.some(
      (module) =>
        module.kind !== "extender" &&
        !connected.some((support) => adjacent(module, support)),
    )
  )
    return "Pé, garra e olho precisam de núcleo ou extensor ao lado.";
  if (
    ![core, ...modules].every((module) =>
      free(level, state, world(state.position, module)),
    )
  )
    return "O corpo não cabe aqui: há uma parede ou porta.";
  return null;
}

export function targets(level: Level, state: State): Target[] {
  if (state.delivered) return [];
  const claws = state.modules
    .filter((module) => module.kind === "claw")
    .map((module) => world(state.position, module));
  const reachable = (point: Point) =>
    free(level, state, point) && claws.some((claw) => adjacent(claw, point));
  const result: Target[] = [];
  if (!state.carrying && reachable(level.seed))
    result.push({ ...level.seed, id: "seed", label: "Pegar semente" });
  if (state.carrying && reachable(level.nest))
    result.push({ ...level.nest, id: "nest", label: "Entregar semente" });
  for (const item of level.switches) {
    if (
      !state.opened.includes(item.id) &&
      (!item.hidden || state.modules.some((module) => module.kind === "eye")) &&
      reachable(item)
    )
      result.push({
        x: item.x,
        y: item.y,
        id: item.id,
        label: item.hidden ? "Acionar símbolo revelado" : "Acionar interruptor",
      });
  }
  return result;
}

export function transition(
  level: Level,
  state: State,
  command: Command,
): Result {
  const fail = (reason: string): Result => ({ ok: false, reason });
  if (state.delivered)
    return fail("Semente entregue! Avance ou desfaça a última ação.");
  if (!command || typeof command !== "object") return fail("Comando inválido.");
  if (command.type === "assemble") {
    const reason = validateAssembly(level, state, command.modules);
    return reason
      ? fail(reason)
      : {
          ok: true,
          state: {
            ...state,
            modules: command.modules.map((module) => ({ ...module })),
          },
        };
  }
  if (command.type === "move") {
    if (
      !Number.isInteger(command.dx) ||
      !Number.isInteger(command.dy) ||
      Math.abs(command.dx) + Math.abs(command.dy) !== 1
    )
      return fail("Mova uma casa por vez, sem diagonais.");
    if (!state.modules.some((module) => module.kind === "foot"))
      return fail("Monte um pé na estação para se mover.");
    const position = {
      x: state.position.x + command.dx,
      y: state.position.y + command.dy,
    };
    if (
      ![core, ...state.modules].every((module) =>
        free(level, state, world(position, module)),
      )
    )
      return fail("O corpo não cabe: caminho bloqueado.");
    return { ok: true, state: { ...state, position } };
  }
  if (command.type === "interact") {
    if (!targets(level, state).some((target) => target.id === command.target))
      return fail(
        "Escolha um alvo ao alcance da garra; símbolos ocultos precisam de olho.",
      );
    if (command.target === "seed")
      return { ok: true, state: { ...state, carrying: true } };
    if (command.target === "nest")
      return {
        ok: true,
        state: { ...state, carrying: false, delivered: true },
      };
    return {
      ok: true,
      state: { ...state, opened: [...state.opened, command.target].sort() },
    };
  }
  return fail("Comando inválido.");
}
