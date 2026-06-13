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
          eyebrow="# galore"
          title="reports"
        />
        <ReportForm />
      </PageSection>
    </SiteShell>
  );
}
