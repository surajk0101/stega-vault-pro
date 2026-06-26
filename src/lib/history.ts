export type HistoryEntry = {
  id: string;
  type: "hide" | "extract";
  timestamp: number;
  carrierName: string;
  secretName?: string;
  secretSize: number;
  encrypted: boolean;
  checksum?: string;
  status: "success" | "error";
  message?: string;
};

const KEY = "stegavault.history.v1";

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  const all = [full, ...loadHistory()].slice(0, 200);
  window.localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("stegavault:history"));
  return full;
}

export function clearHistory(): void {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("stegavault:history"));
}

export function exportCsv(entries: HistoryEntry[]): string {
  const head = "id,timestamp,type,carrier,secret,size,encrypted,status,checksum,message";
  const rows = entries.map((e) =>
    [
      e.id,
      new Date(e.timestamp).toISOString(),
      e.type,
      JSON.stringify(e.carrierName),
      JSON.stringify(e.secretName ?? ""),
      e.secretSize,
      e.encrypted,
      e.status,
      e.checksum ?? "",
      JSON.stringify(e.message ?? ""),
    ].join(","),
  );
  return [head, ...rows].join("\n");
}
