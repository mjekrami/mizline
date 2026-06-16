export type SiteSection =
  | "kitchen"
  | "admin"
  | "waiter"
  | "login"
  | "site";

export type StaffSection = "kitchen" | "admin" | "waiter";

export interface ParsedSitePath {
  section: SiteSection;
  staffPath?: string;
}

export function getStaffPathPrefix(): string {
  const configured = process.env.NEXT_PUBLIC_STAFF_PATH?.trim();
  return configured && configured.length > 0 ? configured : "staff";
}

export function staffHref(
  section: StaffSection,
  staffPath = getStaffPathPrefix(),
): string {
  return `/${staffPath}/${section}`;
}

export function isStaffSection(section: SiteSection): section is StaffSection {
  return section === "kitchen" || section === "admin" || section === "waiter";
}

export function parseSitePath(pathname: string): ParsedSitePath {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length >= 2) {
    const [staffPath, section] = segments;

    if (section === "kitchen") {
      return { section: "kitchen", staffPath };
    }

    if (section === "admin") {
      return { section: "admin", staffPath };
    }

    if (section === "waiter") {
      return { section: "waiter", staffPath };
    }

    if (section === "login") {
      return { section: "login", staffPath };
    }
  }

  return { section: "site" };
}
