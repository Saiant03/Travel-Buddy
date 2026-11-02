import type { ReactNode } from "react";
import type { Locale, tripMessages } from "../../app/i18n";
import type { Transport, TripDraft } from "./demo-model";
type Messages = { [K in keyof typeof tripMessages.ro]: string };
export type SceneProps = {
  m: Messages;
  locale: Locale;
  draft: TripDraft;
  update: (changes: Partial<TripDraft>) => void;
  error: (path: string) => ReactNode;
  fieldError: (path: string) => {
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
  };
  forward: () => void;
  changeStep: (step: number) => void;
  baseChange: (
    index: number,
    field: "name" | "startDay" | "endDay",
    value: string,
  ) => void;
  toggle: (value: Transport) => void;
};
