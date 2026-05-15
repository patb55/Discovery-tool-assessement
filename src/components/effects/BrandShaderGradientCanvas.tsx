import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

type Props = { variant: "hero" | "section" | "contact" };

const PRESETS = {
  hero: {
    type: "waterPlane" as const,
    uSpeed: 0.18,
    uStrength: 1.35,
    uDensity: 1.25,
    cDistance: 3.6,
    cPolarAngle: 120,
    cAzimuthAngle: 180,
    brightness: 1.05,
  },
  section: {
    type: "plane" as const,
    uSpeed: 0.12,
    uStrength: 1.1,
    uDensity: 1.0,
    cDistance: 4.2,
    cPolarAngle: 110,
    cAzimuthAngle: 180,
    brightness: 0.95,
  },
  contact: {
    type: "waterPlane" as const,
    uSpeed: 0.1,
    uStrength: 1.0,
    uDensity: 1.1,
    cDistance: 4.0,
    cPolarAngle: 130,
    cAzimuthAngle: 200,
    brightness: 1.0,
  },
} as const;

export default function BrandShaderGradientCanvas({ variant }: Props) {
  const preset = PRESETS[variant];

  return (
    <ShaderGradientCanvas
      style={{ position: "absolute", inset: 0 }}
      pixelDensity={1}
      fov={45}
    >
      <ShaderGradient
        animate="on"
        type={preset.type}
        uSpeed={preset.uSpeed}
        uStrength={preset.uStrength}
        uDensity={preset.uDensity}
        color1="#131720"
        color2="#0E7A55"
        color3="#E5E4E2"
        cDistance={preset.cDistance}
        cPolarAngle={preset.cPolarAngle}
        cAzimuthAngle={preset.cAzimuthAngle}
        brightness={preset.brightness}
        grain="off"
        lightType="3d"
        envPreset="city"
        reflection={0.1}
      />
    </ShaderGradientCanvas>
  );
}
