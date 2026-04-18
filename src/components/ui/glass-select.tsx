"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface GlassSelectProps {
  id?: string;
  name: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  options: Option[];
  onChange?: (value: string) => void;
  required?: boolean;
  className?: string;
}

export default function GlassSelect({
  id,
  name,
  value: controlledValue,
  defaultValue = "",
  placeholder = "Select...",
  options,
  onChange,
  required,
  className = "",
}: GlassSelectProps) {
  const [open, setOpen]   = useState(false);
  const [val, setVal]     = useState(defaultValue);
  const ref               = useRef<HTMLDivElement>(null);

  const current = controlledValue !== undefined ? controlledValue : val;
  const selected = options.find((o) => o.value === current);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const choose = (v: string) => {
    setVal(v);
    onChange?.(v);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Hidden native input for form submission */}
      <input type="hidden" name={name} value={current} required={required} />

      {/* Trigger */}
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="w-full h-10 px-3.5 rounded-xl text-sm font-medium text-left
                   flex items-center justify-between gap-2
                   bg-foreground/6 border border-border
                   text-foreground hover:bg-foreground/9
                   focus:outline-none focus:ring-1 focus:ring-ring
                   transition-all duration-150"
      >
        <span className={selected ? "text-foreground" : "text-foreground/35"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-foreground/40 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 top-[calc(100%+6px)] left-0 right-0
                     rounded-2xl overflow-hidden
                     border border-border
                     shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
          style={{
            background: "var(--popover)",
            backdropFilter: "blur(20px) saturate(1.8)",
            WebkitBackdropFilter: "blur(20px) saturate(1.8)",
          }}
        >
          <div className="max-h-56 overflow-y-auto py-1.5">
            {/* Empty / placeholder option */}
            {!required && (
              <button
                type="button"
                onClick={() => choose("")}
                className="w-full px-4 py-2.5 text-sm text-left flex items-center justify-between
                           text-foreground/40 hover:bg-foreground/6 transition-colors"
              >
                {placeholder}
                {current === "" && <Check className="w-3.5 h-3.5 text-foreground/40" />}
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => choose(opt.value)}
                className="w-full px-4 py-2.5 text-sm text-left flex items-center justify-between
                           text-foreground/85 hover:bg-foreground/6 transition-colors"
              >
                <span>{opt.label}</span>
                {current === opt.value && (
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--primary)" }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
