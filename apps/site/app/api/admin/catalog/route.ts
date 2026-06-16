import { adminProxy } from "@/lib/admin-proxy";

export async function GET(request: Request) {
  return adminProxy("/catalog", request);
}
