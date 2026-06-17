export function getStaffPathPrefix(): string {
  const configured = process.env.NEXT_PUBLIC_STAFF_PATH?.trim();
  return configured && configured.length > 0 ? configured : "staff";
}

export function staffHref(staffPath = getStaffPathPrefix()): string {
  return `/${staffPath}`;
}

export function staffLoginHref(staffPath = getStaffPathPrefix()): string {
  return `/${staffPath}/login`;
}

export function parseWaiterPath(pathname: string): {
  section: "board" | "login" | "home";
  staffPath?: string;
} {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length >= 2) {
    const [staffPath, section] = segments;

    if (section === "login") {
      return { section: "login", staffPath };
    }
  }

  if (segments.length === 1) {
    return { section: "board", staffPath: segments[0] };
  }

  return { section: "home" };
}

export function isConfiguredStaffPath(path: string): boolean {
  return path === getStaffPathPrefix();
}

