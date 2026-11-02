import { describe, expect, it } from "vitest";
import {
  createTripDraft,
  validateDestination,
  validateTransportAndStay,
} from "../../../src/features/trip-creation/demo-model";

describe("trip draft", () => {
  it("requires a destination and valid positive whole number of days", () => {
    expect(validateDestination(createTripDraft()).map((i) => i.path)).toEqual(
      expect.arrayContaining(["destination", "days"]),
    );
  });
  it("requires at least one transport choice", () => {
    expect(
      validateTransportAndStay(createTripDraft()).map((i) => i.path),
    ).toContain("transport");
  });
});

describe("calendar, bases and output", () => {
  const valid = () => ({
    ...createTripDraft(),
    destination: "Lisabona",
    days: "5",
    transport: ["walk", "transit"] as ("walk" | "transit")[],
  });
  it("validates actual calendar dates and inclusive ranges", () => {
    const d = {
      ...valid(),
      mode: "calendar" as const,
      start: "2024-02-29",
      end: "2024-02-29",
    };
    expect(validateDestination(d)).toEqual([]);
    expect(validateDestination({ ...d, start: "2023-02-29" })).not.toEqual([]);
    expect(validateDestination({ ...d, start: "2024-03-01" })).not.toEqual([]);
  });
  it("rejects fractional and unsafe day counts", () => {
    expect(validateDestination({ ...valid(), days: "2.5" })).not.toEqual([]);
    expect(
      validateDestination({ ...valid(), days: "9007199254740992" }),
    ).not.toEqual([]);
  });
  it("rejects overlapping, inverted and out-of-range stays, while allowing gaps", () => {
    const base = (startDay: string, endDay: string) => ({
      name: "Casă",
      startDay,
      endDay,
    });
    expect(
      validateTransportAndStay({
        ...valid(),
        bases: [base("1", "2"), base("3", "5")],
      }),
    ).toEqual([]);
    expect(
      validateTransportAndStay({
        ...valid(),
        bases: [base("1", "2"), base("2", "3")],
      }),
    ).not.toEqual([]);
    expect(
      validateTransportAndStay({ ...valid(), bases: [base("4", "3")] }),
    ).not.toEqual([]);
    expect(
      validateTransportAndStay({ ...valid(), bases: [base("1", "6")] }),
    ).not.toEqual([]);
  });
  it("builds a parsed demo trip with optional fields omitted", async () => {
    const { buildDemoTrip } =
      await import("../../../src/features/trip-creation/demo-model");
    const { parseTrip } = await import("../../../src/shared/contracts/trip");
    const result = buildDemoTrip(valid());
    expect(result).toMatchObject({
      ok: true,
      data: { dates: { days: 5 }, bases: [], transport: ["walk", "transit"] },
    });
    if (result && typeof result === "object" && "data" in result)
      expect(parseTrip(result.data).ok).toBe(true);
  });
});

describe("output details", () => {
  it("keeps calendar dates and counts days inclusively", async () => {
    const { buildDemoTrip } =
      await import("../../../src/features/trip-creation/demo-model");
    const draft = {
      ...createTripDraft(),
      destination: "Demo",
      mode: "calendar" as const,
      start: "2024-02-29",
      end: "2024-02-29",
      transport: ["walk", "transit", "car"] as ("walk" | "transit" | "car")[],
      arrivalTime: "09:30",
      departureTime: "23:59",
    };
    expect(buildDemoTrip(draft)).toMatchObject({
      ok: true,
      data: {
        dates: { start: "2024-02-29", end: "2024-02-29", days: 1 },
        transport: ["walk", "transit", "car"],
        arrivalTime: "09:30",
        departureTime: "23:59",
      },
    });
    expect(
      buildDemoTrip({ ...draft, start: "2027-05-12", end: "2027-05-16" }),
    ).toMatchObject({ ok: true, data: { dates: { days: 5 } } });
    expect(
      validateTransportAndStay({ ...draft, arrivalTime: "25:00" }),
    ).toContainEqual({ path: "arrivalTime", code: "time" });
  });
  it("omits optional fields and allows gaps between stays", async () => {
    const { buildDemoTrip } =
      await import("../../../src/features/trip-creation/demo-model");
    const draft = {
      ...createTripDraft(),
      destination: "Demo",
      days: "5",
      transport: ["walk"] as "walk"[],
      bases: [
        { name: "A", startDay: "1", endDay: "2" },
        { name: "B", startDay: "4", endDay: "5" },
      ],
    };
    expect(validateTransportAndStay(draft)).toEqual([]);
    const result = buildDemoTrip(draft);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.dates).toEqual({ days: 5 });
      expect(result.data).not.toHaveProperty("budget");
      expect(result.data).not.toHaveProperty("arrivalTime");
      expect(result.data).not.toHaveProperty("departureTime");
    }
    const shortened = { ...draft, days: "3" };
    expect(validateTransportAndStay(shortened)).not.toEqual([]);
    expect(shortened.bases[1]?.endDay).toBe("5");
  });
});
