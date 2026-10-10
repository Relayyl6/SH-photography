import { z } from "zod";

// Shared client/server schema for the contact/booking form (A8, AGENTS.md
// §9). Server-side enforcement happens once the submitEnquiry server action
// is wired to the database (Phase 4/6) — this file is written so that step
// is a drop-in, not a redesign.
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().optional().or(z.literal("")),
  enquiryType: z.enum(["message", "booking"]),
  service: z.string().trim().optional().or(z.literal("")),
  preferredDate: z.string().trim().optional().or(z.literal("")),
  location: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell me a little more (10 characters minimum)."),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please agree before sending your enquiry." }),
  }),
  // Honeypot — must stay empty (ACCESSIBILITY.md §4).
  company: z.string().max(0).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
