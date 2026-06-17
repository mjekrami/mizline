import { redirect } from "next/navigation";
import { canAccessWaiter } from "@mizline/shared";
import { getServerAuthUser } from "./server";
export async function redirectIfUnauthorizedWaiter(staffPath: string): Promise<void> {
  const user = await getServerAuthUser();
  if (!user) {
    return;
  }

  if (canAccessWaiter(user.role)) {
    return;
  }

  redirect(`/${staffPath}/login`);
}
