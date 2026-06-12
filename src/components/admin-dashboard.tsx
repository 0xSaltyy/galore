"use client";

import { useMemo, useState } from "react";
import {
  CalendarPlus,
  Check,
  Clock,
  FileText,
  RefreshCcw,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { Avatar } from "@/components/avatar";
import { StatusPill } from "@/components/status";
import { StatCard } from "@/components/stat-card";
import type { AdminSummary, ServerEvent, StaffMember } from "@/lib/types";

type Tab = "overview" | "applications" | "reports" | "staff" | "events";

const inputClass =
  "w-full rounded-md border border-[#24242a] bg-[#070708] px-3 py-2.5 text-sm text-[#e5e5e8] outline-none transition placeholder:text-[#56575e] focus:border-[#594149] focus:bg-[#0b0b0d]";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "applications", label: "Applications" },
  { id: "reports", label: "Reports" },
  { id: "staff", label: "Staff" },
  { id: "events", label: "Events" },
];

export function AdminDashboard({ initialSummary }: { initialSummary: AdminSummary }) {
  const [summary, setSummary] = useState(initialSummary);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ServerEvent | null>(null);

  const pendingApplications = useMemo(
    () => summary.applications.filter((application) => application.status === "pending").length,
    [summary.applications],
  );

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/summary", { cache: "no-store" });
      if (response.ok) {
        setSummary((await response.json()) as AdminSummary);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateApplication(id: string, status: "approved" | "rejected") {
    const response = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      await refresh();
    }
  }

  async function updateReport(id: string, status: string) {
    const response = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      await refresh();
    }
  }

  async function saveStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      event.currentTarget.reset();
      setSelectedStaff(null);
      await refresh();
    }
  }

  async function saveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    if (typeof payload.startsAt === "string") {
      payload.startsAt = new Date(payload.startsAt).toISOString();
    }

    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      event.currentTarget.reset();
      setSelectedEvent(null);
      await refresh();
    }
  }

  async function deleteEvent(id: string) {
    const response = await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
    if (response.ok) {
      await refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#1d1d22] bg-[#0b0b0d] p-3">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`h-10 rounded-md border px-3 text-sm font-semibold transition ${
                tab === item.id
                  ? "border-[#4a3a40] bg-[#171013] text-[#d8c4c8]"
                  : "border-[#24242a] bg-[#101014] text-[#85868b] hover:text-[#d2d3d7]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[#2a2a30] bg-[#101014] px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c3c4c9]"
        >
          <RefreshCcw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Sync
        </button>
      </div>

      {tab === "overview" ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total members" value={summary.stats.totalMembers} icon={Users} tone="zinc" />
            <StatCard label="Online" value={summary.stats.onlineMembers} icon={Clock} tone="blue" />
            <StatCard label="In VC" value={summary.stats.peopleInVc} icon={Shield} tone="red" />
            <StatCard label="Pending apps" value={pendingApplications} icon={FileText} tone="zinc" />
          </div>
          <div className="rounded-md border border-[#1d1d22] bg-[#0b0b0d] p-5">
            <h2 className="text-base font-semibold text-[#e6e6e9]">Server Snapshot</h2>
            <p className="mt-2 text-sm text-[#77787f]">
              Last stat update:{" "}
              <span className="font-mono text-[#b7b8bd]">
                {summary.stats.updatedAt
                  ? new Date(summary.stats.updatedAt).toLocaleString()
                  : "Waiting for bot"}
              </span>
            </p>
          </div>
        </div>
      ) : null}

      {tab === "applications" ? (
        <div className="space-y-4">
          {summary.applications.map((application) => (
            <article key={application.id} className="rounded-md border border-[#1d1d22] bg-[#0b0b0d] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#e6e6e9]">{application.discordUsername}</p>
                  <p className="font-mono text-xs text-[#62636a]">{application.discordUserId}</p>
                </div>
                <span className="rounded border border-[#24242a] bg-[#101014] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#85868b]">
                  {application.status}
                </span>
              </div>
              <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                <Field label="Age" value={String(application.age)} />
                <Field label="Timezone" value={application.timezone} />
                <Field label="Activity" value={application.activityLevel} />
                <Field label="Experience" value={application.previousExperience} />
                <Field label="Why staff" value={application.whyStaff} wide />
                <Field label="VC problems" value={application.vcProblemResponse} wide />
                <Field label="Arguments" value={application.argumentResponse} wide />
              </dl>
              {application.status === "pending" ? (
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateApplication(application.id, "approved")}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-[#26382e] bg-[#0f1712] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#a8c5b3]"
                  >
                    <Check className="size-4" aria-hidden="true" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateApplication(application.id, "rejected")}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-[#4b2d35] bg-[#171013] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#c99ca4]"
                  >
                    <X className="size-4" aria-hidden="true" />
                    Reject
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      {tab === "reports" ? (
        <div className="space-y-4">
          {summary.reports.map((report) => (
            <article key={report.id} className="rounded-md border border-[#1d1d22] bg-[#0b0b0d] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#e6e6e9]">{report.subject}</p>
                  <p className="mt-1 text-sm text-[#77787f]">
                    {report.type === "ban_appeal" ? "Ban appeal" : "Report"} from {report.discordUsername}
                  </p>
                </div>
                <select
                  value={report.status}
                  onChange={(event) => updateReport(report.id, event.target.value)}
                  className="rounded-md border border-[#24242a] bg-[#070708] px-3 py-2 text-sm text-[#e6e6e9]"
                >
                  <option value="open">Open</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#b7b8bd]">{report.details}</p>
              {report.evidenceUrl ? (
                <a
                  href={report.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-[#8fa2b2] hover:text-[#b7c2ca]"
                >
                  Evidence link
                </a>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      {tab === "staff" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-4 md:grid-cols-2">
            {summary.staff.map((member) => (
              <article key={member.id} className="rounded-md border border-[#1d1d22] bg-[#0b0b0d] p-4">
                <div className="flex items-start gap-3">
                  <Avatar src={member.avatarUrl} name={member.displayName} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#e6e6e9]">{member.displayName}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8f6268]">{member.rank}</p>
                    <div className="mt-2">
                      <StatusPill status={member.status} />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#8a8b90]">{member.bio}</p>
                <button
                  type="button"
                  onClick={() => setSelectedStaff(member)}
                  className="mt-4 h-9 rounded-md border border-[#24242a] bg-[#101014] px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#aeb0b6]"
                >
                  Edit bio
                </button>
              </article>
            ))}
          </div>

          <form
            key={selectedStaff?.id ?? "new-staff"}
            onSubmit={saveStaff}
            className="h-fit rounded-md border border-[#1d1d22] bg-[#0b0b0d] p-5"
          >
            <h2 className="mb-4 text-sm font-semibold text-[#e6e6e9]">Staff Profile</h2>
            <input type="hidden" name="id" defaultValue={selectedStaff?.id ?? ""} />
            <StackedInput name="discordUserId" label="Discord user ID" defaultValue={selectedStaff?.discordUserId} />
            <StackedInput name="displayName" label="Display name" defaultValue={selectedStaff?.displayName} />
            <label className="mb-3 block">
              <span className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a5a6ab]">Rank</span>
              <select name="rank" defaultValue={selectedStaff?.rank ?? "Moderator"} className={inputClass}>
                <option>Owner</option>
                <option>Admin</option>
                <option>Moderator</option>
                <option>Trial Staff</option>
              </select>
            </label>
            <label className="mb-3 block">
              <span className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a5a6ab]">Status</span>
              <select name="status" defaultValue={selectedStaff?.status ?? "unknown"} className={inputClass}>
                <option value="unknown">Unknown</option>
                <option value="online">Online</option>
                <option value="idle">Idle</option>
                <option value="dnd">DND</option>
                <option value="offline">Offline</option>
              </select>
            </label>
            <label className="mb-3 block">
              <span className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a5a6ab]">Bio</span>
              <textarea
                name="bio"
                defaultValue={selectedStaff?.bio}
                rows={5}
                className={`${inputClass} resize-y`}
              />
            </label>
            <StackedInput
              name="sortOrder"
              label="Sort order"
              type="number"
              defaultValue={String(selectedStaff?.sortOrder ?? 50)}
            />
            <button className="mt-2 inline-flex h-9 items-center gap-2 rounded-md border border-[#34343a] bg-[#101014] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#d3d4d8]">
              <Shield className="size-4" aria-hidden="true" />
              Save staff
            </button>
          </form>
        </div>
      ) : null}

      {tab === "events" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {summary.events.map((event) => (
              <article key={event.id} className="rounded-md border border-[#1d1d22] bg-[#0b0b0d] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#e6e6e9]">{event.title}</p>
                    <p className="mt-1 font-mono text-xs text-[#62636a]">
                      {new Date(event.startsAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className="h-9 rounded-md border border-[#24242a] bg-[#101014] px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#aeb0b6]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEvent(event.id)}
                      className="grid size-9 place-items-center rounded-md border border-[#4b2d35] bg-[#171013] text-[#c99ca4]"
                      aria-label="Delete event"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#8a8b90]">{event.description}</p>
              </article>
            ))}
          </div>

          <form
            key={selectedEvent?.id ?? "new-event"}
            onSubmit={saveEvent}
            className="h-fit rounded-md border border-[#1d1d22] bg-[#0b0b0d] p-5"
          >
            <h2 className="mb-4 text-sm font-semibold text-[#e6e6e9]">Event</h2>
            <input type="hidden" name="id" defaultValue={selectedEvent?.id ?? ""} />
            <StackedInput name="title" label="Title" defaultValue={selectedEvent?.title} />
            <StackedInput name="eventType" label="Type" defaultValue={selectedEvent?.eventType ?? "Voice"} />
            <StackedInput name="host" label="Host" defaultValue={selectedEvent?.host ?? ""} />
            <StackedInput
              name="startsAt"
              label="Starts at"
              type="datetime-local"
              defaultValue={selectedEvent ? toDateTimeLocal(selectedEvent.startsAt) : ""}
            />
            <label className="mb-3 block">
              <span className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a5a6ab]">Description</span>
              <textarea
                name="description"
                defaultValue={selectedEvent?.description}
                rows={5}
                className={`${inputClass} resize-y`}
              />
            </label>
            <label className="mb-4 flex items-center gap-3 text-sm text-[#b7b8bd]">
              <input
                type="checkbox"
                name="isActive"
                value="true"
                defaultChecked={selectedEvent?.isActive ?? true}
                className="size-4 accent-[#73323b]"
              />
              Active
            </label>
            <button className="inline-flex h-9 items-center gap-2 rounded-md border border-[#34343a] bg-[#101014] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#d3d4d8]">
              <CalendarPlus className="size-4" aria-hidden="true" />
              Save event
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <dt className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#62636a]">{label}</dt>
      <dd className="whitespace-pre-wrap leading-6 text-[#b7b8bd]">{value}</dd>
    </div>
  );
}

function StackedInput({
  name,
  label,
  defaultValue,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a5a6ab]">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} className={inputClass} />
    </label>
  );
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
