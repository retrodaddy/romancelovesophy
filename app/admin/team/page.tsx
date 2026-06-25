import { PageHeader } from "@/components/admin/ui";
import { TeamManager } from "@/components/admin/team-manager";
import { getTeamMembers } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { user } = await requireAdmin();
  const members = await getTeamMembers();
  return (
    <div className="max-w-2xl">
      <PageHeader title="Team logins" desc="Create or remove admin logins. Each person sets up their own 2FA." />
      <TeamManager members={members} meId={user.id} />
    </div>
  );
}
