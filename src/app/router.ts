export type Route = "home" | "explore" | "preferences" | "tripCreation" | "placeResolution" | "generation" | "itineraryDemo" | "notFound";
export function resolveRoute(pathname: string): Route {
  if (pathname === "/itinerary-demo" || pathname === "/itinerary-demo/") return "itineraryDemo";
  if (pathname === "/generation" || pathname === "/generation/") return "generation";
  if (pathname === "/place-resolution" || pathname === "/place-resolution/") return "placeResolution";
  if (pathname === "/") return "home";
  if (pathname === "/explore" || pathname === "/explore/") return "explore";
  if (pathname === "/trip-creation" || pathname === "/trip-creation/") return "tripCreation";
  if (pathname === "/preferences" || pathname === "/preferences/") return "preferences";
  return "notFound";
}
