export type Route = "home" | "explore" | "preferences" | "notFound";
export function resolveRoute(pathname: string): Route {
  if (pathname === "/") return "home";
  if (pathname === "/explore" || pathname === "/explore/") return "explore";
  if (pathname === "/preferences" || pathname === "/preferences/") return "preferences";
  return "notFound";
}
