import { PageShell } from "@/components/layout/PageShell";
import { TeaserLayout } from "@/components/ui/TeaserLayout";

export default function ForgePage() {
  return (
    <PageShell page="forge" state="teaser" energy={1}>
      <TeaserLayout 
        title="The Forge is warming up."
        subtitle="Create. Remix. Win."
      />
    </PageShell>
  );
}

