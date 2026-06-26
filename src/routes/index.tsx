import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Database,
  EyeOff,
  ScanLine,
  ShieldCheck,
  Zap,
  Lock,
  Sparkle,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { loadHistory, type HistoryEntry } from "@/lib/history";
import { formatBytes, relativeTime } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — StegaVault Pro" },
      {
        name: "description",
        content: "Operational dashboard for embedded payloads, extractions and security activity.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
    const onUpdate = () => setHistory(loadHistory());
    window.addEventListener("stegavault:history", onUpdate);
    return () => window.removeEventListener("stegavault:history", onUpdate);
  }, []);

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const hides = history.filter((h) => h.type === "hide");
    const extracts = history.filter((h) => h.type === "extract");
    return {
      total: history.length,
      today: history.filter((h) => h.timestamp >= today).length,
      embedded: hides.reduce((n, h) => n + h.secretSize, 0),
      recovered: extracts.reduce((n, h) => n + h.secretSize, 0),
      encryptedRate: history.length
        ? Math.round((history.filter((h) => h.encrypted).length / history.length) * 100)
        : 0,
    };
  }, [history]);

  return (
    <div className="relative z-10 p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto">
      {/* Hero */}
      <section className="glass rounded-3xl p-8 lg:p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-cyber)] opacity-10" />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold">
              <Sparkle className="h-3 w-3" /> Professional Edition
            </div>
            <h1 className="mt-4 font-display text-4xl lg:text-5xl font-bold leading-tight">
              <span className="text-gradient-cyber">Steganography</span>
              <br />
              <span className="text-foreground">crafted for </span>
              <span className="text-gradient-gold">professionals.</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl">
              Embed encrypted payloads inside lossless carriers. Recover them with cryptographic
              certainty. AES-256, PBKDF2 hardening, SHA-256 integrity — all in-browser.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/hide"
                className="group inline-flex items-center gap-2 rounded-xl bg-[var(--gradient-cyber)] px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] transition-transform"
              >
                <EyeOff className="h-4 w-4" /> Hide Data
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/extract"
                className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/5 px-5 py-3 text-sm font-semibold text-gold hover:bg-gold/10 transition-colors"
              >
                <ScanLine className="h-4 w-4" /> Extract Data
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-3 font-mono text-xs">
            <div className="rounded-lg border border-border bg-card/60 px-3 py-2 text-success">
              ✓ AES-256-GCM
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-3 py-2 text-cyber">
              ✓ PBKDF2 · 250k iterations
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-3 py-2 text-gold">
              ✓ SHA-256 integrity
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-3 py-2 text-primary">
              ✓ Zero server upload
            </div>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Operations"
          value={stats.total}
          hint="Lifetime processed"
          icon={<Activity className="h-5 w-5" />}
          accent="cyber"
        />
        <StatCard
          label="Today"
          value={stats.today}
          hint="Activity in last 24h"
          icon={<Zap className="h-5 w-5" />}
          accent="gold"
        />
        <StatCard
          label="Embedded"
          value={formatBytes(stats.embedded)}
          hint="Secret payload size"
          icon={<Database className="h-5 w-5" />}
          accent="success"
        />
        <StatCard
          label="Encrypted"
          value={`${stats.encryptedRate}%`}
          hint="Of all operations"
          icon={<ShieldCheck className="h-5 w-5" />}
          accent="cyber"
        />
      </section>

      {/* Recent activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Recent Activity</h2>
            <Link
              to="/history"
              className="text-xs uppercase tracking-wider text-primary hover:text-gold transition-colors"
            >
              View all →
            </Link>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Lock className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <div className="text-sm">No operations yet. Run your first one to get started.</div>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {history.slice(0, 6).map((h) => (
                <li key={h.id} className="py-3 flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-lg grid place-items-center ${
                      h.type === "hide"
                        ? "bg-primary/15 text-primary"
                        : "bg-gold/15 text-gold"
                    }`}
                  >
                    {h.type === "hide" ? <EyeOff className="h-4 w-4" /> : <ScanLine className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {h.type === "hide" ? "Embedded" : "Extracted"} · {h.carrierName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(h.secretSize)} · {h.encrypted ? "encrypted" : "plain"} ·{" "}
                      {relativeTime(h.timestamp)}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md ${
                      h.status === "success"
                        ? "bg-success/15 text-success"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {h.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Security Posture</h2>
          <div className="space-y-4">
            {[
              { label: "Encryption", value: "AES-256-GCM", color: "text-cyber" },
              { label: "KDF", value: "PBKDF2-SHA256", color: "text-primary" },
              { label: "Iterations", value: "250,000", color: "text-gold" },
              { label: "Carrier", value: "Lossless PNG", color: "text-success" },
              { label: "Integrity", value: "SHA-256", color: "text-cyber" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-mono ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-4">
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-wider font-semibold">
              <Sparkle className="h-3.5 w-3.5" /> Zero-trust runtime
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              All cryptography and steganography runs locally in your browser. Nothing is uploaded.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
