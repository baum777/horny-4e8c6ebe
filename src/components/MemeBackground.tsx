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

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function MemeBackground({
  count = 9,
  spawnEveryMs = 900,
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
      .then((res) => res.json())
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
    if (pool.length === 0) return;

    const tick = (t: number) => {
      if (t - lastSpawnRef.current >= spawnEveryMs) {
        lastSpawnRef.current = t;
        setItems((prev) => {
          const now = performance.now();
          const next = prev.slice(-50);
          const active = next.filter((it) => now - it.bornAt < it.lifeMs);

          while (active.length < count) {
            active.push({
              id: `${now}-${Math.random().toString(16).slice(2)}`,
              src: pick(pool),
              x: rand(0, 100),
              y: rand(0, 100),
              size: rand(120, 320),
              rot: rand(-12, 12),
              z: Math.floor(rand(1, 6)),
              bornAt: now,
              lifeMs: rand(4000, 9000),
            });
          }

          return active;
        });
      }

      setItems((prev) => {
        const now = performance.now();
        return prev.filter((it) => now - it.bornAt < it.lifeMs);
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pool, count, spawnEveryMs]);

  if (pool.length === 0) return null;

  const now = performance.now();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/35" />

      {items.map((it) => {
        const age = (now - it.bornAt) / it.lifeMs;
        const fadeIn = Math.min(1, age / 0.18);
        const fadeOut = Math.max(0, (1 - age) / 0.25);
        const opacity = Math.min(fadeIn, fadeOut);
        const scale = 0.85 + 0.25 * Math.sin(Math.min(1, age) * Math.PI);

        return (
          <div
            key={it.id}
            className="absolute will-change-transform"
            style={{
              left: `${it.x}vw`,
              top: `${it.y}vh`,
              width: `${it.size}px`,
              height: `${it.size}px`,
              transform: `translate(-50%, -50%) rotate(${it.rot}deg) scale(${scale})`,
              opacity,
              zIndex: it.z,
              filter: "saturate(1.1) contrast(1.05)",
            }}
          >
            <img
              src={it.src}
              alt=""
              draggable={false}
              className="h-full w-full select-none rounded-2xl shadow-2xl"
            />
          </div>
        );
      })}
    </div>
  );
}
