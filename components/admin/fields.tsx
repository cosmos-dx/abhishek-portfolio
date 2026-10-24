"use client";
import { useState } from "react";

const box = "mt-1 w-full border border-line bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";
const btn = "label border border-line px-2 py-1 hover:border-accent hover:text-accent disabled:opacity-30";

export function Text({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <label className="block">
      <span className="label text-muted">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={box} />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Area({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="label text-muted">{label}</span>
      <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className={box} />
    </label>
  );
}

export function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#f06428]" />
      <span className="label">{label}</span>
    </label>
  );
}

export function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <label className="block">
      <span className="label text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className={box}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 border border-line bg-[#faf9f5] p-4">
      {title && <legend className="label bg-bg px-2 text-accent">{title}</legend>}
      {children}
    </fieldset>
  );
}

export function Strings({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <span className="label text-muted">{label}</span>
      <div className="space-y-2">
        {value.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input aria-label={`${label} ${i + 1}`} value={s} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} className={box + " !mt-0"} />
            <button type="button" aria-label={`Remove ${label} ${i + 1}`} onClick={() => onChange(value.filter((_, j) => j !== i))} className={btn}>
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...value, ""])} className={btn}>
          + Add
        </button>
      </div>
    </div>
  );
}

/** URL text box plus a file picker that uploads and fills in the returned /uploads/... URL. */
export function Upload({ label, value, onChange, kind = "image", hint }: { label: string; value: string; onChange: (v: string) => void; kind?: "image" | "pdf"; hint?: string }) {
  const [state, setState] = useState("");
  async function pick(file?: File) {
    if (!file) return;
    setState("Uploading…");
    const body = new FormData();
    body.set("file", file);
    body.set("kind", kind);
    try {
      const res = await fetch("/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
      setState("Uploaded. Save to publish.");
    } catch (e) {
      setState(e instanceof Error ? e.message : "Upload failed");
    }
  }
  return (
    <div>
      <Text label={label} value={value} onChange={onChange} hint={hint} />
      <div className="mt-2 flex items-center gap-3">
        <input
          type="file"
          accept={kind === "pdf" ? "application/pdf" : "image/jpeg,image/png,image/webp,image/avif"}
          aria-label={`Upload ${label}`}
          onChange={(e) => pick(e.target.files?.[0])}
          className="text-xs file:mr-3 file:border file:border-line file:bg-white file:px-3 file:py-1.5 file:text-xs"
        />
        <span role="status" className="text-xs text-muted">{state}</span>
      </div>
    </div>
  );
}

export function Repeater<T>({
  label,
  items,
  onChange,
  make,
  title,
  render,
}: {
  label: string;
  items: T[];
  onChange: (v: T[]) => void;
  make: () => T;
  title: (item: T, i: number) => string;
  render: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-4">
      <div className="label text-muted">{label}</div>
      {items.map((item, i) => (
        <Group key={i} title={`${i + 1}. ${title(item, i) || "Untitled"}`}>
          {render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))))}
          <div className="flex gap-2 border-t border-line pt-3">
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className={btn}>↑ Up</button>
            <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} className={btn}>↓ Down</button>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className={btn}>Remove</button>
          </div>
        </Group>
      ))}
      <button type="button" onClick={() => onChange([...items, make()])} className={btn}>
        + Add {label.toLowerCase()}
      </button>
    </div>
  );
}
