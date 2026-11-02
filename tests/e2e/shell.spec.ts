import { expect, test } from "@playwright/test";

test("first visit precaches only the public shell for an offline launch", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const origin = "http://127.0.0.1:4173";

  try {
    await page.goto(origin);
    await expect(
      page.getByRole("heading", { name: "Un loc pentru aventurile voastre" }),
    ).toBeVisible();
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.waitForFunction(
      () => navigator.serviceWorker.controller !== null,
    );
    await page.evaluate(async () => {
      await fetch("/api/private");
      await fetch("/private/data");
      await fetch("/?private=1");
      await fetch("/manifest.webmanifest?private=1");
      await fetch("/manifest.webmanifest", {
        headers: { Authorization: "Bearer synthetic-test-token" },
      });
    });

    const cacheContents = await page.evaluate(async () => {
      const names = await caches.keys();
      const shellCaches = names.filter((name) =>
        name.startsWith("travel-buddy-shell-"),
      );
      const entries = await Promise.all(
        shellCaches.map(async (name) => {
          const cache = await caches.open(name);
          return (await cache.keys()).map((request) => new URL(request.url));
        }),
      );
      return {
        names: shellCaches,
        urls: entries
          .flat()
          .map((url) => ({ path: url.pathname, query: url.search })),
      };
    });

    expect(cacheContents.names).toHaveLength(1);
    expect(cacheContents.names[0]).toMatch(/^travel-buddy-shell-[a-f0-9]{12}$/);
    expect(cacheContents.urls).toEqual(
      expect.arrayContaining([
        { path: "/", query: "" },
        { path: "/index.html", query: "" },
        { path: "/manifest.webmanifest", query: "" },
        { path: "/icons/icon.svg", query: "" },
        { path: "/icons/icon-192.png", query: "" },
        { path: "/icons/icon-512.png", query: "" },
        { path: "/icons/apple-touch-icon.png", query: "" },
      ]),
    );
    expect(
      cacheContents.urls.some(
        ({ path, query }) =>
          path.startsWith("/api/") ||
          path.startsWith("/private/") ||
          query !== "",
      ),
    ).toBe(false);

    await context.setOffline(true);
    const offlinePage = await context.newPage();
    await offlinePage.goto(origin);
    await expect(
      offlinePage.getByRole("heading", {
        name: "Un loc pentru aventurile voastre",
      }),
    ).toBeVisible();
    await expect(
      offlinePage.getByText(
        "Aceasta este o demonstrație locală cu date fictive.",
      ),
    ).toBeVisible();
    expect(
      cacheContents.urls.some(({ path }) => path.startsWith("/assets/app-")),
    ).toBe(true);
    expect(
      cacheContents.urls.some(({ path }) =>
        path.startsWith("/assets/BricolageGrotesque-"),
      ),
    ).toBe(true);
  } finally {
    await context.close();
  }
});

test("local navigation, language and example controls work with keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explorează" }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await expect(page).toHaveTitle("Carnetul de călătorie — Travel Buddy");
  await expect(page.locator("main")).toBeFocused();
  await page.getByLabel("O idee pentru călătorie").fill("Plimbare");
  await page.getByRole("button", { name: "Deschide biletul" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Arată mesajul" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Mesaj demonstrativ afișat.",
  );
  await page.getByLabel("Limba").focus();
  await page.getByLabel("Limba").selectOption("fr");
  await expect(page.getByLabel("Langue")).toBeFocused();
  await expect(page).toHaveTitle("Carnet de voyage — Travel Buddy");
  await expect(
    page.getByRole("heading", { name: "Carnet de voyage" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Un lieu pour vos aventures" }),
  ).toBeVisible();
  await page.goForward();
  await expect(
    page.getByRole("heading", { name: "Carnet de voyage" }),
  ).toBeVisible();
  await page.goto("/explore");
  await expect(
    page.getByRole("heading", { name: "Carnetul de călătorie" }),
  ).toBeVisible();
  await page.goto("/missing");
  await expect(
    page.getByRole("heading", { name: "Pagina nu a fost găsită" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Înapoi acasă" }).click();
  await expect(
    page.getByRole("heading", { name: "Un loc pentru aventurile voastre" }),
  ).toBeVisible();
});
