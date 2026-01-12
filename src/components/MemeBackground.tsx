import { useEffect, useRef, useState } from "react";

type MemeItem = {
  id: string;
  src: string;
  x: number;
  y: number;
  size: number;
  rot: number;
  z: number;
  bornAt: number;
  lifeMs: number;
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export default function MemeBackground({
  count = 9,
  spawnEveryMs = 850,
}: {
  count?: number;
  spawnEveryMs?: number;
}) {
  const [pool, setPool] = useState<string[]>([]);
  const [items, setItems] = useState<MemeItem[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/meme-pool")
      .then((response) => response.json())
      .then((data) => {
        if (!alive) return;
        setPool(Array.isArray(data?.files) ? data.files : []);
      })
      .catch(() => setPool([]));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (pool.length === 0) return undefined;

    const tick = (t: number) => {
      if (t - lastSpawnRef.current >= spawnEveryMs) {
        lastSpawnRef.current = t;

        setItems((prev) => {
          const now = performance.now();
          const active = prev.filter((item) => now - item.bornAt < item.lifeMs);

          while (active.length < count) {
            const src = pick(pool);
            active.push({
              id: `${now}-${Math.random().toString(16).slice(2)}`,
              src,
              x: rand(0, 100),
              y: rand(0, 100),
              size: rand(120, 320),
              rot: rand(-12, 12),
              z: Math.floor(rand(1, 6)),
              bornAt: now,
              lifeMs: rand(4000, 9000),
            });
          }
          return active.slice(-50);
        });
      }

      setItems((prev) => {
        const now = performance.now();
        return prev.filter((item) => now - item.bornAt < item.lifeMs);
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pool, count, spawnEveryMs]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      {items.map((item) => {
        const age = (performance.now() - item.bornAt) / item.lifeMs;
        const fadeIn = Math.min(1, age / 0.18);
        const fadeOut = Math.max(0, (1 - age) / 0.25);
        const opacity = Math.min(fadeIn, fadeOut);
        const scale = 0.85 + 0.25 * Math.sin(Math.min(1, age) * Math.PI);

        return (
          <img
            key={item.id}
            src={item.src}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              left: `${item.x}vw`,
              top: `${item.y}vh`,
              width: `${item.size}px`,
              height: "auto",
              transform: `translate(-50%, -50%) rotate(${item.rot}deg) scale(${scale})`,
              opacity,
              zIndex: item.z,
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
              userSelect: "none",
              willChange: "transform, opacity",
              filter: "saturate(1.1) contrast(1.05)",
            }}
          />
        );
      })}
    </div>
  );
}
