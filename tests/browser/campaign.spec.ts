import { test, expect, type Page, type Locator } from "@playwright/test";
import { levels } from "../../src/levels";
import { initialState, transition, targets } from "../../src/domain/engine";
import type { Command, Level, Module, State } from "../../src/domain/types";

type Input = "keyboard" | "mouse";
const bodyKey = (modules: Module[]) =>
  JSON.stringify(
    [...modules].sort(
      (a, b) => a.x - b.x || a.y - b.y || a.kind.localeCompare(b.kind),
    ),
  );
async function tabTo(page: Page, locator: Locator) {
  await expect(locator).toBeVisible();
  for (let i = 0; i < 90; i++) {
    if (await locator.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(
    `Control unreachable by keyboard: ${await locator.getAttribute("data-testid")}`,
  );
}
async function activate(page: Page, locator: Locator, input: Input) {
  if (input === "mouse") await locator.click();
  else {
    await tabTo(page, locator);
    await page.keyboard.press("Enter");
  }
}
async function execute(
  page: Page,
  room: Level,
  state: State,
  command: Command,
  input: Input,
) {
  if (command.type === "assemble") {
    const preset = room.presets?.find(
      (p) => bodyKey(p.modules) === bodyKey(command.modules),
    );
    if (!preset) throw new Error(`Room ${room.id} solution lacks ready form`);
    await activate(page, page.getByTestId("open-assembly"), input);
    await activate(page, page.getByTestId(`preset-${preset.id}`), input);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBeLessThanOrEqual(720);
    await activate(page, page.getByTestId("preset-confirm"), input);
  } else if (command.type === "move") {
    const direction =
      command.dx === 1
        ? "right"
        : command.dx === -1
          ? "left"
          : command.dy === 1
            ? "down"
            : "up";
    if (input === "mouse")
      await page.locator(`[data-action="${direction}"]`).click();
    else {
      await tabTo(page, page.getByTestId("board"));
      await page.keyboard.press(
        {
          right: "ArrowRight",
          left: "ArrowLeft",
          up: "ArrowUp",
          down: "ArrowDown",
        }[direction],
      );
    }
  } else {
    const available = targets(room, state);
    await activate(page, page.getByTestId("interact"), input);
    if (available.length > 1) {
      const index = available.findIndex((t) => t.id === command.target);
      await activate(page, page.getByTestId(`target-${index}`), input);
    }
  }
  await expect(page.getByTestId("status")).not.toHaveClass(/error/);
}
for (const input of ["keyboard", "mouse"] as const) {
  test(`Should_CompleteCooperativeCampaign_UsingOnly_${input}`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await activate(page, page.getByTestId("play"), input);
    for (const room of levels) {
      let state = initialState(room);
      let beforeLast = state;
      await expect(page.getByTestId("mission-title")).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight),
      ).toBeLessThanOrEqual(720);
      for (const command of room.solution) {
        beforeLast = state;
        await execute(page, room, state, command, input);
        const result = transition(room, state, command);
        if (!result.ok) throw new Error(result.reason);
        state = result.state;
      }
      await expect(page.getByTestId("level-complete")).toBeVisible();
      if (room.id === 1) {
        await activate(page, page.locator('[data-action="undo"]'), input);
        await expect(page.getByTestId("level-complete")).toHaveCount(0);
        await execute(page, room, beforeLast, room.solution.at(-1)!, input);
        await expect(page.getByTestId("level-complete")).toBeVisible();
      }
      if (room.id === 1)
        await page.screenshot({
          path: `test-results/first-success-${input}-${test.info().project.name}.png`,
          fullPage: true,
        });
      await activate(page, page.getByTestId("next-level"), input);
    }
    await expect(page.getByTestId("campaign-complete")).toBeVisible();
    await page.screenshot({
      path: `test-results/final-${input}-${test.info().project.name}.png`,
      fullPage: true,
    });
    await activate(page, page.locator('[data-action="revisit"]'), input);
    await expect(
      page.getByRole("dialog").locator("button:enabled").first(),
    ).toBeFocused();
    await page.reload();
    await activate(page, page.getByTestId("continue"), input);
    await activate(page, page.getByTestId("level-selector"), input);
    await expect(page.getByTestId("level-6")).toBeEnabled();
    expect(errors).toEqual([]);
  });
}
test("Should_StartMobile_AndUndoTheFirstMovement", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("play").click();
  await expect(page.getByTestId("assembly-editor")).toHaveCount(0);
  const before = await page.getByTestId("board").getAttribute("aria-label");
  const first = levels[0].solution[0];
  expect(first.type).toBe("move");
  await execute(page, levels[0], initialState(levels[0]), first, "mouse");
  await expect(page.getByTestId("board")).not.toHaveAttribute(
    "aria-label",
    before!,
  );
  await page.locator('[data-action="undo"]').click();
  await expect(page.getByTestId("board")).toHaveAttribute(
    "aria-label",
    before!,
  );
});
test("Should_PreviewWithoutMutation_AndRestartFromForms", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("play").click();
  const room = levels[0];
  let state = initialState(room);
  for (const command of room.solution) {
    if (command.type === "assemble") break;
    await execute(page, room, state, command, "mouse");
    const result = transition(room, state, command);
    if (!result.ok) throw Error(result.reason);
    state = result.state;
  }
  const before = await page.getByTestId("board").getAttribute("aria-label");
  await page.getByTestId("open-assembly").click();
  await page.getByTestId(`preset-${room.presets![0].id}`).click();
  await expect(page.getByTestId("board")).toHaveAttribute(
    "aria-label",
    before!,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("board")).toHaveAttribute(
    "aria-label",
    before!,
  );
  await page.getByTestId("open-assembly").click();
  await page.keyboard.press("r");
  await expect(page.getByTestId("preset-confirm")).toHaveCount(0);
  await execute(page, room, initialState(room), room.solution[0], "keyboard");
});
test("Should_PlayWithoutStorage_AndWithoutExternalRequests", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("unavailable");
      },
    });
  });
  const external: string[] = [];
  page.on("request", (r) => {
    if (!/^https?:\/\/127\.0\.0\.1:5173\//.test(r.url()))
      external.push(r.url());
  });
  await page.goto("/");
  await page.getByTestId("play").click();
  await execute(
    page,
    levels[0],
    initialState(levels[0]),
    levels[0].solution[0],
    "mouse",
  );
  expect(external).toEqual([]);
});
test("Should_IgnoreCorruptProgress_AndKeepLaterRoomsLocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    for (const version of ["v1", "v2"])
      localStorage.setItem(`corpo-sob-medida:${version}`, "invalid json");
  });
  await page.goto("/");
  await expect(page.getByTestId("continue")).toHaveCount(0);
  await page.getByTestId("play").click();
  await page.getByTestId("level-selector").click();
  await expect(page.getByTestId("level-2")).toBeDisabled();
});
test("Should_KeepMovementSeparateFromFocusedControls", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("play").click();
  const before = await page.getByTestId("board").getAttribute("aria-label");
  await page.getByTestId("hint").click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("board")).toHaveAttribute(
    "aria-label",
    before!,
  );
});

