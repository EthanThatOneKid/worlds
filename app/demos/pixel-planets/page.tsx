import { PlanetDemoPage } from "@/components/planet-demo-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pixel Planets Demo",
  description:
    "Procedurally generated planets using React Three Fiber and shaders.",
};

export default function Page() {
  return <PlanetDemoPage />;
}
