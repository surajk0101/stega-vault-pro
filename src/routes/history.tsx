import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EyeOff, ScanLine, History as HistoryIcon, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { clearHistory, exportCsv, loadHistory, type HistoryEntry } from "@/lib/history";
import { formatBytes, relativeTime } from "@/lib/format";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — StegaVault Pro" },
      { name: "description", content: "Log of past embed and extract operations." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(loadHistory());
    const onUpdate = () => setEntries(loadHistory());
    window.addEventListener("stegavault:history", onUpdate);
    return () => window.removeEventListener("stegavault:history", onUpdate);
  }, []);

  function onExport() {
    const csv = exportCsv(entries);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stegavault-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("History exported.");
  }

  function onClear() {
    clearHistory();
    toast.success("History cleared.");
  }

  return (
    <div className="relative z-10 p-6 lg:p-10 max-w-[1400px] mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-cyber">
            <HistoryIcon className="h-3.5 w-3.5" /> Operations Log
          </div>
          <h1 className="mt-2 font-display text-3xl lg:text-4xl font-bold">
            <span className="text-gradient-cyber">History</span>
          </h1>
          <p className="mt-1 text-muted-foreground">Stored locally in your browser.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            disabled={entries.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2 text-sm font-medium hover:bg-card disabled:opacity-40"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={onClear}
            disabled={entries.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center text-muted-foreground">
          <HistoryIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
          No operations yet.
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/60">
                <th className="py-3 px-4">When</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Payload</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Encrypted</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-border/30 hover:bg-card/40">
                  <td className="py-3 px-4 text-muted-foreground">{relativeTime(e.timestamp)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${
                        e.type === "hide"
                          ? "bg-primary/15 text-primary"
                          : "bg-gold/15 text-gold"
                      }`}
                    >
                      {e.type === "hide" ? <EyeOff className="h-3 w-3" /> : <ScanLine className="h-3 w-3" />}
                      {e.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 truncate max-w-[14rem]">{e.carrierName}</td>
                  <td className="py-3 px-4 truncate max-w-[14rem] text-muted-foreground">{e.secretName ?? "—"}</td>
                  <td className="py-3 px-4 font-mono">{formatBytes(e.secretSize)}</td>
                  <td className="py-3 px-4">
                    {e.encrypted ? (
                      <span className="text-success">AES-256</span>
                    ) : (
                      <span className="text-muted-foreground">no</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md ${
                        e.status === "success"
                          ? "bg-success/15 text-success"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
