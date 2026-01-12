import { FloatingImages } from "./FloatingImages";
import { ALL_PNG_IMAGES } from "@/lib/memePool";

export default function MemeBackground({
  count = 9,
  spawnEveryMs = 850,
}: {
  count?: number;
  spawnEveryMs?: number;
}) {
  return (
    <FloatingImages
      images={ALL_PNG_IMAGES}
      maxOnScreen={count}
      spawnEveryMs={spawnEveryMs}
      minDurationMs={7000}
      maxDurationMs={14000}
      minWidthPx={80}
      maxWidthPx={190}
      edgePaddingPx={24}
    />
  );
}

