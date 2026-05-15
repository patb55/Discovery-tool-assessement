import { useEffect, useRef } from "react";
import "@/vendor/liquid-glass/glass.css";

type Props = {
  label: string;
  onClick: () => void;
  variant?: "emerald" | "platinum";
};

/**
 * Liquid-glass CTA button — single instance per page recommended.
 * Brand-tinted via container.js parameters (charcoal base, emerald edge).
 * Falls back to a regular emerald button if WebGL2 is unavailable or
 * prefers-reduced-motion is set.
 */
export function GlassButton({ label, onClick, variant = "emerald" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasWebGL = (() => {
      try {
        return !!document.createElement("canvas").getContext("webgl2");
      } catch {
        return false;
      }
    })();

    if (reduced || !hasWebGL) return;

    let mounted = true;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        // @ts-expect-error vendored vanilla module, no types shipped
        const mod = await import("@/vendor/liquid-glass/button.js");
        if (!mounted) return;
        const ButtonCtor = mod.Button || mod.default;
        const instance = new ButtonCtor({
          text: label,
          size: 18,
          type: "rounded",
          tint: variant === "emerald" ? "#0E7A55" : "#E5E4E2",
          edgeIntensity: 0.6,
          rimIntensity: 0.45,
          baseIntensity: 0.3,
          onClick,
        });
        host.appendChild(instance.element);
        if (fallbackRef.current) fallbackRef.current.style.display = "none";
        cleanup = () => instance.element.remove();
      } catch {
        // silently fall back to the static button
      }
    })();

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, [label, onClick, variant]);

  return (
    <div className="inline-block relative">
      <div ref={hostRef} />
      <button
        ref={fallbackRef}
        onClick={onClick}
        className={
          variant === "emerald"
            ? "px-8 py-4 rounded-md bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition"
            : "px-8 py-4 rounded-md border border-foreground/20 text-foreground font-semibold hover:bg-foreground/5 transition"
        }
      >
        {label}
      </button>
    </div>
  );
}
