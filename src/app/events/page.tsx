import { CalendarDays } from "lucide-react";

import { PageHeading, PageSection, SiteShell } from "@/components/site-shell";
import { getEvents } from "@/lib/public-data";

export const metadata = {
  title: "Events",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <SiteShell>
      <PageSection>
        <PageHeading
          eyebrow="# galore"
          title="events"
        />
        {events.length === 0 ? (
          <div className="rounded-md border border-dashed border-[#1d1d22] bg-[#080809] px-4 py-8 font-mono text-[10px] uppercase tracking-[0.18em] text-[#555651]">
            empty
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-md border border-[#1d1d22] bg-[#0b0b0d] p-4"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <span className="grid size-9 place-items-center rounded border border-[#202a32] bg-[#0f1418] text-[#8fa2b2]">
                  <CalendarDays className="size-4" aria-hidden="true" />
                </span>
                <span className="rounded border border-[#24242a] bg-[#101014] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#77787f]">
                  {event.eventType}
                </span>
              </div>
              <h2 className="text-base font-semibold text-[#e6e6e9]">{event.title}</h2>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#66676e]">
                {new Date(event.startsAt).toLocaleString()}
              </p>
              <p className="mt-4 text-sm leading-6 text-[#8a8b90]">{event.description}</p>
              {event.host ? <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#a8a9ae]">Host: {event.host}</p> : null}
            </article>
          ))}
          </div>
        )}
      </PageSection>
    </SiteShell>
  );
}
