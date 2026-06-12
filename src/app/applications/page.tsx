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
          eyebrow="Applications"
          title="Staff application"
          description="Apply with your Discord details, availability, moderation judgment, and previous experience."
        />
        <StaffApplicationForm />
      </PageSection>
    </SiteShell>
  );
}
