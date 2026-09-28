"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const OPTIONS = [
  { key: "light", label: "Light", icon: "☀️" },
  { key: "dark", label: "Dark", icon: "🌙" },
  { key: "system", label: "System", icon: "💻" },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Hydration-safe mount detection (lint-clean alternative to setState-in-effect)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return <span className="inline-block h-8 w-20" aria-hidden="true" />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center rounded-full border border-border p-0.5"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          role="radio"
          aria-checked={theme === opt.key}
          title={`${opt.label} theme`}
          onClick={() => setTheme(opt.key)}
          className={`rounded-full px-2 py-1 text-xs transition ${
            theme === opt.key
              ? "bg-accent text-accent-foreground"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          <span aria-hidden="true">{opt.icon}</span>
          <span className="sr-only">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
