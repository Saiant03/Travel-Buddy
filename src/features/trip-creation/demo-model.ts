import {
  calendarDateSchema,
  timeSchema,
  type Result,
} from "../../shared/contracts/common";
import { parseTrip, type Trip } from "../../shared/contracts/trip";

export type Transport = "walk" | "transit" | "car";
export type TripDraft = {
  destination: string;
  mode: "calendar" | "days";
  start: string;
  end: string;
  days: string;
  transport: Transport[];
  bases: { name: string; startDay: string; endDay: string }[];
  arrivalTime: string;
  departureTime: string;
};
export type Issue = { path: string; code: string };
export function createTripDraft(): TripDraft {
  return {
    destination: "",
    mode: "days",
    start: "",
    end: "",
    days: "",
    transport: [],
    bases: [],
    arrivalTime: "",
    departureTime: "",
  };
}
const integer = (value: string) =>
  /^\d+$/.test(value) &&
  Number.isSafeInteger(Number(value)) &&
  Number(value) > 0;
export function duration(draft: TripDraft): number | undefined {
  if (draft.mode === "days")
    return integer(draft.days) ? Number(draft.days) : undefined;
  if (
    !calendarDateSchema.safeParse(draft.start).success ||
    !calendarDateSchema.safeParse(draft.end).success ||
    draft.start > draft.end
  )
    return undefined;
  return (
    (Date.parse(`${draft.end}T00:00:00Z`) -
      Date.parse(`${draft.start}T00:00:00Z`)) /
      86400000 +
    1
  );
}
export function validateDestination(draft: TripDraft): Issue[] {
  const issues: Issue[] = [];
  if (!draft.destination.trim() || draft.destination.length > 4000)
    issues.push({ path: "destination", code: "destination" });
  if (duration(draft) === undefined)
    issues.push({
      path: draft.mode === "days" ? "days" : "start",
      code: draft.mode === "days" ? "days" : "calendar",
    });
  return issues;
}
export function validateTransportAndStay(draft: TripDraft): Issue[] {
  const issues: Issue[] = [];
  if (
    !draft.transport.length ||
    new Set(draft.transport).size !== draft.transport.length
  )
    issues.push({ path: "transport", code: "transport" });
  for (const field of ["arrivalTime", "departureTime"] as const)
    if (draft[field] && !timeSchema.safeParse(draft[field]).success)
      issues.push({ path: field, code: "time" });
  const days = duration(draft);
  draft.bases.forEach((base, i) => {
    if (!base.name.trim() || base.name.length > 4000)
      issues.push({ path: `bases.${i}.name`, code: "baseName" });
    if (
      !integer(base.startDay) ||
      !integer(base.endDay) ||
      Number(base.startDay) > Number(base.endDay) ||
      days === undefined ||
      Number(base.endDay) > days
    )
      issues.push({ path: `bases.${i}.startDay`, code: "baseRange" });
    if (
      draft.bases
        .slice(0, i)
        .some(
          (other) =>
            integer(other.startDay) &&
            integer(other.endDay) &&
            Number(base.startDay) <= Number(other.endDay) &&
            Number(other.startDay) <= Number(base.endDay),
        )
    )
      issues.push({ path: `bases.${i}.startDay`, code: "overlap" });
  });
  return issues;
}
export function buildDemoTrip(draft: TripDraft): Result<Trip> {
  const issues = [
    ...validateDestination(draft),
    ...validateTransportAndStay(draft),
  ];
  if (issues.length)
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        issues: issues.map((issue) => ({
          path: issue.path,
          message: issue.code,
        })),
      },
    };
  const place = (id: string, name: string) => ({
    id,
    name: name.trim(),
    location: { lat: 0, lng: 0 },
  });
  return parseTrip({
    schemaVersion: 1,
    id: "demo-trip",
    revision: 0,
    memberUids: ["demo-member-1", "demo-member-2"],
    destination: place("demo-destination", draft.destination),
    dates: {
      days: duration(draft),
      ...(draft.mode === "calendar"
        ? { start: draft.start, end: draft.end }
        : {}),
    },
    transport: draft.transport,
    bases: draft.bases.map((base, i) => ({
      id: `demo-base-${i + 1}`,
      place: place(`demo-place-${i + 1}`, base.name),
      startDay: Number(base.startDay),
      endDay: Number(base.endDay),
    })),
    ...(draft.arrivalTime ? { arrivalTime: draft.arrivalTime } : {}),
    ...(draft.departureTime ? { departureTime: draft.departureTime } : {}),
  });
}
