import { lazy, Suspense, useEffect, useState } from "react";

const ShaderCanvas = lazy(() => import("./BrandShaderGradientCanvas"));

type Props = {
  variant?: "hero" | "section" | "contact";
  className?: string;
};

/**
 * Brand-aligned shadergradient hero/section background.
 * - Lazy-loaded so three.js (~200kb gz) does not bloat initial bundle
 * - Respects prefers-reduced-motion (falls back to static CSS gradient)
 * - Mobile-safe (CSS gradient under 768px, no WebGL)
 */
export function BrandShaderGradient({ variant = "hero", className = "" }: Props) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const hasWebGL = (() => {
      try {
        return !!document.createElement("canvas").getContext("webgl2");
      } catch {
        return false;
      }
    })();
    setEnabled(!reduced && !mobile && hasWebGL);
  }, []);

  if (!enabled) {
    return (
      <div
        aria-hidden
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{
          background:
            variant === "contact"
              ? "radial-gradient(ellipse at top, hsl(160 84% 18% / 0.35), hsl(220 26% 7%) 70%)"
              : "radial-gradient(ellipse at 30% 20%, hsl(160 84% 22% / 0.45), hsl(220 26% 7%) 65%)",
        }}
      />
    );
  }

  return (
    <Suspense fallback={null}>
      <div aria-hidden className={`absolute inset-0 pointer-events-none ${className}`}>
        <ShaderCanvas variant={variant} />
      </div>
    </Suspense>
  );
}
