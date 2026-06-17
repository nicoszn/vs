import Link from "next/link";

export default function Check() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="display text-2xl" style={{ color: "var(--gold)" }}>A.a</span>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn btn-ghost">Sign in</Link>
          <Link href="/auth/register" className="btn btn-primary">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        <div className="animate-in">
          <p className="badge badge-gold mb-6">3-day investment cycles</p>
        </div>
        <h1 className="display animate-in delay-1"
          style={{ fontSize: "clamp(48px, 8vw, 96px)", lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 300 }}>
          Grow your wealth<br />
          <em style={{ color: "var(--gold)" }}>with precision.</em>
        </h1>
        <p className="animate-in delay-2 mt-8 max-w-md"
          style={{ color: "var(--text-dim)", fontSize: "16px", lineHeight: 1.7 }}>
          Three carefully structured investment plans. Fixed durations. Guaranteed returns.
          Your capital, compounding in days — not years.
        </p>
        <div className="animate-in delay-3 flex items-center gap-4 mt-10">
          <Link href="/auth/register" className="btn btn-primary" style={{ fontSize: "15px", padding: "12px 28px" }}>
            Start investing →
          </Link>
          <Link href="/auth/login" className="btn btn-outline">
            Sign in
          </Link>
        </div>

        {/* Plan preview cards */}
        <div className="animate-in delay-4 grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 w-full max-w-3xl">
          {[
            { name: "Starter", rate: "30%", range: "$1", return: "$1.30", tier: "I" },
            { name: "Growth",  rate: "50%", range: "$1 – $2", return: "up to $3.00", tier: "II", featured: true },
            { name: "Elite",   rate: "70%", range: "$1 – $3", return: "up to $5.10", tier: "III" },
          ].map((plan) => (
            <div
              key={plan.name}
              className="card p-6 text-left"
              style={plan.featured ? {
                border: "1px solid var(--gold)",
                boxShadow: "0 0 0 1px var(--gold-dim), inset 0 0 40px rgba(201,168,76,0.04)",
              } : {}}
            >
              {plan.featured && (
                <div className="badge badge-gold mb-3">Most popular</div>
              )}
              <div className="display mb-1" style={{ fontSize: "13px", color: "var(--text-dim)" }}>
                Plan {plan.tier}
              </div>
              <div className="display mb-4" style={{ fontSize: "28px" }}>{plan.name}</div>
              <div style={{ color: "var(--gold)", fontSize: "32px", fontFamily: "var(--font-display)", fontWeight: 300 }}>
                {plan.rate}
              </div>
              <div style={{ color: "var(--text-dim)", fontSize: "12px" }}>interest in 3 days</div>
              <hr className="divider my-4" />
              <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>Range: {plan.range}</div>
              <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>Returns: <span style={{ color: "var(--green)" }}>{plan.return}</span></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-8 py-6 text-center" style={{ color: "var(--text-ghost)", fontSize: "12px", borderTop: "1px solid var(--border)" }}>
        © {new Date().getFullYear()} A.a — All investments subject to platform terms.
      </footer>
    </main>
  );
}
