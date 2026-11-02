import type { Locale } from "../shared/contracts/common";

export const messages = {
  ro: {
    home: "Acasă",
    explore: "Explorează",
    language: "Limba",
    greeting: "Bun venit, {name}!",
    intro: "Un loc pentru aventurile voastre",
    introText:
      "Păstrează ideile de călătorie aproape și fă loc pentru noi descoperiri.",
    demoBadge: "Exemplu demonstrativ",
    demoNotice: "Aceasta este o demonstrație locală cu date fictive.",
    journeyTitle: "Următoarea aventură începe aici",
    journeyText: "Deocamdată nu există vacanțe în această demonstrație.",
    exploreAction: "Vezi demonstrația",
    notebook: "Carnetul de călătorie",
    notebookText: "Încearcă interacțiunile de mai jos. Nimic nu este salvat.",
    field: "O idee pentru călătorie",
    placeholder: "De exemplu, o plimbare la apus",
    showDialog: "Deschide biletul",
    dialogTitle: "O idee de luat cu tine",
    dialogText:
      "Acesta este un exemplu fictiv, doar pentru a încerca interfața.",
    close: "Închide",
    showToast: "Arată mesajul",
    toast: "Mesaj demonstrativ afișat.",
    loading: "Se încarcă exemplul…",
    emptyTitle: "O pagină încă goală",
    emptyText: "Ideile pentru călătorie vor avea loc aici.",
    errorTitle: "Exemplu de eroare",
    errorText: "Ceva nu a mers în acest exemplu. Poți încerca din nou.",
    retry: "Încearcă din nou",
    notFound: "Pagina nu a fost găsită",
    notFoundText: "Adresa nu corespunde unei pagini din această demonstrație.",
    backHome: "Înapoi acasă",
    skip: "Mergi la conținut",
  },
  en: {
    home: "Home",
    explore: "Explore",
    language: "Language",
    greeting: "Welcome, {name}!",
    intro: "A place for your adventures",
    introText:
      "Keep your travel ideas close and make room for new discoveries.",
    demoBadge: "Demo example",
    demoNotice: "This is a local demonstration with fictional data.",
    journeyTitle: "Your next adventure starts here",
    journeyText: "There are no trips in this demonstration yet.",
    exploreAction: "Explore the demo",
    notebook: "Travel notebook",
    notebookText: "Try the interactions below. Nothing is saved.",
    field: "A travel idea",
    placeholder: "For example, a sunset walk",
    showDialog: "Open the ticket",
    dialogTitle: "An idea to take along",
    dialogText: "This is a fictional example for trying the interface.",
    close: "Close",
    showToast: "Show message",
    toast: "Demo message displayed.",
    loading: "Loading the example…",
    emptyTitle: "A page still empty",
    emptyText: "Travel ideas will have a place here.",
    errorTitle: "Example error",
    errorText: "Something went wrong in this example. You can try again.",
    retry: "Try again",
    notFound: "Page not found",
    notFoundText: "This address does not match a page in this demonstration.",
    backHome: "Back home",
    skip: "Skip to content",
  },
  fr: {
    home: "Accueil",
    explore: "Découvrir",
    language: "Langue",
    greeting: "Bienvenue, {name} !",
    intro: "Un lieu pour vos aventures",
    introText:
      "Gardez vos idées de voyage à portée de main et préparez de nouvelles découvertes.",
    demoBadge: "Exemple de démonstration",
    demoNotice: "Cette démonstration locale utilise des données fictives.",
    journeyTitle: "Votre prochaine aventure commence ici",
    journeyText: "Il n’y a pas encore de voyages dans cette démonstration.",
    exploreAction: "Voir la démonstration",
    notebook: "Carnet de voyage",
    notebookText: "Essayez les interactions ci-dessous. Rien n’est enregistré.",
    field: "Une idée de voyage",
    placeholder: "Par exemple, une promenade au coucher du soleil",
    showDialog: "Ouvrir le billet",
    dialogTitle: "Une idée à emporter",
    dialogText: "Ceci est un exemple fictif pour essayer l’interface.",
    close: "Fermer",
    showToast: "Afficher le message",
    toast: "Message de démonstration affiché.",
    loading: "Chargement de l’exemple…",
    emptyTitle: "Une page encore vide",
    emptyText: "Les idées de voyage trouveront leur place ici.",
    errorTitle: "Exemple d’erreur",
    errorText:
      "Une erreur est survenue dans cet exemple. Vous pouvez réessayer.",
    retry: "Réessayer",
    notFound: "Page introuvable",
    notFoundText:
      "Cette adresse ne correspond à aucune page de cette démonstration.",
    backHome: "Retour à l’accueil",
    skip: "Aller au contenu",
  },
} as const satisfies Record<Locale, Record<string, string>>;
export type { Locale };
export type MessageKey = keyof typeof messages.ro;
// Unsupported locales and missing translations fall back to Romanian; missing arguments remain visible.
export function t(
  locale: string,
  key: MessageKey,
  args: Record<string, string | number> = {},
): string {
  const catalog: Record<MessageKey, string> = Object.hasOwn(messages, locale)
    ? messages[locale as Locale]
    : messages.ro;
  return (catalog[key] ?? messages.ro[key] ?? key).replace(
    /\{([\w]+)\}/g,
    (match, name: string) =>
      Object.hasOwn(args, name) ? String(args[name]) : match,
  );
}
