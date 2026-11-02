import { test, expect, type Page } from "@playwright/test";

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
        { timeout: 6000, intervals: [16] },
      )
      .toBe(true);
  } finally {
    await page.keyboard.up(key);
  }
}
async function clickPoint(page: Page, x: number, y: number) {
  const point = await page.locator("#world").evaluate(
    (el, p) => {
      const matrix = (el as unknown as SVGSVGElement).getScreenCTM()!;
      const q = new DOMPoint(p.x, p.y).matrixTransform(matrix);
      return { x: q.x, y: q.y };
    },
    { x, y },
  );
  await page.mouse.click(point.x, point.y);
  await expect
    .poll(
      async () => {
        const p = await position(page);
        return Math.hypot(p.x - x, p.y - y) < 5;
      },
      { timeout: 6000, intervals: [16] },
    )
    .toBe(true);
}
test("Should_CompleteOpening_When_UsingOnlyKeyboard", async ({ page }) => {
  await page.goto("/concept.html");
  await page.keyboard.press("Space");
  await move(page, "ArrowRight", "x", 220, true);
  await expect(page.locator("#progress")).toHaveText("1 / 3 raízes");
  await move(page, "ArrowUp", "y", 140, false);
  await move(page, "ArrowRight", "x", 490, true);
  await expect(page.locator("#progress")).toHaveText("2 / 3 raízes");
  await move(page, "ArrowDown", "y", 300, true);
  await page.keyboard.down("ArrowRight");
  await expect(page.locator("#finish")).toBeVisible({ timeout: 6000 });
  await page.keyboard.up("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.locator("#finish")).toBeHidden();
  await expect(page.locator("#progress")).toHaveText("0 / 3 raízes");
});
test("Should_CompleteAndRestartOpening_When_UsingOnlyMouse", async ({
  page,
}) => {
  await page.goto("/concept.html");
  await page.getByRole("button", { name: "Escavar: desligado" }).click();
  for (const [x, y] of [
    [220, 270],
    [220, 140],
    [490, 140],
    [490, 300],
    [790, 300],
  ])
    await clickPoint(page, x!, y!);
  await expect(page.locator("#progress")).toHaveText("3 / 3 raízes");
  const world = page.locator("#world");
  const point = await world.evaluate((el) => {
    const q = new DOMPoint(888, 300).matrixTransform(
      (el as unknown as SVGSVGElement).getScreenCTM()!,
    );
    return { x: q.x, y: q.y };
  });
  await page.mouse.click(point.x, point.y);
  await expect(page.locator("#finish")).toBeVisible({ timeout: 4000 });
  await page.getByRole("button", { name: "Jogar novamente" }).click();
  await expect(page.locator("#progress")).toHaveText("0 / 3 raízes");
  await expect(
    page.getByRole("button", { name: "Escavar: desligado" }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#tunnel circle")).toHaveCount(1);
});
test("Should_StopAtRockAndLoseFocus_When_Moving", async ({ page }) => {
  await page.goto("/concept.html");
  await page.keyboard.press("Space");
  await page.keyboard.down("ArrowRight");
  await expect(page.locator("#message")).toContainText("Rocha firme", {
    timeout: 5000,
  });
  await page.keyboard.up("ArrowRight");
  expect((await position(page)).x).toBeLessThan(315);
  await page.keyboard.press("r");
  await expect(page.locator("#progress")).toHaveText("0 / 3 raízes");
  await page.keyboard.down("ArrowUp");
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  const before = await position(page);
  await page.waitForTimeout(150);
  expect(await position(page)).toEqual(before);
  await page.keyboard.up("ArrowUp");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
