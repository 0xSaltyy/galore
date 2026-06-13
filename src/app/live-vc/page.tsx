import { PageHeading, PageSection, SiteShell } from "@/components/site-shell";
import { VoiceChannelList } from "@/components/voice-channel-list";
import { getServerStats, getVoiceSnapshot } from "@/lib/public-data";

export const metadata = {
  title: "Live VC",
};

export const dynamic = "force-dynamic";

export default async function LiveVcPage() {
  const [channels, stats] = await Promise.all([getVoiceSnapshot(), getServerStats()]);

  return (
    <SiteShell>
      <PageSection>
        <PageHeading
          eyebrow="# galore"
          title="rooms"
        />
        <VoiceChannelList initialChannels={channels} initialStats={stats} />
      </PageSection>
    </SiteShell>
  );
}
