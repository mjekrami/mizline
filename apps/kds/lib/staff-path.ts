export type StaffRouteSection = "kitchen" | "admin" | "login" | "root";

export type StaffSection = "kitchen" | "admin";

export interface ParsedStaffPath {
  section: StaffRouteSection;
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

export function isStaffSection(
  section: StaffRouteSection,
): section is StaffSection {
  return section === "kitchen" || section === "admin";
}

export function parseStaffPath(pathname: string): ParsedStaffPath {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length >= 2) {
    const [staffPath, section] = segments;

    if (section === "kitchen") {
      return { section: "kitchen", staffPath };
    }

    if (section === "admin") {
      return { section: "admin", staffPath };
    }

    if (section === "login") {
      return { section: "login", staffPath };
    }
  }

  return { section: "root" };
}
