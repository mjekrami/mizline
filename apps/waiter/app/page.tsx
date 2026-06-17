import { redirect } from "next/navigation";
import { getStaffPathPrefix } from "@/lib/waiter-path";

export default function Home() {
  redirect(`/${getStaffPathPrefix()}`);
}
