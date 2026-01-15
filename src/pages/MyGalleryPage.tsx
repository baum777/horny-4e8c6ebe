import { PageShell } from "@/components/layout/PageShell";
import { TeaserLayout } from "@/components/ui/TeaserLayout";

export default function MyGalleryPage() {
  return (
    <PageShell page="my-gallery" state="teaser" energy={1}>
      <TeaserLayout 
        title="Your collection is loading..."
        subtitle="Drafts. Published. Hidden."
      />
    </PageShell>
  );
}

