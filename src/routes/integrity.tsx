import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Loader2, FileKey } from "lucide-react";
import { toast } from "sonner";
import { DropZone } from "@/components/drop-zone";
import { sha256Hex } from "@/lib/crypto";
import { formatBytes } from "@/lib/format";

export const Route = createFileRoute("/integrity")({
  head: () => ({
    meta: [
      { title: "Integrity Verification — StegaVault Pro" },
      { name: "description", content: "Compute SHA-256 checksums to verify file integrity." },
    ],
  }),
  component: IntegrityPage,
});

type Row = { name: string; size: number; sha256: string };

function IntegrityPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  async function onFiles(files: File[]) {
    setBusy(true);
    try {
      const results: Row[] = [];
      for (const f of files) {
        const bytes = new Uint8Array(await f.arrayBuffer());
        const hash = await sha256Hex(bytes);
        results.push({ name: f.name, size: f.size, sha256: hash });
      }
      setRows((prev) => [...results, ...prev].slice(0, 50));
      toast.success(`Hashed ${results.length} file${results.length > 1 ? "s" : ""}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Hashing failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-10 p-6 lg:p-10 max-w-[1400px] mx-auto space-y-6">
      <header>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-success">
          <ShieldCheck className="h-3.5 w-3.5" /> Verification
        </div>
        <h1 className="mt-2 font-display text-3xl lg:text-4xl font-bold">
          <span className="text-gradient-cyber">Integrity</span> Verification
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Drop one or more files to compute SHA-256 fingerprints locally. Use these to confirm
          recovered payloads match originals.
        </p>
      </header>

      <DropZone
        multiple
        onFiles={onFiles}
        title={busy ? "Hashing…" : "Drop files to hash"}
        hint="SHA-256 · runs entirely in your browser"
        icon={busy ? <Loader2 className="h-6 w-6 text-primary-foreground animate-spin" /> : <FileKey className="h-6 w-6 text-primary-foreground" />}
      />

      {rows.length > 0 && (
        <div className="glass rounded-2xl p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/60">
                <th className="py-2 px-3">File</th>
                <th className="py-2 px-3">Size</th>
                <th className="py-2 px-3">SHA-256</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-card/40">
                  <td className="py-3 px-3 font-medium truncate max-w-[16rem]">{r.name}</td>
                  <td className="py-3 px-3 font-mono text-muted-foreground">{formatBytes(r.size)}</td>
                  <td className="py-3 px-3 font-mono text-xs break-all text-cyber">{r.sha256}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
