import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, KeyRound, Database, Sparkle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — StegaVault Pro" },
      { name: "description", content: "Configure encryption, defaults, and logging." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="relative z-10 p-6 lg:p-10 max-w-[1100px] mx-auto space-y-6">
      <header>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
          <SettingsIcon className="h-3.5 w-3.5" /> Preferences
        </div>
        <h1 className="mt-2 font-display text-3xl lg:text-4xl font-bold">
          <span className="text-gradient-cyber">Settings</span>
        </h1>
      </header>

      <Section title="Cryptography" icon={<KeyRound className="h-4 w-4 text-primary" />}>
        <Row label="Encryption algorithm" value="AES-256-GCM" locked />
        <Row label="Key derivation" value="PBKDF2-HMAC-SHA256" locked />
        <Row label="Iterations" value="250,000" locked />
        <Row label="Random IV per operation" value="Enabled" locked />
      </Section>

      <Section title="Defaults" icon={<Sparkle className="h-4 w-4 text-gold" />}>
        <Toggle label="Encrypt payloads by default" defaultOn />
        <Toggle label="Compute SHA-256 checksum" defaultOn />
        <Toggle label="Auto-download stego output" defaultOn />
      </Section>

      <Section title="Storage" icon={<Database className="h-4 w-4 text-cyber" />}>
        <Row label="History persistence" value="Local browser storage" />
        <Row label="Server uploads" value="None — all processing is local" />
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
        {icon} {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value, locked }: { label: string; value: string; locked?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 last:border-0 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm ${locked ? "text-gold" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 last:border-0 py-2">
      <span className="text-sm">{label}</span>
      <Switch defaultChecked={defaultOn} />
    </div>
  );
}
