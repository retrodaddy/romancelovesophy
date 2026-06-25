import { PageHeader } from "@/components/admin/ui";
import { MfaSetup } from "@/components/admin/mfa-setup";
import { AccountSettings } from "@/components/admin/account-settings";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const { user } = await requireAdmin();
  return (
    <div className="max-w-2xl">
      <PageHeader title="Security & account" desc="Two-factor authentication and your login details." />
      <MfaSetup />
      <AccountSettings currentEmail={user.email || ""} />
    </div>
  );
}
