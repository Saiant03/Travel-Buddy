import { expect, test } from "@playwright/test";

test("validates and preserves the draft across steps, pages, language and reload", async ({
  page,
}) => {
  await page.goto("/trip-creation");
  await expect(
    page.getByRole("heading", { name: "Unde mergem?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pregătim bagajul" }).click();
  await expect(page.getByText("Adaugă o destinație fictivă.")).toBeVisible();
  await expect(page.getByLabel("Destinație")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByLabel("Destinație")).toHaveAttribute(
    "aria-describedby",
    "error-destination",
  );
  await page.getByLabel("Destinație").fill("Lisabona");
  await page.getByLabel("Număr de zile").fill("5");
  await page.getByRole("button", { name: "Pregătim bagajul" }).click();
  await page.getByRole("button", { name: "Deschidem pașaportul" }).click();
  await expect(
    page.getByText("Alege cel puțin un mod de transport."),
  ).toBeVisible();
  await page.getByLabel("Pe jos").check();
  await page.getByLabel("Transport public").check();
  await page.getByRole("button", { name: "Adaugă o cazare" }).click();
  await page.getByLabel("Numele cazării 1").fill("Casă");
  await page.getByLabel("De la ziua · Cazare 1").fill("1");
  await page.getByLabel("Până la ziua · Cazare 1").fill("2");
  await page.getByRole("button", { name: "Adaugă o cazare" }).click();
  await page.getByLabel("Numele cazării 2").fill("Hotel");
  await page.getByLabel("De la ziua · Cazare 2").fill("3");
  await page.getByLabel("Până la ziua · Cazare 2").fill("5");
  await page.getByRole("button", { name: "Deschidem pașaportul" }).click();
  await expect(
    page.getByRole("heading", { name: "Gata de plecare?" }),
  ).toBeVisible();
  await expect(page.getByText("Buget: nespecificat")).toBeVisible();
  await page.getByRole("link", { name: "Preferințe" }).click();
  await page.goBack();
  await expect(page.getByText("Lisabona")).toBeVisible();
  await page.getByLabel("Limba").selectOption("en");
  await expect(page.getByText("Lisabona")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Unde mergem?" }),
  ).toBeVisible();
  await expect(page.getByLabel("Destinație")).toHaveValue("");
});

test("keeps both duration modes and catches a shortened trip with a retained stay", async ({
  page,
}) => {
  await page.goto("/trip-creation");
  await page.getByLabel("Destinație").fill("Test");
  await page.getByLabel("Număr de zile").fill("5");
  await page.getByLabel("Date calendaristice").check();
  await page.getByLabel("Plecare").fill("2024-02-29");
  await page.getByLabel("Întoarcere").fill("2024-03-04");
  await page.getByLabel("Doar numărul de zile").check();
  await expect(page.getByLabel("Număr de zile")).toHaveValue("5");
  await page.getByRole("button", { name: "Pregătim bagajul" }).click();
  await page.getByLabel("Pe jos").check();
  await page.getByRole("button", { name: "Adaugă o cazare" }).click();
  await page.getByLabel("Numele cazării 1").fill("Casă");
  await page.getByLabel("De la ziua · Cazare 1").fill("3");
  await page.getByLabel("Până la ziua · Cazare 1").fill("5");
  await page.getByRole("button", { name: "Înapoi la bilet" }).click();
  await page.getByLabel("Număr de zile").fill("2");
  await page.getByRole("button", { name: "Pregătim bagajul" }).click();
  await page.getByRole("button", { name: "Deschidem pașaportul" }).click();
  await expect(
    page.getByText("Alege un interval de zile valid în vacanță."),
  ).toBeVisible();
  await expect(page.getByLabel("Până la ziua · Cazare 1")).toHaveValue("5");
});

test("reports gaps in accommodation and supports removing the last stay", async ({
  page,
}) => {
  await page.goto("/trip-creation");
  await page.getByLabel("Destinație").fill("Demo");
  await page.getByLabel("Număr de zile").fill("5");
  await page.getByRole("button", { name: "Pregătim bagajul" }).click();
  await page.getByLabel("Pe jos").check();
  await page.getByRole("button", { name: "Adaugă o cazare" }).click();
  await page.getByLabel("Numele cazării 1").fill("Casă");
  await page.getByLabel("De la ziua · Cazare 1").fill("1");
  await page.getByLabel("Până la ziua · Cazare 1").fill("2");
  await page.getByRole("button", { name: "Deschidem pașaportul" }).click();
  await expect(page.getByText("Casă: zilele 1–2")).toBeVisible();
  await expect(
    page.getByText("Cazarea nu este completată pentru toate zilele."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Înapoi la bagaj" }).click();
  await page.getByRole("button", { name: "Șterge cazarea 1" }).click();
  await expect(
    page.getByRole("button", { name: "Adaugă o cazare" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Deschidem pașaportul" }).click();
  await expect(page.getByText("Cazare: nespecificată")).toBeVisible();
});

test("updates validation after correcting a field or removing an invalid stay", async ({
  page,
}) => {
  await page.goto("/trip-creation");
  await page.getByRole("button", { name: "Pregătim bagajul" }).click();
  const destination = page.getByLabel("Destinație");
  await expect(destination).toHaveAttribute("aria-invalid", "true");
  await destination.fill("Demo");
  await expect(destination).not.toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("Adaugă o destinație fictivă."),
  ).not.toBeVisible();
});

test("removes validation belonging to a deleted stay", async ({ page }) => {
  await page.goto("/trip-creation");
  await page.getByLabel("Destinație").fill("Demo");
  await page.getByLabel("Număr de zile").fill("2");
  await page.getByRole("button", { name: "Pregătim bagajul" }).click();
  await page.getByLabel("Pe jos").check();
  await page.getByRole("button", { name: "Adaugă o cazare" }).click();
  await page.getByLabel("De la ziua · Cazare 1").fill("1");
  await page.getByLabel("Până la ziua · Cazare 1").fill("1");
  await page.getByRole("button", { name: "Adaugă o cazare" }).click();
  await page.getByLabel("Numele cazării 2").fill("Bază validă");
  await page.getByLabel("De la ziua · Cazare 2").fill("2");
  await page.getByLabel("Până la ziua · Cazare 2").fill("2");
  await page.getByRole("button", { name: "Deschidem pașaportul" }).click();
  await expect(page.getByLabel("Numele cazării 1")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByRole("button", { name: "Șterge cazarea 1" }).click();
  await expect(
    page.getByRole("button", { name: "Adaugă o cazare" }),
  ).toBeFocused();
  await expect(page.getByLabel("Numele cazării 1")).toHaveValue("Bază validă");
  await expect(page.getByLabel("Numele cazării 1")).not.toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(
    page.getByText("Adaugă un nume pentru cazare."),
  ).not.toBeVisible();
});
