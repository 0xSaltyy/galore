"use client";

import { useState } from "react";
import { Send, ShieldAlert } from "lucide-react";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea" | "url";
  options?: { label: string; value: string }[];
  required?: boolean;
};

const inputClass =
  "w-full rounded-md border border-[#24242a] bg-[#070708] px-3 py-2.5 text-sm text-[#e5e5e8] outline-none transition placeholder:text-[#56575e] focus:border-[#594149] focus:bg-[#0b0b0d]";

function FormShell({
  endpoint,
  fields,
  submitLabel,
}: {
  endpoint: string;
  fields: Field[];
  submitLabel: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      event.currentTarget.reset();
      setState("sent");
      setMessage("Submitted. Staff will review it from the dashboard.");
      return;
    }

    const data = await response.json().catch(() => null);
    setState("error");
    setMessage(data?.error ?? "Could not submit. Check the form and try again.");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-[#1d1d22] bg-[#0b0b0d] p-5 sm:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field.name}
            className={field.type === "textarea" ? "md:col-span-2" : ""}
          >
            <span className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a5a6ab]">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                required={field.required}
                rows={5}
                className={`${inputClass} resize-y`}
              />
            ) : field.type === "select" ? (
              <select name={field.name} required={field.required} className={inputClass}>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.name}
                type={field.type ?? "text"}
                required={field.required}
                className={inputClass}
              />
            )}
          </label>
        ))}
      </div>

      {message ? (
        <div
          className={`mt-5 rounded-md border px-4 py-3 text-sm ${
            state === "error"
              ? "border-[#4b2d35] bg-[#171013] text-[#c99ca4]"
              : "border-[#26382e] bg-[#0f1712] text-[#a8c5b3]"
          }`}
        >
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-md border border-[#34343a] bg-[#101014] px-4 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#d3d4d8] transition hover:border-[#594149] hover:bg-[#141418] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {endpoint.includes("reports") ? (
          <ShieldAlert className="size-4" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {state === "sending" ? "Submitting" : submitLabel}
      </button>
    </form>
  );
}

export function StaffApplicationForm() {
  return (
    <FormShell
      endpoint="/api/applications"
      submitLabel="Submit application"
      fields={[
        { name: "discordUsername", label: "Discord username", required: true },
        { name: "discordUserId", label: "Discord user ID", required: true },
        { name: "age", label: "Age", type: "number", required: true },
        { name: "timezone", label: "Timezone", required: true },
        { name: "activityLevel", label: "Activity level", required: true },
        {
          name: "whyStaff",
          label: "Why do you want staff?",
          type: "textarea",
          required: true,
        },
        {
          name: "vcProblemResponse",
          label: "What would you do if someone is causing problems in VC?",
          type: "textarea",
          required: true,
        },
        {
          name: "argumentResponse",
          label: "What would you do if two people are arguing?",
          type: "textarea",
          required: true,
        },
        {
          name: "previousExperience",
          label: "Previous staff experience",
          type: "textarea",
          required: true,
        },
      ]}
    />
  );
}

export function ReportForm() {
  return (
    <FormShell
      endpoint="/api/reports"
      submitLabel="Submit to staff"
      fields={[
        {
          name: "type",
          label: "Submission type",
          type: "select",
          required: true,
          options: [
            { label: "Report", value: "report" },
            { label: "Ban appeal", value: "ban_appeal" },
          ],
        },
        { name: "discordUsername", label: "Discord username", required: true },
        { name: "discordUserId", label: "Discord user ID", required: true },
        { name: "subject", label: "Subject", required: true },
        { name: "evidenceUrl", label: "Evidence URL", type: "url" },
        { name: "details", label: "Details", type: "textarea", required: true },
      ]}
    />
  );
}
