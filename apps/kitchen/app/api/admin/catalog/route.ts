import { adminProxy } from "@/lib/admin-proxy";

export async function GET() {
  return adminProxy("/catalog");
}