test("Should_EditFreely_UsingOnlyKeyboard", async ({ page }) => {
  await page.goto("/");
  await activate(page, page.getByTestId("play"), "keyboard");
  const room = levels[0];
  let state = initialState(room);
  for (const command of room.solution) {
    if (command.type === "assemble") break;
    await execute(page, room, state, command, "keyboard");
    const result = transition(room, state, command);
    if (!result.ok) throw Error(result.reason);
    state = result.state;
  }
  await page.keyboard.press("m");
  await activate(page, page.locator('[data-action="free-editor"]'), "keyboard");
  await activate(page, page.locator('[data-action="piece:claw"]'), "keyboard");
  await activate(page, page.getByTestId("assembly-1-0"), "keyboard");
  await activate(page, page.getByTestId("confirm-assembly"), "keyboard");
  await expect(page.getByTestId("assembly-editor")).toHaveCount(0);
  await tabTo(page, page.getByTestId("board"));
  await page.keyboard.press("e");
  await expect(page.getByTestId("board")).toHaveAttribute(
    "aria-label",
    /Carregando/,
  );
  await page.keyboard.press("z");
  await expect(page.getByTestId("board")).not.toHaveAttribute(
    "aria-label",
    /Carregando/,
  );
});
test("Should_RespectReducedMotion_AndKeepInitialControlsVisible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByTestId("play").click();
  await expect(page.getByTestId("open-assembly")).toBeInViewport();
  await expect(page.locator('[data-action="restart"]')).toBeInViewport();
  const active = await page.locator(".board *").evaluateAll(
    (nodes) =>
      nodes.filter((el) => {
        const s = getComputedStyle(el);
        return (
          s.animationName !== "none" &&
          s.animationDuration.split(",").some((d) => parseFloat(d) > 0.01)
        );
      }).length,
  );
  expect(active).toBe(0);
});

test("Should_CancelFormsAndRestartEditing_UsingOnlyMouse", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("play").click();
  await page.locator('[data-action="right"]').click();
  const before = await page.getByTestId("board").getAttribute("aria-label");
  await page.getByTestId("open-assembly").click();
  await page.getByTestId("cancel-forms").click();
  await expect(page.getByTestId("preset-confirm")).toHaveCount(0);
  await expect(page.getByTestId("board")).toHaveAttribute(
    "aria-label",
    before!,
  );
  await page.getByTestId("open-assembly").click();
  await page.locator('[data-action="free-editor"]').click();
  await page.locator('[data-action="restart"]').click();
  await expect(page.getByTestId("assembly-editor")).toHaveCount(0);
  await expect(page.getByTestId("board")).not.toHaveAttribute(
    "aria-label",
    before!,
  );
});

test("Should_MigrateLegacyProgress_WhenNewSaveIsCorrupt", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "corpo-sob-medida:v1",
      JSON.stringify({ version: 1, unlocked: 4, sound: true }),
    );
    localStorage.setItem("corpo-sob-medida:v2", "broken");
  });
  await page.goto("/");
  await expect(page.getByTestId("continue")).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("corpo-sob-medida:v2")!),
  );
  expect(saved).toEqual({ version: 2, unlocked: 4, sound: true });
  await page.getByTestId("continue").click();
  await page.getByTestId("level-selector").click();
  await expect(page.getByTestId("level-4")).toBeEnabled();
  await expect(page.getByTestId("level-5")).toBeDisabled();
});
