export type Route = "home" | "explore" | "notFound";
export function resolveRoute(pathname: string): Route {
  if (pathname === "/") return "home";
  if (pathname === "/explore" || pathname === "/explore/") return "explore";
  return "notFound";
}
