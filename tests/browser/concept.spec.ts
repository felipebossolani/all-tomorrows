import { test, expect, type Page } from "@playwright/test";

test.setTimeout(60_000);

async function position(page: Page) {
  const transform = await page.locator("#creature").getAttribute("transform");
  const match = transform!.match(/translate\(([\d.]+) ([\d.]+)\)/)!;
  return { x: Number(match[1]), y: Number(match[2]) };
}
async function move(
  page: Page,
  key: string,
  axis: "x" | "y",
  value: number,
  positive: boolean,
) {
  await page.keyboard.down(key);
  try {
    await expect
      .poll(
        async () => {
          const p = await position(page);
          return positive ? p[axis] >= value : p[axis] <= value;
        },
        { timeout: 12_000, intervals: [16] },
      )
      .toBe(true);
  } finally {
    await page.keyboard.up(key);
  }
}
async function aim(page: Page, x: number, y: number) {
  const point = await page.locator("#world").evaluate(
    (el, p) => {
      const matrix = (el as unknown as SVGSVGElement).getScreenCTM()!;
      const q = new DOMPoint(p.x, p.y).matrixTransform(matrix);
      return { x: q.x, y: q.y };
    },
    { x, y },
  );
  await page.mouse.click(point.x, point.y);
}
async function clickPoint(page: Page, x: number, y: number) {
  await aim(page, x, y);
  await expect
    .poll(
      async () => {
        const p = await position(page);
        return Math.hypot(p.x - x, p.y - y) < 6;
      },
      { timeout: 12_000, intervals: [16] },
    )
    .toBe(true);
}
async function tabTo(page: Page, id: string) {
  for (let i = 0; i < 16; i++) {
    if (
      await page
        .locator(`#${id}`)
        .evaluate((el) => el === document.activeElement)
    )
      return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Control ${id} cannot be reached by Tab`);
}
async function wormsKeyboard(page: Page) {
  await page.keyboard.press("e");
  await expect(page.locator("#dig")).toHaveAttribute("aria-pressed", "true");
  await move(page, "ArrowRight", "x", 220, true);
  await expect(page.locator("#progress")).toContainText("1 / 3");
  await move(page, "ArrowUp", "y", 140, false);
  await move(page, "ArrowRight", "x", 490, true);
  await expect(page.locator("#progress")).toContainText("2 / 3");
  await move(page, "ArrowDown", "y", 300, true);
  await page.keyboard.down("ArrowRight");
  try {
    await expect(page.locator("#finish")).toBeVisible({ timeout: 9000 });
  } finally {
    await page.keyboard.up("ArrowRight");
  }
}
async function wormsMouse(page: Page) {
  await page.locator("#dig").click();
  for (const [x, y] of [
    [220, 270],
    [220, 140],
    [490, 140],
    [490, 300],
    [790, 300],
  ]) {
    await clickPoint(page, x!, y!);
  }
  await aim(page, 888, 300);
  await expect(page.locator("#finish")).toBeVisible({ timeout: 5000 });
}

test("Should_CompleteBothChapters_When_UsingOnlyKeyboard", async ({ page }) => {
  await page.goto("/concept.html");
  await expect(page.locator("#dig")).toContainText("E");
  await expect(page.locator("#dig")).toHaveAttribute("aria-keyshortcuts", "E");
  await wormsKeyboard(page);
  await expect(page.locator("#next")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#world")).toHaveAttribute("data-phase", "titans");
  await expect(page.locator("#world")).toBeFocused();
  await page.keyboard.press("e");
  await expect(page.locator("#progress")).toContainText("0 / 2");
  await move(page, "ArrowRight", "x", 280, true);
  await page.keyboard.press("e");
  await expect(page.locator("#progress")).toContainText("1 / 2");
  await move(page, "ArrowRight", "x", 490, true);
  await move(page, "ArrowUp", "y", 140, false);
  await move(page, "ArrowRight", "x", 590, true);
  await page.keyboard.press("e");
  await expect(page.locator("#progress")).toContainText("2 / 2");
  await move(page, "ArrowRight", "x", 790, true);
  await move(page, "ArrowDown", "y", 300, true);
  await page.keyboard.down("ArrowRight");
  try {
    await expect(page.locator("#finish")).toBeVisible({ timeout: 5000 });
  } finally {
    await page.keyboard.up("ArrowRight");
  }
  await expect(page.locator("#again")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#world")).toHaveAttribute("data-phase", "titans");
  await expect(page.locator("#progress")).toContainText("0 / 2");
  expect((await position(page)).x).toBe(100);
});

test("Should_CompleteBothChaptersAndReturnToStart_When_UsingOnlyMouse", async ({
  page,
}) => {
  await page.goto("/concept.html");
  await wormsMouse(page);
  await page.locator("#next").click();
  await expect(page.locator("#world")).toHaveAttribute("data-phase", "titans");
  await clickPoint(page, 280, 270);
  await page.locator("#dig").click();
  await expect(page.locator("#progress")).toContainText("1 / 2");
  await page.locator("#restart").click();
  await expect(page.locator("#progress")).toContainText("0 / 2");
  expect((await position(page)).x).toBe(100);
  await clickPoint(page, 280, 270);
  await aim(page, 490, 270);
  await expect
    .poll(async () => (await position(page)).x, { timeout: 5000 })
    .toBeGreaterThan(300);
  await page.waitForTimeout(250);
  expect((await position(page)).x).toBeLessThan(335);
  await expect(page.locator("#progress")).toContainText("0 / 2");
  await page.locator("#dig").click();
  await clickPoint(page, 490, 270);
  await clickPoint(page, 490, 140);
  await clickPoint(page, 590, 140);
  await page.locator("#dig").click();
  await expect(page.locator("#progress")).toContainText("2 / 2");
  await clickPoint(page, 790, 140);
  await clickPoint(page, 790, 300);
  await aim(page, 888, 300);
  await expect(page.locator("#finish")).toBeVisible({ timeout: 5000 });
  await page.locator("#journey-start").click();
  await expect(page.locator("#world")).toHaveAttribute("data-phase", "worms");
  await expect(page.locator("#progress")).toContainText("0 / 3");
  await expect(page.locator("#dig")).toHaveAttribute("aria-pressed", "false");
});

test("Should_KeepAbilityDiscoverableAndIndependent_When_ControlsHaveFocus", async ({
  page,
}) => {
  await page.goto("/concept.html");
  await expect(page.locator("#message")).toContainText("E");
  await tabTo(page, "restart");
  await page.keyboard.press("e");
  await expect(page.locator("#dig")).toHaveAttribute("aria-pressed", "true");
  await move(page, "ArrowRight", "x", 145, true);
  await page.keyboard.press("E");
  await expect(page.locator("#dig")).toHaveAttribute("aria-pressed", "false");
  expect((await position(page)).x).toBeGreaterThan(140);
  await page.keyboard.press("Control+e");
  await expect(page.locator("#dig")).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.down("e");
  await page.keyboard.down("e");
  await page.keyboard.up("e");
  await expect(page.locator("#dig")).toHaveAttribute("aria-pressed", "true");
  await tabTo(page, "restart");
  await page.keyboard.press("Space");
  await expect(page.locator("#dig")).toHaveAttribute("aria-pressed", "false");
  expect((await position(page)).x).toBe(100);
  await expect(page.locator("#world")).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.locator("#dig")).toHaveAttribute("aria-pressed", "true");
  await tabTo(page, "dig");
  await page.keyboard.press("Enter");
  await expect(page.locator("#dig")).toHaveAttribute("aria-pressed", "false");
});

test("Should_ActivateDirectionButton_When_PressingEnter", async ({ page }) => {
  await page.goto("/concept.html");
  await page.keyboard.press("e");
  const right = page.getByRole("button", {
    name: "Mover para direita",
    exact: true,
  });
  await right.focus();
  const start = await position(page);
  await page.keyboard.press("Enter");
  await expect
    .poll(async () => (await position(page)).x)
    .toBeGreaterThan(start.x);
});

test("Should_StopAtRockAndLoseFocus_When_Moving", async ({ page }) => {
  await page.goto("/concept.html");
  await page.keyboard.press("e");
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(async () => (await position(page)).x, { timeout: 5000 })
    .toBeGreaterThan(300);
  await page.waitForTimeout(200);
  await page.keyboard.up("ArrowRight");
  expect((await position(page)).x).toBeLessThan(315);
  await page.keyboard.press("r");
  await expect(page.locator("#progress")).toContainText("0 / 3");
  await page.keyboard.press("e");
  await page.keyboard.down("ArrowUp");
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  const before = await position(page);
  await page.waitForTimeout(150);
  expect(await position(page)).toEqual(before);
  await page.keyboard.up("ArrowUp");
});

test("Should_KeepControlsVisible_When_DesktopHeightIs720", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/concept.html");
  for (const width of [1280, 1024]) {
    await page.setViewportSize({ width, height: 720 });
    const box = await page.locator(".controls").boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(720);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test("Should_StopWithoutExtraStep_When_ReleasingMouseDirection", async ({
  page,
}) => {
  await page.goto("/concept.html");
  await page.locator("#dig").click();
  const right = page.getByRole("button", {
    name: "Mover para direita",
    exact: true,
  });
  await right.hover();
  await page.mouse.down();
  await expect.poll(async () => (await position(page)).x).toBeGreaterThan(120);
  const beforeRelease = await position(page);
  await page.mouse.up();
  const stopped = await position(page);
  expect(stopped.x - beforeRelease.x).toBeLessThan(12);
  await page.waitForTimeout(120);
  expect(await position(page)).toEqual(stopped);
});
