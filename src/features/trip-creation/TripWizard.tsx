import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { tripMessages, type Locale } from "../../app/i18n";
import { DestinationTicket } from "./DestinationTicket";
import { TransportAndStay } from "./TransportAndStay";
import { PassportSummary } from "./PassportSummary";
import {
  validateDestination,
  validateTransportAndStay,
  type Transport,
  type TripDraft,
} from "./demo-model";
import "./trip-creation.css";

type Props = {
  locale: Locale;
  draft: TripDraft;
  setDraft: Dispatch<SetStateAction<TripDraft>>;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
};
export function TripWizard({ locale, draft, setDraft, step, setStep }: Props) {
  const m = tripMessages[locale];
  const [submitted, setSubmitted] = useState(false);
  const validate = () =>
    step === 0
      ? validateDestination(draft)
      : [...validateDestination(draft), ...validateTransportAndStay(draft)];
  const issues = submitted ? validate() : [];
  const heading = useRef<HTMLHeadingElement>(null);
  const previous = useRef(step);
  useEffect(() => {
    if (previous.current !== step) {
      heading.current?.focus();
      previous.current = step;
    }
  }, [step]);
  const update = (changes: Partial<TripDraft>) =>
    setDraft((current) => ({ ...current, ...changes }));
  const changeStep = (next: number) => {
    setSubmitted(false);
    setStep(next);
    window.scrollTo(0, 0);
  };
  const forward = () => {
    const found = validate();
    setSubmitted(true);
    if (found.length) {
      window.setTimeout(
        () => document.getElementById(found[0]?.path ?? "")?.focus(),
        0,
      );
      return;
    }
    changeStep(step + 1);
  };
  const error = (path: string) =>
    issues
      .filter((issue) => issue.path === path)
      .map((issue, index) => {
        const messages: Record<string, string> = {
          destination: m.destinationError,
          days: m.daysError,
          calendar: m.calendarError,
          transport: m.transportError,
          baseName: m.baseNameError,
          baseRange: m.baseRangeError,
          overlap: m.overlapError,
          time: m.timeError,
        };
        return (
          <p
            id={`error-${path}${index ? `-${index}` : ""}`}
            role="alert"
            className="trip-error"
            key={`${issue.code}-${index}`}
          >
            {messages[issue.code]}
          </p>
        );
      });
  const fieldError = (path: string) => ({
    "aria-invalid": issues.some((issue) => issue.path === path) || undefined,
    "aria-describedby": issues.some((issue) => issue.path === path)
      ? issues
          .filter((issue) => issue.path === path)
          .map((_, index) => `error-${path}${index ? `-${index}` : ""}`)
          .join(" ")
      : undefined,
  });
  const baseChange = (
    index: number,
    field: "name" | "startDay" | "endDay",
    value: string,
  ) =>
    update({
      bases: draft.bases.map((base, i) =>
        i === index ? { ...base, [field]: value } : base,
      ),
    });
  const toggle = (value: Transport) =>
    update({
      transport: draft.transport.includes(value)
        ? draft.transport.filter((x) => x !== value)
        : [...draft.transport, value],
    });
  const sceneProps = {
    m,
    locale,
    draft,
    update,
    error,
    fieldError,
    forward,
    changeStep,
    baseChange,
    toggle,
  };
  return (
    <div className={`trip-wizard trip-step-${step}`}>
      <p className="trip-notice">{m.notice}</p>
      <ol className="trip-steps" aria-label="Travel Buddy">
        <li aria-current={step === 0 ? "step" : undefined}>✈ {m.ticket}</li>
        <li aria-current={step === 1 ? "step" : undefined}>▣ {m.luggage}</li>
        <li aria-current={step === 2 ? "step" : undefined}>◎ {m.passport}</li>
      </ol>
      <h1 ref={heading} tabIndex={-1}>
        {step === 0 ? m.title : step === 1 ? m.second : m.third}
      </h1>
      {step === 0 && <DestinationTicket {...sceneProps} />}
      {step === 1 && <TransportAndStay {...sceneProps} />}
      {step === 2 && <PassportSummary {...sceneProps} />}
    </div>
  );
}
