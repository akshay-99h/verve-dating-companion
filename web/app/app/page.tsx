import { withAuth } from "@workos-inc/authkit-nextjs";

import { PromptDashboard } from "../../components/prompt-dashboard";

export default async function AppPage() {
  const { user } = await withAuth({ ensureSignedIn: true });

  return (
    <main className="app-shell app-shell--dashboard">
      <PromptDashboard
        userName={user.firstName ?? user.email.split("@")[0] ?? "there"}
        userEmail={user.email}
      />
    </main>
  );
}
