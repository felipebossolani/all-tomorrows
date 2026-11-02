import { describe, expect, it } from "vitest";
import {
  initialState,
  targets,
  transition,
  validateAssembly,
} from "../src/domain/engine";
import { levels } from "../src/levels";
import type { Command, Level, Module, State } from "../src/domain/types";

const firstRoom = levels[0];
const line: Module[] = [
  { kind: "foot", x: -1, y: 0 },
  { kind: "claw", x: 1, y: 0 },
];
const atFirstStation = (): State => ({
  ...initialState(firstRoom),
  position: { x: 3, y: 2 },
});

function apply(level: Level, state: State, command: Command): State {
  const result = transition(level, state, command);
  expect(result.ok, !result.ok ? result.reason : "").toBe(true);
  if (!result.ok) throw new Error(result.reason);
  return result.state;
}

describe("movimento e montagem", () => {
  it("Should_LetFirstRoomMoveBeforeAnyAssembly", () => {
    const state = initialState(firstRoom);
    expect(state.modules).toEqual([{ kind: "foot", x: -1, y: 0 }]);
    const moved = apply(firstRoom, state, { type: "move", dx: 1, dy: 0 });
    expect(moved.position).toEqual({ x: 3, y: 2 });
  });

  it("Should_RejectMovementWithoutFoot_WithoutMutatingState", () => {
    const state = { ...initialState(firstRoom), modules: [] };
    const snapshot = structuredClone(state);
    expect(
      transition(firstRoom, state, { type: "move", dx: 1, dy: 0 }).ok,
    ).toBe(false);
    expect(state).toEqual(snapshot);
  });

  it("Should_ValidateGridStockOverlapAndTerminalSupport", () => {
    const state = atFirstStation();
    for (const modules of [
      [],
      [...line, { kind: "eye", x: 0, y: 1 }],
      [{ kind: "foot", x: 0, y: 0 }],
      [{ kind: "foot", x: 2, y: 0 }],
      [
        { kind: "foot", x: -1, y: 0 },
        { kind: "claw", x: -1, y: 1 },
      ],
    ] as Module[][]) {
      expect(validateAssembly(firstRoom, state, modules)).not.toBeNull();
    }
    expect(validateAssembly(firstRoom, state, line)).toBeNull();
  });

  it("Should_RequireExplicitTarget_AndPreservePreviousSnapshots", () => {
    const first = atFirstStation();
    const mounted = apply(firstRoom, first, {
      type: "assemble",
      modules: line,
    });
    expect(targets(firstRoom, mounted)).toMatchObject([
      { id: "seed", label: "Pegar caixa de brotos" },
    ]);
    expect(
      transition(firstRoom, mounted, { type: "interact", target: "" }).ok,
    ).toBe(false);
    const carrying = apply(firstRoom, mounted, {
      type: "interact",
      target: "seed",
    });
    expect(mounted.carrying).toBe(false);
    expect(first.modules).toEqual([{ kind: "foot", x: -1, y: 0 }]);
    expect(
      validateAssembly(firstRoom, carrying, [{ kind: "foot", x: -1, y: 0 }]),
    ).toContain("garra");
  });

  it("Should_CheckEveryBodyCell_AndRejectDiagonalMoves", () => {
    const mounted = apply(firstRoom, atFirstStation(), {
      type: "assemble",
      modules: line,
    });
    const edge = apply(firstRoom, mounted, { type: "move", dx: 0, dy: -1 });
    expect(
      transition(firstRoom, edge, { type: "move", dx: 0, dy: -1 }).ok,
    ).toBe(false);
    expect(
      transition(firstRoom, mounted, { type: "move", dx: 1, dy: 1 }).ok,
    ).toBe(false);
  });
});

describe("objetivos e interações", () => {
  it("Should_CompleteOnlyTheSpecifiedActivationSwitch", () => {
    const room: Level = {
      ...firstRoom,
      stations: [{ x: 2, y: 2 }],
      objective: {
        type: "activate",
        title: "Teste",
        description: "Ative o painel final.",
        itemLabel: "painel",
        destinationLabel: "painel final",
        success: "Pronto.",
        switchId: "final",
      },
      switches: [
        { id: "auxiliar", x: 4, y: 2, hidden: false },
        { id: "final", x: 4, y: 3, hidden: false },
      ],
    };
    const mounted = { ...initialState(room), modules: line };
    const auxiliary = apply(room, mounted, {
      type: "interact",
      target: "auxiliar",
    });
    expect(auxiliary.delivered).toBe(false);
    expect(auxiliary.opened).toEqual(["auxiliar"]);
    const besideFinal = apply(room, auxiliary, { type: "move", dx: 0, dy: 1 });
    expect(targets(room, besideFinal)).toMatchObject([
      { id: "final", label: "Ativar painel final" },
    ]);
    expect(
      apply(room, besideFinal, { type: "interact", target: "final" }).delivered,
    ).toBe(true);
  });

  it("Should_CompleteArrivalOnlyAfterALegalMoveOntoTheObjective", () => {
    const room: Level = {
      ...firstRoom,
      objective: {
        type: "arrive",
        title: "Teste",
        description: "Chegue ao marco.",
        itemLabel: "marco",
        destinationLabel: "marco",
        success: "Pronto.",
        at: { x: 3, y: 2 },
      },
    };
    const state = initialState(room);
    expect(state.delivered).toBe(false);
    expect(apply(room, state, { type: "move", dx: 1, dy: 0 }).delivered).toBe(
      true,
    );
  });

  it("Should_DefaultToLegacyDeliveryWhenObjectiveIsAbsent", () => {
    const room: Level = {
      ...firstRoom,
      objective: undefined,
      stations: [{ x: 2, y: 2 }],
      initial: line,
      seed: { x: 4, y: 2 },
      nest: { x: 6, y: 2 },
    };
    const picked = apply(room, initialState(room), {
      type: "interact",
      target: "seed",
    });
    const moved = apply(room, picked, { type: "move", dx: 1, dy: 0 });
    const besideNest = apply(room, moved, { type: "move", dx: 1, dy: 0 });
    expect(targets(room, besideNest)).toMatchObject([
      { id: "nest", label: "Entregar em berço" },
    ]);
    expect(
      apply(room, besideNest, { type: "interact", target: "nest" }).delivered,
    ).toBe(true);
  });

  it("Should_OpenHiddenSwitch_OnlyWithEye_AndKeepDoorOpenAfterRemovingEye", () => {
    const room = levels[4];
    const bare = transition(room, initialState(room), {
      type: "assemble",
      modules: line,
    });
    expect(bare.ok).toBe(true);
    if (!bare.ok) throw new Error(bare.reason);
    expect(targets(room, bare.state)).toEqual([]);
    const equipped = transition(room, bare.state, {
      type: "assemble",
      modules: [...line, { kind: "eye", x: 0, y: -1 }],
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
      modules: line,
    });
    if (!removed.ok) throw new Error(removed.reason);
    expect(removed.state.opened).toEqual(["passagem"]);
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

  it("Should_RejectMalformedExternalCommands_WithoutThrowing", () => {
    const state = initialState(firstRoom);
    for (const command of [
      null,
      {},
      { type: "teleport" },
      { type: "move", dx: NaN, dy: 0 },
      { type: "assemble", modules: null },
      { type: "assemble", modules: [null] },
    ]) {
      expect(transition(firstRoom, state, command as Command).ok).toBe(false);
    }
  });
});
