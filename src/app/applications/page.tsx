import { StaffApplicationForm } from "@/components/forms";
import { PageHeading, PageSection, SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "Staff Applications",
};

export default function ApplicationsPage() {
  return (
    <SiteShell>
      <PageSection>
        <PageHeading
          eyebrow="# galore"
          title="apply"
        />
        <StaffApplicationForm />
      </PageSection>
    </SiteShell>
  );
}
