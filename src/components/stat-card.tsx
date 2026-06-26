import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: "cyber" | "gold" | "success" | "default";
  className?: string;
};

const accentMap: Record<NonNullable<Props["accent"]>, string> = {
  cyber: "from-primary/20 to-accent/10 text-primary",
  gold: "from-gold/20 to-gold/5 text-gold",
  success: "from-success/20 to-success/5 text-success",
  default: "from-muted/40 to-muted/10 text-foreground",
};

export function StatCard({ label, value, hint, icon, accent = "cyber", className }: Props) {
  return (
    <div
      className={cn(
        "glass relative overflow-hidden rounded-2xl p-5 group hover:shadow-[var(--shadow-elevated)] transition-all",
        className,
      )}
    >
      <div
        className={cn(
          "absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition-opacity group-hover:opacity-70",
          accentMap[accent],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            {label}
          </div>
          <div className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            {value}
          </div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {icon && (
          <div
            className={cn(
              "rounded-xl p-2.5 bg-gradient-to-br border border-border/40",
              accentMap[accent],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
