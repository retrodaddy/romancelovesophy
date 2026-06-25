import { PageHeader } from "@/components/admin/ui";
import { MfaSetup } from "@/components/admin/mfa-setup";

export const dynamic = "force-dynamic";

export default function SecurityPage() {
  return (
    <div>
      <PageHeader title="Security" desc="Two-factor authentication for your admin login." />
      <MfaSetup />
    </div>
  );
}
