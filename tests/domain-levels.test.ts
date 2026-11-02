import { describe, expect, it } from "vitest";
import {
  initialState,
  targets,
  transition,
  validateAssembly,
} from "../src/domain/engine";
import { levels } from "../src/levels";
import type { Command, Kind, Level, Module, State } from "../src/domain/types";

const moves: Command[] = [
  { type: "move", dx: 1, dy: 0 },
  { type: "move", dx: -1, dy: 0 },
  { type: "move", dx: 0, dy: 1 },
  { type: "move", dx: 0, dy: -1 },
];

// Enumerates every assignment of available kinds to the eight 3×3 sockets,
// including subsets of the stock; the actual engine filters support and collision.
function assemblies(level: Level): Module[][] {
  const result: Module[][] = [];
  const sockets = Array.from({ length: 9 }, (_, index) => ({
    x: (index % 3) - 1,
    y: Math.floor(index / 3) - 1,
  })).filter((point) => point.x || point.y);
  const counts = { foot: 0, claw: 0, eye: 0, extender: 0 };
  const kinds: Kind[] = ["foot", "claw", "eye", "extender"];
  const open: Level = {
    ...level,
    map: Array.from({ length: 5 }, () => "....."),
    stations: [{ x: 2, y: 2 }],
    doors: [],
  };
  const state = { ...initialState(open), position: { x: 2, y: 2 } };
  function visit(index: number, body: Module[]) {
    if (index === sockets.length) {
      if (validateAssembly(open, state, body) === null) result.push(body);
      return;
    }
    visit(index + 1, body);
    if (body.length === 4) return;
    for (const kind of kinds) {
      if (counts[kind] >= level.stock[kind]) continue;
      counts[kind]++;
      visit(index + 1, [...body, { ...sockets[index], kind }]);
      counts[kind]--;
    }
  }
  visit(0, []);
  return result;
}

function key(state: State): string {
  return JSON.stringify([
    state.position,
    [...state.modules].sort(
      (a, b) => a.x - b.x || a.y - b.y || a.kind.localeCompare(b.kind),
    ),
    state.carrying,
    state.delivered,
    [...state.opened].sort(),
  ]);
}

function assemblyKey(modules: Module[]): string {
  return JSON.stringify(
    [...modules].sort(
      (a, b) => a.x - b.x || a.y - b.y || a.kind.localeCompare(b.kind),
    ),
  );
}

function explore(level: Level, reassemble: boolean) {
  const bodies = assemblies(level);
  const queue: State[] = [];
  const visited = new Set<string>();
  let solved = false;
  let secondStationReached = false;
  const add = (state: State) => {
    const id = key(state);
    if (!visited.has(id)) {
      visited.add(id);
      queue.push(state);
    }
  };
  add(initialState(level));
  for (const body of bodies) {
    const result = transition(level, initialState(level), {
      type: "assemble",
      modules: body,
    });
    if (result.ok) add(result.state);
  }
  for (let index = 0; index < queue.length; index++) {
    const state = queue[index];
    solved ||= state.delivered;
    secondStationReached ||= level.stations
      .slice(1)
      .some(
        (point) => point.x === state.position.x && point.y === state.position.y,
      );
    const commands: Command[] = [
      ...moves,
      ...targets(level, state).map((target) => ({
        type: "interact" as const,
        target: target.id,
      })),
    ];
    if (
      reassemble &&
      level.stations.some(
        (point) => point.x === state.position.x && point.y === state.position.y,
      )
    ) {
      commands.push(
        ...bodies.map((modules) => ({ type: "assemble" as const, modules })),
      );
    }
    for (const command of commands) {
      const result = transition(level, state, command);
      if (result.ok) add(result.state);
    }
  }
  return {
    solved,
    states: visited.size,
    secondStationReached,
    assemblies: bodies.length,
  };
}

describe("campanha", () => {
  it("Should_StartEveryRoomWithALegalMobileBodyAndUsablePresets", () => {
    for (const level of levels) {
      const state = initialState(level);
      expect(state.modules.some((module) => module.kind === "foot")).toBe(true);
      expect(
        moves.some((command) => transition(level, state, command).ok),
        `sala ${level.id} começa com um corpo móvel`,
      ).toBe(true);
      for (const preset of level.presets ?? []) {
        expect(
          level.stations.some(
            (position) =>
              validateAssembly(
                level,
                { ...state, position },
                preset.modules,
              ) === null,
          ),
          `preset ${preset.id} da sala ${level.id} cabe em uma estação`,
        ).toBe(true);
      }
    }
  });

  it("Should_OfferDeliveryActivationAndArrivalObjectives", () => {
    expect(new Set(levels.map((level) => level.objective?.type))).toEqual(
      new Set(["deliver", "activate", "arrive"]),
    );
    for (const level of levels) {
      for (const command of level.solution) {
        if (command.type !== "assemble") continue;
        expect(
          level.presets?.some(
            (preset) =>
              assemblyKey(preset.modules) === assemblyKey(command.modules),
          ),
          `montagem da solução da sala ${level.id} corresponde a um preset`,
        ).toBe(true);
      }
    }
  });

  for (const level of levels) {
    it(`Should_CompleteObjective_FromInitialState_Room${level.id}`, () => {
      let state = initialState(level);
      for (const [index, command] of level.solution.entries()) {
        const before = structuredClone(state);
        const result = transition(level, state, command);
        expect(state).toEqual(before);
        expect(
          result.ok,
          `sala ${level.id}, comando ${index}: ${!result.ok ? result.reason : ""}`,
        ).toBe(true);
        if (!result.ok) throw new Error(result.reason);
        state = result.state;
      }
      expect(state.delivered).toBe(true);
      expect(state.carrying).toBe(false);
    });
  }
  it("Should_RequireExtender_InEveryReachableRoom4State", () => {
    const level = levels[3];
    const without = explore(
      { ...level, stock: { ...level.stock, extender: 0 } },
      true,
    );
    const withExtender = explore(level, true);
    console.info("Room 4 exhaustive proof", { without, withExtender });
    expect(without.solved).toBe(false);
    expect(withExtender.solved).toBe(true);
    expect(without.states).toBeGreaterThan(1);
  });
  it("Should_RequireReassembly_AfterInitialRoom5Assembly", () => {
    const without = explore(levels[4], false);
    const withReassembly = explore(levels[4], true);
    console.info("Room 5 exhaustive proof", { without, withReassembly });
    expect(without.solved).toBe(false);
    expect(without.secondStationReached).toBe(true);
    expect(withReassembly.solved).toBe(true);
    expect(withReassembly.secondStationReached).toBe(true);
  });
});
