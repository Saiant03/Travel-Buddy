import { describe, expect, it } from "vitest";
import { resolveRoute } from "../../src/app/router";

describe("local routes", () => {
  it("recognizes home and the component demonstration", () => {
    expect(resolveRoute("/")).toBe("home");
    expect(resolveRoute("/explore")).toBe("explore");
    expect(resolveRoute("/explore/")).toBe("explore");
    expect(resolveRoute("/trip-creation")).toBe("tripCreation");
    expect(resolveRoute("/trip-creation/")).toBe("tripCreation");
  });
  it("recognizes the itinerary demonstration", () => {
    expect(resolveRoute("/itinerary-demo")).toBe("itineraryDemo");
    expect(resolveRoute("/itinerary-demo/")).toBe("itineraryDemo");
  });
  it("returns a not-found state for unknown routes", () => {
    expect(resolveRoute("/missing")).toBe("notFound");
    expect(resolveRoute("/explore/extra")).toBe("notFound");
  });
});
