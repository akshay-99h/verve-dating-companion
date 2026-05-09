import Link from "next/link";

export default function MarketingPage() {
  return (
    <main className="marketing-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">Verve</span>
          <h1>One prompt library. Native and web stay in sync.</h1>
          <p>
            The web app reads the same shared prompt content as the Expo app, so adding a new
            reply or opener is a single edit in the repo.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/login">
              Sign in
            </Link>
            <Link className="secondary-link" href="/signup">
              Create account
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-stat">
            <strong>Single source</strong>
            <span>`/data` and `/types.ts` stay canonical for both apps.</span>
          </div>
          <div className="hero-stat">
            <strong>PWA ready</strong>
            <span>Installable manifest, service worker, offline shell caching.</span>
          </div>
          <div className="hero-stat">
            <strong>AuthKit</strong>
            <span>Hosted sign-in flow via WorkOS on Next.js App Router.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
