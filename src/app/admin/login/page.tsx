import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";

import { PageHeading, PageSection, SiteShell } from "@/components/site-shell";
import { getAdminSession } from "@/lib/auth";
import { DISCORD_OAUTH_START_PATH } from "@/lib/discord-config";

export const metadata = {
  title: "Admin Login",
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <SiteShell>
      <PageSection>
        <PageHeading
          eyebrow="# galore"
          title="admin"
        />
        <a
          href={DISCORD_OAUTH_START_PATH}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[#34343a] bg-[#101014] px-4 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#d3d4d8] transition hover:border-[#4a3a40] hover:bg-[#141418]"
        >
          <LogIn className="size-3.5" aria-hidden="true" />
          discord
        </a>
      </PageSection>
    </SiteShell>
  );
}
