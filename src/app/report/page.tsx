import { ReportForm } from "@/components/forms";
import { PageHeading, PageSection, SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "Reports and Appeals",
};

export default function ReportPage() {
  return (
    <SiteShell>
      <PageSection>
        <PageHeading
          eyebrow="Moderation"
          title="Report or ban appeal"
          description="Submissions go to Supabase and notify staff through the configured Discord webhook."
        />
        <ReportForm />
      </PageSection>
    </SiteShell>
  );
}
