import { useEffect, useState } from "react";

/** Client-only touch detection (avoids SSR/hydration mismatches). */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsTouch(
        window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900,
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isTouch;
}
