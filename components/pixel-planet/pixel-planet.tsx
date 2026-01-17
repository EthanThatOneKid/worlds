"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { PlanetOptions, generatePlanetByType } from "./lib/utils";

export interface PixelPlanetProps {
  type:
    | "ice"
    | "gas_giant_1"
    | "gas_giant_2"
    | "asteroid"
    | "star"
    | "lava"
    | "dry"
    | "earth"
    | "no_atmosphere";
  seed: number;

  /**
   * advanced customization options for the planet.
   */
  advanced?: PlanetOptions;
  className?: string;
  stars?: boolean;
}

const mapTypeToLabel: Record<PixelPlanetProps["type"], string> = {
  ice: "Ice Planet",
  gas_giant_1: "Gas giant 1",
  gas_giant_2: "Gas giant 2",
  asteroid: "Asteroid",
  star: "Star",
  lava: "Lava Planet",
  dry: "Dry Planet",
  earth: "Earth Planet",
  no_atmosphere: "No atmosphere",
};

function PlanetContent({ type, seed, advanced: options }: PixelPlanetProps) {
  const planetLabel = mapTypeToLabel[type];

  // Generate planet group when type changes
  const planet = useMemo(() => {
    return generatePlanetByType(planetLabel, options);
  }, [planetLabel, options]);

  // Update seed when it changes
  useEffect(() => {
    if (!planet) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    planet.children.forEach((layer: any) => {
      if (layer.material && layer.material.uniforms) {
        if (layer.material.uniforms["seed"]) {
          layer.material.uniforms["seed"].value = seed;
        }
        // Assuming asteroid sizing logic from index.js if needed, strictly following seed for now
      }
    });
  }, [planet, seed]);

  // Animation loop
  useFrame(({ clock }) => {
    if (!planet) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    planet.children.forEach((layer: any) => {
      if (layer.material && layer.material.uniforms) {
        if (layer.material.uniforms["time"]) {
          layer.material.uniforms["time"].value = clock.getElapsedTime();
        }
      }
    });
  });

  if (!planet) return null;

  return <primitive object={planet} />;
}

export function PixelPlanet({
  className,
  stars,
  ...props
}: PixelPlanetProps & React.ComponentProps<typeof Canvas>) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 1] }} // Updated camera position
      style={props.style}
      {...props}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {stars && (
        <Stars
          radius={300}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      )}

      <PlanetContent {...props} />

      {/* <OrbitControls enablePan={false} /> */}
    </Canvas>
  );
}
