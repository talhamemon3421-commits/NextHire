export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "nexthire_theme";

function prefersDark(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getStoredTheme(): ThemeMode {
  const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
}

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return prefersDark() ? "dark" : "light";
  return mode;
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(mode);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
}

export function setTheme(mode: ThemeMode) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }
  applyTheme(mode);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nexthire:theme", { detail: { mode } }));
  }
}

export function initTheme() {
  const mode = getStoredTheme();
  applyTheme(mode);

  // React to OS theme changes when in "system"
  if (typeof window === "undefined" || !window.matchMedia) return;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => {
    if (getStoredTheme() === "system") applyTheme("system");
  };

  if ("addEventListener" in media) media.addEventListener("change", handler);
  else media.addListener(handler);
}

