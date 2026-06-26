import { createFileRoute } from "@tanstack/react-router";
import { Info, ShieldCheck, Code2, BookOpen, Lock } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — StegaVault Pro" },
      { name: "description", content: "About the StegaVault Pro steganography suite." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="relative z-10 p-6 lg:p-10 max-w-[1100px] mx-auto space-y-6">
      <header>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
          <Info className="h-3.5 w-3.5" /> About
        </div>
        <h1 className="mt-2 font-display text-3xl lg:text-4xl font-bold">
          <span className="text-gradient-gold">StegaVault</span>{" "}
          <span className="text-gradient-cyber">Pro</span>
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          A professional-grade steganography suite for cybersecurity, digital forensics,
          researchers, and secure archival use.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card icon={<ShieldCheck className="h-5 w-5 text-success" />} title="Hardened Cryptography">
          AES-256-GCM, PBKDF2-SHA256 with 250,000 iterations, random salts and IVs, and SHA-256
          integrity tags for every payload.
        </Card>
        <Card icon={<Lock className="h-5 w-5 text-primary" />} title="Local-only Processing">
          Carriers and secrets never leave your device. All cryptography and steganography runs in
          your browser via WebCrypto and Canvas APIs.
        </Card>
        <Card icon={<Code2 className="h-5 w-5 text-cyber" />} title="LSB Embedding">
          Least-significant-bit embedding across the RGB channels of lossless carriers (PNG/BMP)
          with a magic-tagged header for clean extraction.
        </Card>
        <Card icon={<BookOpen className="h-5 w-5 text-gold" />} title="For Legitimate Use">
          Intended for authorized red-team exercises, forensic case work, academic research, and
          private archival. Respect the laws and policies of your jurisdiction.
        </Card>
      </div>

      <div className="glass rounded-2xl p-6 font-mono text-xs text-muted-foreground space-y-1">
        <div>Version 1.0.0 · Web Edition</div>
        <div>Built with React 19 · TanStack Router · WebCrypto · Tailwind 4</div>
        <div className="text-gold">© StegaVault — Educational & professional use.</div>
      </div>
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6 hover:shadow-[var(--shadow-elevated)] transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h2 className="font-display font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
