import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  Loading,
  Toast,
} from "../ui/components";
import { t, type Locale, type MessageKey } from "./i18n";
import { resolveRoute } from "./router";
import { Preferences } from "../features/preferences/Preferences";
import type { DemoItem } from "../features/preferences/demo-catalog";
import { createDemoProfile } from "../features/preferences/demo-model";

function Star({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12 0l2.4 7.8L21 3l-4.8 6.6L24 12l-7.8 2.4L21 21l-6.6-4.8L12 24l-2.4-7.8L3 21l4.8-6.6L0 12l7.8-2.4L3 3l6.6 4.8z"
      />
    </svg>
  );
}

export function App() {
  const [customItems, setCustomItems] = useState<DemoItem[]>([]);
  const [profile, setProfile] = useState(createDemoProfile);
  const [locale, setLocale] = useState<Locale>("ro");
  const [path, setPath] = useState(window.location.pathname);
  const [dialog, setDialog] = useState(false);
  const [toast, setToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const text = (key: MessageKey) => t(locale, key);
  const route = resolveRoute(path);
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(path);
  useEffect(() => {
    const titleKey =
      route === "home"
        ? "intro"
        : route === "explore"
          ? "notebook"
          : route === "preferences"
            ? "preferences"
            : "notFound";
    document.title = `${t(locale, titleKey)} — Travel Buddy`;
    if (previousPath.current !== path) {
      mainRef.current?.focus();
      previousPath.current = path;
    }
  }, [path, locale, route]);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  function navigate(event: MouseEvent<HTMLAnchorElement>, next: string) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    if (window.location.pathname !== next) {
      window.history.pushState(null, "", next);
      setPath(next);
      window.scrollTo(0, 0);
    }
  }
  function retry() {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 800);
  }
  return (
    <>
      <a className="skip-link" href="#content">
        {text("skip")}
      </a>
      <header className="header">
        <div className="header-inner">
          <a
            className="brand"
            href="/"
            onClick={(event) => navigate(event, "/")}
            aria-label="Travel Buddy"
          >
            <Star className="brand-mark" />
            <span>
              Travel
              <br />
              Buddy<span className="brand-dot">.</span>
            </span>
          </a>
          <nav aria-label="Travel Buddy">
            <a
              href="/"
              aria-current={route === "home" ? "page" : undefined}
              onClick={(event) => navigate(event, "/")}
            >
              {text("home")}
            </a>
            <a
              href="/explore"
              aria-current={route === "explore" ? "page" : undefined}
              onClick={(event) => navigate(event, "/explore")}
            >
              {text("explore")}
            </a>
            <a href="/preferences" aria-current={route === "preferences" ? "page" : undefined} onClick={(event) => navigate(event, "/preferences")}>{text("preferences")}</a>
          </nav>
          <div className="locale">
            <label htmlFor="locale">{text("language")}</label>
            <select
              id="locale"
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
            >
              <option value="ro">RO</option>
              <option value="en">EN</option>
              <option value="fr">FR</option>
            </select>
          </div>
        </div>
      </header>
      <main ref={mainRef} id="content" tabIndex={-1} className="main">
        <p className="notice">{text("demoNotice")}</p>
        {route === "home" && (
          <>
            <div className="intro">
              <div>
                <p className="eyebrow">Travel Buddy / {text("demoBadge")}</p>
                <h1>{text("intro")}</h1>
                <p className="lead">{text("introText")}</p>
                <a
                  className="button"
                  href="/explore"
                  onClick={(event) => navigate(event, "/explore")}
                >
                  {text("exploreAction")}
                </a>
              </div>
              <div className="passport" aria-hidden="true">
                <div className="passport-inner">
                  <span>TRAVEL BUDDY</span>
                  <Star className="passport-globe" />
                  <span>Bon voyage!</span>
                </div>
              </div>
            </div>
            <Card className="journey">
              <div>
                <span className="ticket-label">{text("demoBadge")}</span>
                <h2>{text("journeyTitle")}</h2>
                <p>{text("journeyText")}</p>
              </div>
              <div className="stamp" aria-hidden="true">
                BON
                <br />
                VOYAGE
              </div>
            </Card>
          </>
        )}
        {route === "explore" && (
          <>
            <div className="page-heading">
              <p className="eyebrow">Travel Buddy / {text("demoBadge")}</p>
              <h1>{text("notebook")}</h1>
              <p className="lead">{text("notebookText")}</p>
            </div>
            <div className="demo-grid">
              <Card>
                <Field
                  id="idea"
                  name="idea"
                  autoComplete="off"
                  label={text("field")}
                  placeholder={text("placeholder")}
                />
                <div className="actions">
                  <Button onClick={() => setDialog(true)}>
                    {text("showDialog")}
                  </Button>
                  <Button
                    className="button-secondary"
                    onClick={() => setToast(true)}
                  >
                    {text("showToast")}
                  </Button>
                </div>
                {toast && <Toast>{text("toast")}</Toast>}
              </Card>
              <Card>
                <EmptyState title={text("emptyTitle")}>
                  {text("emptyText")}
                </EmptyState>
              </Card>
              <Card>
                {loading ? (
                  <Loading>{text("loading")}</Loading>
                ) : (
                  <ErrorState
                    title={text("errorTitle")}
                    action={
                      <Button className="button-secondary" onClick={retry}>
                        {text("retry")}
                      </Button>
                    }
                  >
                    {text("errorText")}
                  </ErrorState>
                )}
              </Card>
            </div>
            <Dialog
              open={dialog}
              title={text("dialogTitle")}
              closeLabel={text("close")}
              onClose={() => setDialog(false)}
            >
              <p>{text("dialogText")}</p>
            </Dialog>
          </>
        )}
        {route === "preferences" && <Preferences locale={locale} profile={profile} setProfile={setProfile} customItems={customItems} setCustomItems={setCustomItems} />}
        {route === "notFound" && (
          <div className="page-heading">
            <h1>{text("notFound")}</h1>
            <p className="lead">{text("notFoundText")}</p>
            <a
              className="button"
              href="/"
              onClick={(event) => navigate(event, "/")}
            >
              {text("backHome")}
            </a>
          </div>
        )}
      </main>
      <footer className="footer">Travel Buddy · {text("demoBadge")}</footer>
    </>
  );
}
