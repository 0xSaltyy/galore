import { Avatar } from "@/components/avatar";
import { PageHeading, PageSection, SiteShell } from "@/components/site-shell";
import { StatusPill } from "@/components/status";
import { getStaffMembers, groupStaffByRank } from "@/lib/public-data";

export const metadata = {
  title: "Staff",
};

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const staff = await getStaffMembers();
  const groups = groupStaffByRank(staff);

  return (
    <SiteShell>
      <PageSection>
        <PageHeading
          eyebrow="# galore"
          title="staff"
        />
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.rank}>
              <div className="mb-3 flex items-center justify-between border-b border-[#1b1b1d] pb-3">
                <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.34em] text-[#b8b6b0]">
                  {group.rank}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6f706b]">
                  {group.members.length} listed
                </span>
              </div>
              {group.members.length === 0 ? (
                <div className="border border-dashed border-[#242427] bg-[#050505] p-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#555651]">
                  No staff listed
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {group.members.map((member) => (
                    <article
                      key={member.id}
                      className="border border-[#1b1b1d] bg-[#070708] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar src={member.avatarUrl} name={member.displayName} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium tracking-[-0.02em] text-[#e2dfd8]">{member.displayName}</p>
                            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#777873]">
                              {member.rank}
                            </p>
                          </div>
                        </div>
                        <StatusPill status={member.status} />
                      </div>
                      <div className="mt-4 border-t border-[#1b1b1d] pt-3">
                        <p className="text-xs leading-5 text-[#8d8b85]">{member.bio}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </PageSection>
    </SiteShell>
  );
}
