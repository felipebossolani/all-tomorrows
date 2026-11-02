import { describe, expect, it } from "vitest";
import {
  initialState,
  targets,
  transition,
  validateAssembly,
} from "../src/domain/engine";
import { levels } from "../src/levels";
import type { Command, Module, State } from "../src/domain/types";

const level = levels[0];
const body: Module[] = [
  { kind: "foot", x: -1, y: 0 },
  { kind: "claw", x: 1, y: 0 },
];
function apply(state: State, command: Command): State {
  const result = transition(level, state, command);
  expect(result.ok, !result.ok ? result.reason : "").toBe(true);
  if (!result.ok) throw new Error(result.reason);
  return result.state;
}

describe("regras determinísticas", () => {
  it("Should_CompleteFirstRoom_FromEmptyInitialBody", () => {
    let state = initialState(level);
    expect(state.modules).toEqual([]);
    for (const command of level.solution) state = apply(state, command);
    expect(state.delivered).toBe(true);
  });
  it("Should_RejectMovementWithoutFoot_WithoutMutatingState", () => {
    const state = initialState(level);
    const snapshot = structuredClone(state);
    expect(transition(level, state, { type: "move", dx: 1, dy: 0 }).ok).toBe(
      false,
    );
    expect(state).toEqual(snapshot);
  });
  it("Should_ValidateGridStockOverlapAndTerminalSupport", () => {
    const state = initialState(level);
    for (const modules of [
      [],
      [...body, { kind: "eye", x: 0, y: 1 }],
      [{ kind: "foot", x: 0, y: 0 }],
      [{ kind: "foot", x: 2, y: 0 }],
      [
        { kind: "foot", x: -1, y: 0 },
        { kind: "claw", x: -1, y: 1 },
      ],
    ] as Module[][]) {
      expect(validateAssembly(level, state, modules)).not.toBeNull();
    }
    expect(validateAssembly(level, state, body)).toBeNull();
  });
  it("Should_RequireExplicitTarget_AndPreservePreviousSnapshots", () => {
    const first = initialState(level);
    const mounted = apply(first, { type: "assemble", modules: body });
    expect(targets(level, mounted).map((target) => target.id)).toEqual([
      "seed",
    ]);
    expect(
      transition(level, mounted, { type: "interact", target: "" }).ok,
    ).toBe(false);
    const carrying = apply(mounted, { type: "interact", target: "seed" });
    expect(mounted.carrying).toBe(false);
    expect(first.modules).toEqual([]);
    expect(
      validateAssembly(level, carrying, [{ kind: "foot", x: -1, y: 0 }]),
    ).toContain("garra");
  });
  it("Should_CheckEveryBodyCell_AndRejectDiagonalMoves", () => {
    const mounted = apply(initialState(level), {
      type: "assemble",
      modules: body,
    });
    const edge = apply(mounted, { type: "move", dx: 0, dy: -1 });
    expect(transition(level, edge, { type: "move", dx: 0, dy: -1 }).ok).toBe(
      false,
    );
    expect(transition(level, mounted, { type: "move", dx: 1, dy: 1 }).ok).toBe(
      false,
    );
    expect(
      validateAssembly(level, { ...mounted, position: { x: 3, y: 2 } }, body),
    ).toContain("estação");
  });
});

describe("portas, olho e extensores", () => {
  it("Should_OpenHiddenSwitch_OnlyWithEye_AndKeepDoorOpenAfterRemovingEye", () => {
    const room = levels[4];
    const bare = transition(room, initialState(room), {
      type: "assemble",
      modules: body,
    });
    expect(bare.ok).toBe(true);
    if (!bare.ok) throw new Error(bare.reason);
    expect(targets(room, bare.state)).toEqual([]);
    expect(
      transition(room, bare.state, { type: "interact", target: "passagem" }).ok,
    ).toBe(false);
    const equipped = transition(room, bare.state, {
      type: "assemble",
      modules: [...body, { kind: "eye", x: 0, y: -1 }],
    });
    if (!equipped.ok) throw new Error(equipped.reason);
    const opened = transition(room, equipped.state, {
      type: "interact",
      target: "passagem",
    });
    if (!opened.ok) throw new Error(opened.reason);
    expect(opened.state.opened).toEqual(["passagem"]);
    const removed = transition(room, opened.state, {
      type: "assemble",
      modules: body,
    });
    if (!removed.ok) throw new Error(removed.reason);
    expect(removed.state.opened).toEqual(["passagem"]);
    expect(initialState(room).opened).toEqual([]);
  });
  it("Should_RejectDisconnectedExtenders_AndAllowSupportedCornerClaw", () => {
    const room = levels[5];
    const state = initialState(room);
    expect(
      validateAssembly(room, state, [
        { kind: "foot", x: -1, y: 0 },
        { kind: "extender", x: 1, y: 1 },
      ]),
    ).toContain("extensores");
    expect(
      validateAssembly(room, state, [
        { kind: "foot", x: -1, y: 0 },
        { kind: "extender", x: 1, y: 0 },
        { kind: "claw", x: 1, y: 1 },
      ]),
    ).toBeNull();
  });
  it("Should_AllowChoosingAmongSeveralTargets_AndUseSwitchWhileCarrying", () => {
    const room = {
      ...level,
      seed: { x: 4, y: 2 },
      switches: [{ id: "ponte", x: 3, y: 3, hidden: false }],
    };
    const mounted = transition(room, initialState(room), {
      type: "assemble",
      modules: body,
    });
    if (!mounted.ok) throw new Error(mounted.reason);
    expect(targets(room, mounted.state).map((target) => target.id)).toEqual([
      "seed",
      "ponte",
    ]);
    const picked = transition(room, mounted.state, {
      type: "interact",
      target: "seed",
    });
    if (!picked.ok) throw new Error(picked.reason);
    expect(picked.state.opened).toEqual([]);
    const switched = transition(room, picked.state, {
      type: "interact",
      target: "ponte",
    });
    if (!switched.ok) throw new Error(switched.reason);
    expect(switched.state.carrying).toBe(true);
    expect(switched.state.opened).toEqual(["ponte"]);
  });
  it("Should_BlockDoorsForEveryBodyCell_AndRejectAssemblyInsideWalls", () => {
    const room = { ...level, doors: [{ x: 4, y: 2, switchId: "fechada" }] };
    const mounted = transition(room, initialState(room), {
      type: "assemble",
      modules: body,
    });
    if (!mounted.ok) throw new Error(mounted.reason);
    expect(
      transition(room, mounted.state, { type: "move", dx: 1, dy: 0 }).ok,
    ).toBe(false);
    const narrow = {
      ...room,
      start: { x: 1, y: 1 },
      stations: [{ x: 1, y: 1 }],
    };
    expect(validateAssembly(narrow, initialState(narrow), body)).toContain(
      "parede",
    );
    expect(targets(room, mounted.state)).toEqual([]);
  });
  it("Should_RejectMalformedExternalCommands_WithoutThrowing", () => {
    const state = initialState(level);
    for (const command of [
      null,
      {},
      { type: "teleport" },
      { type: "move", dx: NaN, dy: 0 },
      { type: "assemble", modules: null },
      { type: "assemble", modules: [null] },
    ]) {
      expect(transition(level, state, command as Command).ok).toBe(false);
    }
  });
});
