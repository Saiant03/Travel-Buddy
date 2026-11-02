import { Button, Field } from "../../ui/components";
import type { SceneProps } from "./scene-types";

export function DestinationTicket({
  m,
  draft,
  update,
  error,
  fieldError,
  forward,
}: SceneProps) {
  return (
    <section className="trip-ticket">
      <div className="ticket-top">
        Travel Buddy <span>✈</span>
      </div>
      <Field
        id="destination"
        name="destination"
        autoComplete="off"
        {...fieldError("destination")}
        label={m.destination}
        value={draft.destination}
        maxLength={4000}
        onChange={(e) => update({ destination: e.target.value })}
      />
      {error("destination")}
      <fieldset>
        <legend>
          {m.daysMode} / {m.calendar}
        </legend>
        <label>
          <input
            type="radio"
            name="dateMode"
            checked={draft.mode === "days"}
            onChange={() => update({ mode: "days" })}
          />{" "}
          {m.daysMode}
        </label>
        <label>
          <input
            type="radio"
            name="dateMode"
            checked={draft.mode === "calendar"}
            onChange={() => update({ mode: "calendar" })}
          />{" "}
          {m.calendar}
        </label>
      </fieldset>
      {draft.mode === "days" ? (
        <>
          <Field
            id="days"
            name="days"
            autoComplete="off"
            {...fieldError("days")}
            label={m.days}
            inputMode="numeric"
            value={draft.days}
            onChange={(e) => update({ days: e.target.value })}
          />
          {error("days")}
        </>
      ) : (
        <div className="trip-row">
          <div>
            <Field
              type="date"
              id="start"
              name="start"
              autoComplete="off"
              {...fieldError("start")}
              label={m.start}
              value={draft.start}
              onChange={(e) => update({ start: e.target.value })}
            />
            {error("start")}
          </div>
          <Field
            type="date"
            id="end"
            name="end"
            autoComplete="off"
            {...fieldError("start")}
            label={m.end}
            value={draft.end}
            onChange={(e) => update({ end: e.target.value })}
          />
        </div>
      )}
      <Button onClick={forward}>{m.next}</Button>
    </section>
  );
}
