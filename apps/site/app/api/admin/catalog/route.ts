import { adminProxy } from "@/lib/api/proxy";

export async function GET(request: Request) {
  return adminProxy("/catalog", request);
}
