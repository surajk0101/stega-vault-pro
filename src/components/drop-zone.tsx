import { useCallback, useState, type DragEvent, type ReactNode } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  title?: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
};

export function DropZone({
  accept,
  multiple,
  onFiles,
  title = "Drop files here",
  hint = "or click to browse",
  icon,
  className,
}: Props) {
  const [over, setOver] = useState(false);

  const onDrop = useCallback(
    (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setOver(false);
      const files = Array.from(e.dataTransfer.files ?? []);
      if (files.length) onFiles(multiple ? files : [files[0]]);
    },
    [multiple, onFiles],
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all",
        "border-border bg-card/40 hover:border-primary/60 hover:bg-card/60",
        over && "border-primary bg-primary/10 shadow-[var(--shadow-glow)] scale-[1.01]",
        className,
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.currentTarget.value = "";
        }}
      />
      <div className="rounded-full bg-[var(--gradient-cyber)] p-3 shadow-[var(--shadow-glow)] group-hover:scale-110 transition-transform">
        {icon ?? <UploadCloud className="h-6 w-6 text-primary-foreground" />}
      </div>
      <div className="text-center">
        <div className="font-display font-semibold text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground mt-1">{hint}</div>
      </div>
    </label>
  );
}
