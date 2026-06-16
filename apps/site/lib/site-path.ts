export type SiteSection = "customer" | "kitchen" | "admin" | "site";

export interface ParsedSitePath {
  section: SiteSection;
  staffPath?: string;
}

export function getStaffPathPrefix(): string {
  return (
    process.env.NEXT_PUBLIC_STAFF_PATH ??
    process.env.NEXT_PUBLIC_KITCHEN_STORE_ID ??
    "staff"
  );
}

export function staffHref(
  section: "kitchen" | "admin",
  staffPath = getStaffPathPrefix(),
): string {
  return `/${staffPath}/${section}`;
}

export function parseSitePath(pathname: string): ParsedSitePath {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "store") {
    return { section: "customer" };
  }

  if (segments.length >= 2) {
    const [staffPath, section] = segments;

    if (section === "kitchen") {
      return { section: "kitchen", staffPath };
    }

    if (section === "admin") {
      return { section: "admin", staffPath };
    }
  }

  return { section: "site" };
}

export function isAdminPath(pathname: string): boolean {
  return parseSitePath(pathname).section === "admin";
}

export function isKitchenPath(pathname: string): boolean {
  return parseSitePath(pathname).section === "kitchen";
}

export function isStaffPath(pathname: string): boolean {
  const { section } = parseSitePath(pathname);
  return section === "kitchen" || section === "admin";
}

export function isCustomerPath(pathname: string): boolean {
  return parseSitePath(pathname).section === "customer";
}
