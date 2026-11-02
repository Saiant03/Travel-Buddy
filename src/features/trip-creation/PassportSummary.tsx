import { Button } from "../../ui/components";
import { duration } from "./demo-model";
import type { SceneProps } from "./scene-types";

export function PassportSummary({ m, draft, changeStep, locale }: SceneProps) {
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
  const number = new Intl.NumberFormat(locale);
  return (
    <section className="trip-passport">
      <p>{m.summaryText}</p>
      <div className="passport-pages">
        <div>
          <h2>{m.ticket}</h2>
          <p className="trip-destination">{draft.destination}</p>
          <p>
            {draft.mode === "calendar"
              ? `${formatDate(draft.start)} – ${formatDate(draft.end)}`
              : m.missingDate}{" "}
            · {number.format(duration(draft) ?? 0)} {m.dayLabel}
          </p>
          <p>{draft.transport.map((value) => m[value]).join(" + ")}</p>
          {draft.bases.length ? (
            draft.bases.map((base, i) => (
              <p key={i}>
                {base.name}: {m.stayDays} {number.format(Number(base.startDay))}
                –{number.format(Number(base.endDay))}
              </p>
            ))
          ) : (
            <p>{m.missingStay}</p>
          )}
          {draft.bases.length > 0 &&
            draft.bases.reduce(
              (sum, base) =>
                sum + Number(base.endDay) - Number(base.startDay) + 1,
              0,
            ) < (duration(draft) ?? 0) && <p>{m.partialStay}</p>}
          <p>
            {draft.arrivalTime || draft.departureTime
              ? `${m.arrival}: ${draft.arrivalTime || m.noTime}; ${m.departure}: ${draft.departureTime || m.noTime}`
              : m.missingTime}
          </p>
          <p>{m.missingBudget}</p>
        </div>
        <div>
          <h2>{m.passport}</h2>
          <p>{m.profiles}</p>
          <p>{m.synthetic}</p>
        </div>
      </div>
      <div className="trip-actions">
        <Button className="button-secondary" onClick={() => changeStep(0)}>
          {m.edit}
        </Button>
        <Button className="button-secondary" onClick={() => changeStep(1)}>
          {m.backStay}
        </Button>
      </div>
    </section>
  );
}
