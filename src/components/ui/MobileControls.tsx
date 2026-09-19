import { useGameStore } from "@/store/useGameStore";

function pressProps(onStart: () => void, onEnd: () => void) {
  return {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      onStart();
    },
    onPointerUp: onEnd,
    onPointerLeave: onEnd,
    onPointerCancel: onEnd,
  };
}

export function MobileControls() {
  const setTouch = useGameStore((s) => s.setTouch);
  const nearby = useGameStore((s) => s.nearby);
  const openPanel = useGameStore((s) => s.openPanel);

  return (
    <div className="touch-controls">
      <div className="touch-pad">
        <button
          type="button"
          className="touch-btn touch-btn--up"
          aria-label="Accelerate"
          {...pressProps(
            () => setTouch({ forward: 1 }),
            () => setTouch({ forward: 0 }),
          )}
        >
          ▲
        </button>
        <button
          type="button"
          className="touch-btn touch-btn--left"
          aria-label="Steer left"
          {...pressProps(
            () => setTouch({ steer: 1 }),
            () => setTouch({ steer: 0 }),
          )}
        >
          ◀
        </button>
        <button
          type="button"
          className="touch-btn touch-btn--right"
          aria-label="Steer right"
          {...pressProps(
            () => setTouch({ steer: -1 }),
            () => setTouch({ steer: 0 }),
          )}
        >
          ▶
        </button>
        <button
          type="button"
          className="touch-btn touch-btn--down"
          aria-label="Reverse"
          {...pressProps(
            () => setTouch({ forward: -1 }),
            () => setTouch({ forward: 0 }),
          )}
        >
          ▼
        </button>
      </div>

      <button
        type="button"
        className="btn btn--primary touch-interact"
        disabled={!nearby}
        onClick={() => nearby && openPanel(nearby)}
      >
        Interact
      </button>
    </div>
  );
}
