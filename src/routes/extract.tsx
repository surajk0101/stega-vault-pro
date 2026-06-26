import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScanLine, FileImage, Loader2, Download, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { DropZone } from "@/components/drop-zone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { decryptPayload, sha256Hex } from "@/lib/crypto";
import { extractPayload } from "@/lib/stego";
import { formatBytes } from "@/lib/format";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/extract")({
  head: () => ({
    meta: [
      { title: "Extract Data — StegaVault Pro" },
      { name: "description", content: "Recover and decrypt payloads from stego images." },
    ],
  }),
  component: ExtractPage,
});

function ExtractPage() {
  const [stego, setStego] = useState<File | null>(null);
  const [encrypted, setEncrypted] = useState(true);
  const [password, setPassword] = useState("");
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; size: number; checksum: string } | null>(null);

  async function run() {
    if (!stego) {
      toast.error("Drop a stego image to extract.");
      return;
    }
    setWorking(true);
    setProgress(15);
    setResult(null);
    try {
      const raw = await extractPayload(stego);
      setProgress(50);
      const plain = encrypted ? await decryptPayload(raw, password) : raw;
      setProgress(80);
      const checksum = await sha256Hex(plain);
      const blob = new Blob([new Uint8Array(plain)]);
      setResult({ blob, size: plain.length, checksum });
      addHistory({
        type: "extract",
        carrierName: stego.name,
        secretSize: plain.length,
        encrypted,
        checksum,
        status: "success",
      });
      toast.success("Payload recovered.");
      setProgress(100);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(msg);
      addHistory({
        type: "extract",
        carrierName: stego.name,
        secretSize: 0,
        encrypted,
        status: "error",
        message: msg,
      });
    } finally {
      setTimeout(() => {
        setWorking(false);
        setProgress(0);
      }, 600);
    }
  }

  function download() {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovered.bin";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="relative z-10 p-6 lg:p-10 max-w-[1400px] mx-auto space-y-6">
      <header className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
          <ScanLine className="h-3.5 w-3.5" /> Recover Operation
        </div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold">
          <span className="text-gradient-gold">Extract</span> a payload from a stego image
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Drop a previously-embedded image. If it was encrypted, provide the password used during
          embedding.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <FileImage className="h-4 w-4 text-cyber" /> Stego Image
          </h2>
          {!stego ? (
            <DropZone
              accept="image/png,image/bmp,image/x-ms-bmp"
              onFiles={(f) => setStego(f[0])}
              title="Drop stego image"
              hint="PNG produced by StegaVault"
              icon={<FileImage className="h-6 w-6 text-primary-foreground" />}
            />
          ) : (
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden border border-border bg-card grid place-items-center">
                <img src={URL.createObjectURL(stego)} alt="stego preview" className="max-h-full max-w-full" />
              </div>
              <div className="font-mono text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>Name</span><span className="text-foreground truncate ml-3">{stego.name}</span></div>
                <div className="flex justify-between"><span>Size</span><span className="text-foreground">{formatBytes(stego.size)}</span></div>
              </div>
              <button
                onClick={() => setStego(null)}
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" /> Decryption
          </h2>

          <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-4">
            <div>
              <div className="font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Payload is encrypted
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Toggle off if you embedded without encryption.
              </div>
            </div>
            <Switch checked={encrypted} onCheckedChange={setEncrypted} />
          </div>

          {encrypted && (
            <div className="space-y-2">
              <Label htmlFor="pw" className="text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                id="pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter decryption password"
                className="font-mono bg-card/40"
              />
            </div>
          )}

          {result && (
            <div className="rounded-xl border border-success/40 bg-success/10 p-4 space-y-2">
              <div className="text-success text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Payload recovered
              </div>
              <div className="font-mono text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>Size</span><span className="text-foreground">{formatBytes(result.size)}</span></div>
                <div className="flex flex-col">
                  <span>SHA-256</span>
                  <span className="text-foreground break-all">{result.checksum}</span>
                </div>
              </div>
              <button
                onClick={download}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--gradient-gold)] px-4 py-2 text-sm font-semibold text-gold-foreground hover:scale-[1.02] transition-transform"
              >
                <Download className="h-4 w-4" /> Download recovered file
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 glass rounded-2xl p-6">
        <button
          onClick={run}
          disabled={working || !stego}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--gradient-cyber)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {working ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Extracting…
            </>
          ) : (
            <>
              <ScanLine className="h-4 w-4" /> Extract Payload
            </>
          )}
        </button>
      </div>

      {working && <Progress value={progress} className="h-1" />}
    </div>
  );
}
