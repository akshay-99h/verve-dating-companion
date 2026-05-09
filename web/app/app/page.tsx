import { signOut, withAuth } from "@workos-inc/authkit-nextjs";

import { PromptDashboard } from "../../components/prompt-dashboard";

export default async function AppPage() {
  const { user } = await withAuth({ ensureSignedIn: true });

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="section-kicker">Authenticated workspace</p>
          <h1>Verve</h1>
          <p className="section-subtle">
            Signed in as {user.email}. Prompt content is loaded from the shared repo modules.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button className="logout-button" type="submit">
            Sign out
          </button>
        </form>
      </header>

      <PromptDashboard
        userName={user.firstName ?? user.email.split("@")[0] ?? "there"}
        userEmail={user.email}
      />
    </main>
  );
}
