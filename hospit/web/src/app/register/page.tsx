import { dbConfigured } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import RegisterForm from "@/components/account/RegisterForm";

export const dynamic = "force-dynamic";

export default async function Page() {
  const u = await getSessionUser();
  return <RegisterForm me={u && { email: u.email, full_name: u.full_name, role: u.role }} disabled={!dbConfigured()} />;
}
