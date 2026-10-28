"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { packages } from "@/lib/packages";
import { sessions } from "@/lib/sessions";
import { enquirySchema, EnquiryInput } from "@/lib/validators";
import { buildWhatsappUrl, buildEnquiryMailtoUrl, buildGmailComposeUrl, buildOutlookComposeUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site-config";

type FieldErrors = Partial<Record<string, string>>;

const services = [
  ...packages.filter((p) => p.category === "photography").map((p) => ({ value: p.slug, label: p.name })),
  ...sessions.map((s) => ({ value: s.slug, label: `${s.title} (session)` })),
  ...packages.filter((p) => p.category === "class").map((p) => ({ value: p.slug, label: p.name })),
];

function getServiceLabel(value?: string) {
  if (!value) return "";
  const found = services.find((s) => s.value === value);
  return found ? found.label : value;
}

export function ContactForm() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("service") ?? "";

  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [lastSentData, setLastSentData] = useState<{
    values: EnquiryInput;
    serviceLabel: string;
    method: "email" | "whatsapp";
  } | null>(null);
  const confirmationRef = useRef<HTMLHeadingElement>(null);

  function collectValues(form: HTMLFormElement) {
    const data = new FormData(form);
    return {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      enquiryType: (data.get("enquiryType") as "message" | "booking") || "message",
      service: String(data.get("service") || ""),
      preferredDate: String(data.get("preferredDate") || ""),
      location: String(data.get("location") || ""),
      message: String(data.get("message") || ""),
      consent: data.get("consent") === "on",
      company: String(data.get("company") || ""),
    };
  }

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = collectValues(e.currentTarget);
    const parsed = enquirySchema.safeParse(values);

    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: FieldErrors = {};
      for (const key in flat) {
        const msg = flat[key as keyof typeof flat]?.[0];
        if (msg) next[key] = msg;
      }
      setErrors(next);
      setStatus("error");
      return;
    }

    setErrors({});
    setStatus("sending");
    const sLabel = getServiceLabel(parsed.data.service);
    const gmailUrl = buildGmailComposeUrl(parsed.data, sLabel);
    const mailtoUrl = buildEnquiryMailtoUrl(parsed.data, sLabel);

    // Save lead in background before routing (non-blocking)
    fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parsed.data, serviceLabel: sLabel, channel: "email" }),
    }).catch((err) => console.warn("Enquiry API logging:", err));

    setLastSentData({
      values: parsed.data,
      serviceLabel: sLabel,
      method: "email",
    });
    setStatus("sent");

    // Open Gmail website directly in a new tab with compose open and pre-filled.
    // Never call mailto: automatically, which causes OS "Open another app" prompts.
    try {
      const win = window.open(gmailUrl, "_blank", "noopener,noreferrer");
      if (!win || win.closed || typeof win.closed === "undefined") {
        window.location.href = gmailUrl;
      }
    } catch (_) {
      window.location.href = gmailUrl;
    }

    queueMicrotask(() => confirmationRef.current?.focus());
  }

  function handleWhatsappSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const form = e.currentTarget.form || (document.getElementById("contact-form") as HTMLFormElement | null);
    if (!form) return;
    const values = collectValues(form);
    const parsed = enquirySchema.safeParse(values);

    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: FieldErrors = {};
      for (const key in flat) {
        const msg = flat[key as keyof typeof flat]?.[0];
        if (msg) next[key] = msg;
      }
      setErrors(next);
      setStatus("error");
      return;
    }

    setErrors({});
    const sLabel = getServiceLabel(parsed.data.service);
    const whatsappUrl = buildWhatsappUrl(parsed.data, sLabel);

    // Save lead in background before routing
    fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parsed.data, serviceLabel: sLabel, channel: "whatsapp" }),
    }).catch(() => {});

    setLastSentData({
      values: parsed.data,
      serviceLabel: sLabel,
      method: "whatsapp",
    });
    setStatus("sent");

    // Launch WhatsApp directly
    const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      const win = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if (!win) {
        window.location.href = whatsappUrl;
      }
    }
    queueMicrotask(() => confirmationRef.current?.focus());
  }

  if (status === "sent" && lastSentData) {
    const { values, serviceLabel, method } = lastSentData;
    const gmailUrl = buildGmailComposeUrl(values, serviceLabel);
    const outlookUrl = buildOutlookComposeUrl(values, serviceLabel);
    const mailtoUrl = buildEnquiryMailtoUrl(values, serviceLabel);
    const whatsappUrl = buildWhatsappUrl(values, serviceLabel);

    return (
      <div role="status" className="rounded-2xl border border-line bg-sand/95 p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-lg shadow-sm">
            ✓
          </span>
          <div>
            <h2 ref={confirmationRef} tabIndex={-1} className="font-display text-2xl sm:text-3xl text-ink font-medium leading-snug">
              {method === "email"
                ? "Opening Gmail to send to Benedict Henry!"
                : "Opening WhatsApp chat with Benedict Henry!"}
            </h2>
            <p className="mt-1 text-sm text-ink/75 leading-relaxed">
              {method === "email"
                ? `Pre-filled and addressed to ${siteConfig.email}. If Gmail didn't launch automatically, tap below.`
                : `Connected to WhatsApp (${siteConfig.phoneDisplay}) with your message details.`}
            </p>
          </div>
        </div>

        {/* Message Summary Card showing all routed fields */}
        <div className="rounded-xl border border-line/70 bg-paper p-4 text-xs space-y-2 text-ink/80 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-line/60">
            <span className="font-bold uppercase tracking-wider text-[10px] text-accent">
              Enquiry Summary
            </span>
            <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold text-ink/70">
              {values.enquiryType === "booking" ? "Booking Request" : "General Message"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <p><span className="font-semibold text-ink">Name:</span> {values.name}</p>
            <p><span className="font-semibold text-ink">Email:</span> {values.email}</p>
            {values.phone && <p><span className="font-semibold text-ink">Phone:</span> {values.phone}</p>}
            {serviceLabel && <p><span className="font-semibold text-ink">Service:</span> {serviceLabel}</p>}
            {values.preferredDate && <p><span className="font-semibold text-ink">Date:</span> {values.preferredDate}</p>}
            {values.location && <p><span className="font-semibold text-ink">Location:</span> {values.location}</p>}
          </div>

          <div className="mt-2.5 pt-2 border-t border-line/50">
            <p className="font-semibold text-ink mb-1">Message Content:</p>
            <p className="whitespace-pre-wrap text-ink/90 italic leading-relaxed bg-sand/40 p-2.5 rounded-lg border border-line/30">
              &ldquo;{values.message}&rdquo;
            </p>
          </div>
        </div>

        {/* Direct Routing Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <p className="text-xs text-ink/60 font-medium">Quick web routing links (zero app prompts):</p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-4 py-3 text-xs sm:text-sm font-semibold text-white transition-colors shadow-sm"
            >
              <span>✉️ Open in Gmail</span>
            </a>
            <a
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-4 py-3 text-xs sm:text-sm font-semibold text-white transition-colors shadow-sm"
            >
              <span>📫 Open in Outlook Web</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/30 bg-paper hover:bg-sand px-4 py-3 text-xs sm:text-sm font-semibold text-ink hover:border-ink transition-colors"
            >
              <span>💬 Open in WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-ink/60">
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setLastSentData(null);
            }}
            className="hover:text-ink hover:underline"
          >
            ← Send another message or edit
          </button>
          <a href={mailtoUrl} className="hover:text-ink hover:underline text-[11px] text-ink/40">
            use device mail client
          </a>
        </div>
      </div>
    );
  }

  return (
    <form id="contact-form" onSubmit={handleEmailSubmit} noValidate className="space-y-5">
      {status === "error" && Object.keys(errors).length > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accentDark"
        >
          Please fix the highlighted fields before sending.
        </div>
      )}

      {/* Honeypot — hidden from sighted and AT users, must stay empty */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required error={errors.name} />
        <Field label="Email" name="email" type="email" required error={errors.email} />
        <Field label="Phone (optional)" name="phone" type="tel" error={errors.phone} />
        <div>
          <label htmlFor="preferredDate" className="block text-sm font-medium">
            Preferred date (optional)
          </label>
          <input id="preferredDate" name="preferredDate" type="date" className={inputClass} />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">What's this about?</legend>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="enquiryType" value="message" defaultChecked /> A message
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="enquiryType" value="booking" /> A booking
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="service" className="block text-sm font-medium">
          Service or class
        </label>
        <select id="service" name="service" defaultValue={preselected} className={inputClass}>
          <option value="">Not sure yet</option>
          {services.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <Field label="Location (optional, since I travel)" name="location" error={errors.location} />

      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={inputClass}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1 text-sm text-accentDark">
            {errors.message}
          </p>
        )}
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            required
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-1"
          />
          <span>
            I agree to SH Photography storing my details to respond to this enquiry. See the{" "}
            <a href="/privacy" className="underline underline-offset-4">
              privacy policy
            </a>
            .
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" role="alert" className="mt-1 text-sm text-accentDark">
            {errors.consent}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-accent disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send via Email"}
        </button>
        <button
          type="button"
          onClick={handleWhatsappSubmit}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-ink px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-paper"
        >
          Send via WhatsApp
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "mt-1 block w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm focus-visible:outline-accent";

function Field({
  label,
  name,
  type = "text",
  required = false,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={inputClass}
      />
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1 text-sm text-accentDark">
          {error}
        </p>
      )}
    </div>
  );
}
