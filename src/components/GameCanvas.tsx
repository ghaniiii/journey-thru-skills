import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import { World } from "@/scenes/World";
import { Hud } from "@/components/ui/Hud";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { MobileControls } from "@/components/ui/MobileControls";
import { PortfolioPanel } from "@/components/portfolio/PortfolioPanel";
import { StaticPortfolio } from "@/components/portfolio/StaticPortfolio";
import { useGameStore } from "@/store/useGameStore";
import { usePortfolioInteraction } from "@/hooks/usePortfolioInteraction";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { isWebGLAvailable } from "@/lib/webgl";
import { stopEngine } from "@/lib/audio";

export function GameCanvas() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const isTouch = useIsTouchDevice();
  const entered = useGameStore((s) => s.entered);
  const enterWorld = useGameStore((s) => s.enterWorld);
  const openSection = useGameStore((s) => s.openSection);
  const closePanel = useGameStore((s) => s.closePanel);

  usePortfolioInteraction();

  useEffect(() => {
    setWebgl(isWebGLAvailable());
    return () => stopEngine();
  }, []);

  const dpr = useMemo<[number, number]>(() => (isTouch ? [1, 1.4] : [1, 2]), [isTouch]);

  if (webgl === false) {
    return (
      <StaticPortfolio reason="3D mode is unavailable on this device, so here is the full portfolio as a regular page." />
    );
  }

  return (
    <div className="stage">
      {webgl && (
        <Canvas
          shadows={!isTouch}
          dpr={dpr}
          gl={{ antialias: !isTouch, powerPreference: "high-performance" }}
          camera={{ position: [0, 9, -18], fov: 58, near: 0.5, far: 400 }}
        >
          <Suspense fallback={null}>
            <World lowQuality={isTouch} />
          </Suspense>
        </Canvas>
      )}

      {entered ? (
        <>
          <Hud />
          {isTouch && !openSection && <MobileControls />}
          {openSection && <PortfolioPanel id={openSection} onClose={closePanel} />}
        </>
      ) : (
        <LoadingScreen onEnter={enterWorld} />
      )}
    </div>
  );
}
