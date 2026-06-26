import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EyeOff, FileImage, FileKey, Lock, Sparkle, Loader2, Download, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { DropZone } from "@/components/drop-zone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { encryptPayload, passwordStrength, sha256Hex } from "@/lib/crypto";
import { capacityBytes, embedPayload, getCarrierInfo } from "@/lib/stego";
import { formatBytes } from "@/lib/format";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/hide")({
  head: () => ({
    meta: [
      { title: "Hide Data — StegaVault Pro" },
      { name: "description", content: "Embed encrypted payloads into PNG carriers." },
    ],
  }),
  component: HidePage,
});

function HidePage() {
  const [carrier, setCarrier] = useState<File | null>(null);
  const [carrierInfo, setCarrierInfo] = useState<{ width: number; height: number; capacity: number } | null>(null);
  const [secret, setSecret] = useState<File | null>(null);
  const [encrypt, setEncrypt] = useState(true);
  const [password, setPassword] = useState("");
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!carrier) {
      setCarrierInfo(null);
      return;
    }
    getCarrierInfo(carrier)
      .then(setCarrierInfo)
      .catch((e) => toast.error(e.message));
  }, [carrier]);

  const pwStrength = useMemo(() => passwordStrength(password), [password]);

  const fits = carrierInfo && secret
    ? (encrypt ? secret.size + 64 : secret.size) <= carrierInfo.capacity
    : true;

  async function run() {
    if (!carrier || !secret) {
      toast.error("Select both a carrier image and a secret file.");
      return;
    }
    if (encrypt && password.length < 8) {
      toast.error("Use a password of at least 8 characters.");
      return;
    }
    if (!fits) {
      toast.error("Secret exceeds carrier capacity.");
      return;
    }

    setWorking(true);
    setProgress(10);
    try {
      const secretBytes = new Uint8Array(await secret.arrayBuffer());
      setProgress(30);
      const payload = encrypt
        ? await encryptPayload(secretBytes, password)
        : secretBytes;
      setProgress(55);
      const checksum = await sha256Hex(payload);
      setProgress(70);
      const blob = await embedPayload(carrier, payload);
      setProgress(95);

      const baseName = carrier.name.replace(/\.[^.]+$/, "");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}.stego.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      addHistory({
        type: "hide",
        carrierName: carrier.name,
        secretName: secret.name,
        secretSize: secret.size,
        encrypted: encrypt,
        checksum,
        status: "success",
      });

      toast.success("Payload embedded and downloaded.");
      setProgress(100);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(msg);
      addHistory({
        type: "hide",
        carrierName: carrier?.name ?? "unknown",
        secretName: secret?.name,
        secretSize: secret?.size ?? 0,
        encrypted: encrypt,
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

  return (
    <div className="relative z-10 p-6 lg:p-10 max-w-[1400px] mx-auto space-y-6">
      <header className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
          <EyeOff className="h-3.5 w-3.5" /> Embed Operation
        </div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold">
          <span className="text-gradient-cyber">Hide</span> a payload inside a carrier
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Drop a lossless image (PNG/BMP) and the secret file you want to embed. AES-256 encryption
          and SHA-256 integrity are applied locally before LSB embedding.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carrier */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <FileImage className="h-4 w-4 text-cyber" /> Carrier Image
          </h2>
          {!carrier ? (
            <DropZone
              accept="image/png,image/bmp,image/x-ms-bmp"
              onFiles={(f) => setCarrier(f[0])}
              title="Drop carrier (PNG / BMP)"
              hint="Lossless formats only"
              icon={<FileImage className="h-6 w-6 text-primary-foreground" />}
            />
          ) : (
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden border border-border bg-card grid place-items-center">
                <img
                  src={URL.createObjectURL(carrier)}
                  alt="carrier preview"
                  className="max-h-full max-w-full"
                />
              </div>
              <div className="space-y-1 font-mono text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Name</span><span className="text-foreground truncate ml-3">{carrier.name}</span></div>
                <div className="flex justify-between"><span>Size</span><span className="text-foreground">{formatBytes(carrier.size)}</span></div>
                {carrierInfo && (
                  <>
                    <div className="flex justify-between"><span>Dimensions</span><span className="text-foreground">{carrierInfo.width} × {carrierInfo.height}</span></div>
                    <div className="flex justify-between"><span>Capacity</span><span className="text-cyber">{formatBytes(carrierInfo.capacity)}</span></div>
                  </>
                )}
              </div>
              <button
                onClick={() => setCarrier(null)}
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-destructive"
              >
                Remove carrier
              </button>
            </div>
          )}
        </div>

        {/* Secret */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <FileKey className="h-4 w-4 text-gold" /> Secret File
          </h2>
          {!secret ? (
            <DropZone
              onFiles={(f) => setSecret(f[0])}
              title="Drop secret file"
              hint="Any file type"
              icon={<FileKey className="h-6 w-6 text-primary-foreground" />}
            />
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-[var(--gradient-gold)] grid place-items-center text-gold-foreground">
                    <FileKey className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{secret.name}</div>
                    <div className="text-xs text-muted-foreground">{formatBytes(secret.size)}</div>
                  </div>
                </div>
              </div>
              {carrierInfo && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Capacity usage</span>
                    <span className={fits ? "text-success" : "text-destructive"}>
                      {Math.round((secret.size / carrierInfo.capacity) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (secret.size / carrierInfo.capacity) * 100)}
                    className="h-2"
                  />
                  {!fits && (
                    <div className="text-xs text-destructive">
                      Secret too large for this carrier. Use a higher-resolution image.
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setSecret(null)}
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-destructive"
              >
                Remove secret
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-success" /> Security Options
        </h2>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-4">
          <div>
            <div className="font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> AES-256 Encryption
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Encrypt payload with PBKDF2-derived key (250k iterations).
            </div>
          </div>
          <Switch checked={encrypt} onCheckedChange={setEncrypt} />
        </div>

        {encrypt && (
          <div className="space-y-2">
            <Label htmlFor="pw" className="text-xs uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters, mix of types"
              className="font-mono bg-card/40"
            />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(pwStrength.score / 5) * 100}%`,
                    background:
                      pwStrength.score >= 4
                        ? "var(--success)"
                        : pwStrength.score >= 2
                          ? "var(--gold)"
                          : "var(--destructive)",
                  }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground w-20 text-right">
                {pwStrength.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass rounded-2xl p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkle className="h-4 w-4 text-gold" />
          Output: <span className="font-mono text-foreground">{carrier?.name?.replace(/\.[^.]+$/, "") ?? "carrier"}.stego.png</span>
        </div>
        <button
          onClick={run}
          disabled={working || !carrier || !secret || !fits}
          className="group inline-flex items-center gap-2 rounded-xl bg-[var(--gradient-cyber)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {working ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Embedding…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> Embed & Download
            </>
          )}
        </button>
      </div>

      {working && <Progress value={progress} className="h-1" />}
    </div>
  );
}
