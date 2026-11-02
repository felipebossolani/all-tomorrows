import { test, expect, type Page } from "@playwright/test";
import { levels } from "../../src/levels";
import { initialState, transition } from "../../src/domain/engine";
import type { Command, State } from "../../src/domain/types";
async function execute(page: Page, command: Command, state: State) {
  if (command.type === "assemble") {
    if (!(await page.getByTestId("assembly-editor").isVisible()))
      await page.getByTestId("open-assembly").click();
    await page.locator('[data-action="piece:remove"]').click();
    for (const m of state.modules)
      await page.getByTestId(`assembly-${m.x}-${m.y}`).click();
    for (const m of command.modules) {
      await page.locator(`[data-action="piece:${m.kind}"]`).click();
      await page.getByTestId(`assembly-${m.x}-${m.y}`).click();
    }
    await page.getByTestId("confirm-assembly").click();
    await expect(page.getByTestId("assembly-editor")).toHaveCount(0);
  } else if (command.type === "move") {
    const direction =
      command.dx === 1
        ? "right"
        : command.dx === -1
          ? "left"
          : command.dy === 1
            ? "down"
            : "up";
    await page.locator(`[data-action="${direction}"]`).click();
  } else {
    await page.getByTestId("interact").click();
    const group = page.getByRole("group", { name: "Escolher alvo" });
    if (await group.isVisible()) {
      const label =
        command.target === "seed"
          ? "Pegar semente"
          : command.target === "nest"
            ? "Entregar semente"
            : /Acionar/;
      await group.getByRole("button", { name: label }).click();
    }
  }
  await expect(page.getByTestId("status")).not.toHaveClass(/error/);
}
test("Should_CompleteSixRooms_AndResumeUnlockedProgress", async ({ page }) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByTestId("play").click();
  for (const room of levels) {
    let state = initialState(room);
    for (const command of room.solution) {
      await execute(page, command, state);
      const result = transition(room, state, command);
      if (!result.ok) throw new Error(result.reason);
      state = result.state;
    }
    await expect(page.getByTestId("level-complete")).toBeVisible();
    await page.getByTestId("next-level").click();
  }
  await expect(page.getByTestId("campaign-complete")).toBeVisible();
  await page.screenshot({
    path: `test-results/final-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.locator('[data-action="revisit"]').click();
  await expect(
    page.getByRole("dialog").locator("button:enabled").first(),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("dialog").locator(":focus")).toHaveCount(1);
  await page.reload();
  await page.getByTestId("continue").click();
  await page.getByTestId("level-selector").click();
  await expect(page.getByTestId("level-6")).toBeEnabled();
  expect(errors).toEqual([]);
});
test("Should_UndoAssemblyAndSeed_AndRestartDuringEditing", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("play").click();
  const room = levels[0];
  const state = initialState(room);
  const command = room.solution[0];
  await execute(page, command, state);
  const result = transition(room, state, command);
  if (!result.ok) throw new Error(result.reason);
  await page.locator('[data-action="undo"]').click();
  await page.locator('[data-action="right"]').click();
  await expect(page.getByTestId("status")).toContainText("pé");
  await execute(page, command, initialState(room));
  await page.getByTestId("interact").click();
  await expect(page.getByTestId("board")).toHaveAttribute(
    "aria-label",
    /Carregando/,
  );
  await page.locator('[data-action="undo"]').click();
  await expect(page.getByTestId("board")).not.toHaveAttribute(
    "aria-label",
    /Carregando/,
  );
  await page.getByTestId("open-assembly").click();
  await page.locator("body").click({ position: { x: 2, y: 2 } });
  await page.keyboard.press("r");
  await expect(page.getByTestId("board")).not.toHaveAttribute(
    "aria-label",
    /Carregando/,
  );
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("status")).toContainText("pé");
  await page.screenshot({
    path: `test-results/room-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("Should_PlayWhenLocalStorageUnavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("unavailable");
      },
    });
  });
  await page.goto("/");
  await page.getByTestId("play").click();
  await expect(page.getByTestId("board")).toBeVisible();
});

test("Should_UseKeyboardAndHints_WithoutExternalRequests", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (req) => {
    if (
      !req.url().startsWith("http://127.0.0.1:5173") &&
      !req.url().startsWith("ws://127.0.0.1:5173")
    )
      external.push(req.url());
  });
  await page.goto("/");
  await page.getByTestId("play").click();
  await execute(page, levels[0].solution[0], initialState(levels[0]));
  await page.locator("body").click({ position: { x: 2, y: 2 } });
  await page.keyboard.press("Space");
  await expect(page.getByTestId("board")).toHaveAttribute(
    "aria-label",
    /Carregando/,
  );
  await page.keyboard.press("z");
  await expect(page.getByTestId("board")).not.toHaveAttribute(
    "aria-label",
    /Carregando/,
  );
  await page.keyboard.press("ArrowDown");
  await expect(page.getByTestId("board")).toHaveAttribute(
    "aria-label",
    /linha 4/,
  );
  await page.getByTestId("hint").click();
  await expect(page.getByTestId("hint")).toContainText("1/2");
  await page.getByTestId("hint").click();
  await expect(page.getByTestId("hint")).toContainText("2/2");
  expect(external).toEqual([]);
});
test("Should_IgnoreCorruptProgress_AndKeepLockedRoomsUnavailable", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("corpo-sob-medida:v1", "invalid json"),
  );
  await page.goto("/");
  await expect(page.getByTestId("continue")).toHaveCount(0);
  await page.getByTestId("play").click();
  await page.getByTestId("level-selector").click();
  await expect(page.getByTestId("level-2")).toBeDisabled();
});

test("Should_NotMoveBody_WhenHintButtonHasKeyboardFocus", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("play").click();
  await execute(page, levels[0].solution[0], initialState(levels[0]));
  const before = await page.getByTestId("board").getAttribute("aria-label");
  await page.getByTestId("hint").click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("board")).toHaveAttribute(
    "aria-label",
    before!,
  );
});
