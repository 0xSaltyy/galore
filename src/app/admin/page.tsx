import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { PageHeading, PageSection, SiteShell } from "@/components/site-shell";
import { getAdminSession } from "@/lib/auth";
import { getAdminSummary } from "@/lib/public-data";

export const metadata = {
  title: "Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const summary = await getAdminSummary();

  return (
    <SiteShell>
      <PageSection>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeading
            eyebrow={session.displayName}
            title="admin"
          />
          <a
            href="/api/auth/logout"
            className="rounded-md border border-[#2a2a30] bg-[#101014] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#aeb0b6] hover:border-[#4a3a40] hover:text-white"
          >
            logout
          </a>
        </div>
        <AdminDashboard initialSummary={summary} />
      </PageSection>
    </SiteShell>
  );
}
