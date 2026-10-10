"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { packages } from "@/lib/packages";
import { sessions } from "@/lib/sessions";
import { enquirySchema } from "@/lib/validators";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type FieldErrors = Partial<Record<string, string>>;

const services = [
  ...packages.filter((p) => p.category === "photography").map((p) => ({ value: p.slug, label: p.name })),
  ...sessions.map((s) => ({ value: s.slug, label: `${s.title} (session)` })),
  ...packages.filter((p) => p.category === "class").map((p) => ({ value: p.slug, label: p.name })),
];

export function ContactForm() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("service") ?? "";

  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
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
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      queueMicrotask(() => confirmationRef.current?.focus());
    } catch {
      setStatus("error");
    }
  }

  function handleWhatsappSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.form;
    if (!form) return;
    const values = collectValues(form);
    const parsed = enquirySchema.safeParse(values);

    if (!parsed.success) {
      e.preventDefault();
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
    const url = buildWhatsappUrl(parsed.data);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-line bg-sand p-8">
        <h2 ref={confirmationRef} tabIndex={-1} className="font-display text-2xl">
          Thanks — your message is on its way.
        </h2>
        <p className="mt-2 text-ink/70">
          I'll get back to you as soon as I can. If it's urgent, WhatsApp me using the button above.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} noValidate className="space-y-5">
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
