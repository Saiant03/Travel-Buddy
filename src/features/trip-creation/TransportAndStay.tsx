import { Button, Field } from "../../ui/components";
import type { SceneProps } from "./scene-types";

function TransportIcon({ type }: { type: "walk" | "transit" | "car" }) {
  return (
    <svg
      viewBox="0 0 48 40"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {type === "walk" && (
        <>
          <path d="M9 7h12l3 12 7 4c3 2 5 4 5 8H8c-2 0-3-2-3-4l3-9z" />
          <path d="M12 31v3h26v-3M18 13l6-2M19 17l6-2M26 25h5" />
        </>
      )}
      {type === "transit" && (
        <>
          <rect x="8" y="5" width="32" height="26" rx="5" />
          <path d="M8 19h32M13 9h22v7H13zM13 31v4M35 31v4" />
          <circle cx="15" cy="25" r="1.5" />
          <circle cx="33" cy="25" r="1.5" />
        </>
      )}
      {type === "car" && (
        <>
          <path d="M6 27v-6l5-2 5-9h16l6 9 4 2v6zM12 19h25M20 10l-2 9M30 10l2 9" />
          <circle cx="14" cy="28" r="4" />
          <circle cx="34" cy="28" r="4" />
        </>
      )}
    </svg>
  );
}

export function TransportAndStay({
  m,
  draft,
  update,
  error,
  fieldError,
  forward,
  changeStep,
  baseChange,
  toggle,
}: SceneProps) {
  return (
    <div className="trip-luggage">
      <p>{m.transportHelp}</p>
      <fieldset
        id="transport"
        {...fieldError("transport")}
        tabIndex={-1}
        className="transport-choices"
      >
        <legend>{m.transport}</legend>
        {(["walk", "transit", "car"] as const).map((value) => (
          <label key={value}>
            <input
              type="checkbox"
              name="transport"
              value={value}
              checked={draft.transport.includes(value)}
              onChange={() => toggle(value)}
            />
            <TransportIcon type={value} />
            {m[value]}
          </label>
        ))}
      </fieldset>
      {error("transport")}
      <section className="trip-stays">
        <h2>
          {m.stay} · {m.optional}
        </h2>
        {draft.bases.map((base, i) => (
          <div className="trip-stay" key={i}>
            <Field
              id={`bases.${i}.name`}
              name={`bases.${i}.name`}
              autoComplete="off"
              {...fieldError(`bases.${i}.name`)}
              label={`${m.baseName} ${i + 1}`}
              value={base.name}
              maxLength={4000}
              onChange={(e) => baseChange(i, "name", e.target.value)}
            />
            {error(`bases.${i}.name`)}
            <div className="trip-row">
              <Field
                id={`bases.${i}.startDay`}
                name={`bases.${i}.startDay`}
                autoComplete="off"
                {...fieldError(`bases.${i}.startDay`)}
                label={`${m.fromDay} · ${m.stay} ${i + 1}`}
                inputMode="numeric"
                value={base.startDay}
                onChange={(e) => baseChange(i, "startDay", e.target.value)}
              />
              <Field
                id={`bases.${i}.endDay`}
                name={`bases.${i}.endDay`}
                autoComplete="off"
                {...fieldError(`bases.${i}.startDay`)}
                label={`${m.toDay} · ${m.stay} ${i + 1}`}
                inputMode="numeric"
                value={base.endDay}
                onChange={(e) => baseChange(i, "endDay", e.target.value)}
              />
            </div>
            {error(`bases.${i}.startDay`)}
            <Button
              className="button-secondary"
              onClick={() => {
                update({
                  bases: draft.bases.filter((_, index) => i !== index),
                });
                window.setTimeout(
                  () => document.getElementById("add-stay")?.focus(),
                  0,
                );
              }}
            >
              {m.remove} {i + 1}
            </Button>
          </div>
        ))}
        <Button
          id="add-stay"
          className="button-secondary"
          onClick={() => {
            const i = draft.bases.length;
            update({
              bases: [...draft.bases, { name: "", startDay: "", endDay: "" }],
            });
            window.setTimeout(
              () => document.getElementById(`bases.${i}.name`)?.focus(),
              0,
            );
          }}
        >
          {m.addStay}
        </Button>
      </section>
      <div className="trip-row trip-times">
        {(["arrivalTime", "departureTime"] as const).map((field) => (
          <div key={field}>
            <Field
              type="time"
              id={field}
              name={field}
              autoComplete="off"
              {...fieldError(field)}
              label={`${field === "arrivalTime" ? m.arrival : m.departure} · ${m.optional}`}
              value={draft[field]}
              onChange={(e) => update({ [field]: e.target.value })}
            />
            {error(field)}
          </div>
        ))}
      </div>
      <div className="trip-actions">
        <Button className="button-secondary" onClick={() => changeStep(0)}>
          {m.back}
        </Button>
        <Button onClick={forward}>{m.nextSummary}</Button>
      </div>
    </div>
  );
}
