import { redirect } from "next/navigation";
import { getStaffPathPrefix, staffHref } from "@/lib/staff-path";

export default function Home() {
  redirect(staffHref("kitchen", getStaffPathPrefix()));
}
