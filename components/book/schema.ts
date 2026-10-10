import { z } from 'zod';

export const bookingSchema = z.object({
  serviceCategory: z.enum(['Wedding', 'Portrait', 'Event', 'Retouching', 'Other']),
  sessionSubType: z.string().optional(),
  numSubjects: z.string().optional(),
  estimatedDuration: z.string().optional(),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  alternateDate: z.string().optional(),
  // Selected from the time-slot calendar alongside preferredDate — see the
  // cross-field check below, which requires it whenever a date is set.
  preferredStartTime: z.string().optional(),
  dateFlexible: z.enum(['Yes', 'No']),

  locationType: z.enum(['Studio', 'Client\'s Location', 'Outdoor', 'Venue', 'Multiple Locations', 'Other']),
  address: z.string().optional(),
  cityPostcode: z.string().optional(),
  indoorsOutdoors: z.enum(['Indoors', 'Outdoors', 'Both', 'Not Sure']).optional(),
  travelRequired: z.enum(['Yes', 'No']),
  travelDetails: z.string().optional(),
  parkingNotes: z.string().optional(),

  vision: z.string().min(1, 'Please describe your vision'),
  stylePreferences: z.array(z.string()).min(1, 'Select at least one style'),
  colorPreference: z.enum(['Color', 'Black & White', 'Mix', 'Benedict\'s choice']),
  inspirationLinks: z.string().optional(),
  mustHaveShots: z.string().optional(),
  specialRequests: z.string().optional(),

  deliverables: z.array(z.string()).min(1, 'Select at least one deliverable'),
  editedImagesExpected: z.string().optional(),
  turnaroundTime: z.enum(['Standard (2–3 weeks)', 'Rush (under 1 week)', 'Flexible']),
  usageRights: z.string().optional(),
  secondShooter: z.enum(['Yes', 'No', 'Recommend for me']),

  budgetRange: z.enum(['Under £500', '£500–£1,000', '£1,000–£2,500', '£2,500–£5,000', '£5,000+', 'Prefer to discuss']),
  budgetFlexible: z.enum(['Yes', 'No', 'Slightly']),
  howSoon: z.enum(['ASAP', 'Within 2 weeks', 'Within a month', '1–3 months', 'Just planning ahead']),
  depositAck: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge the deposit requirement'
  }),

  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  preferredContact: z.enum(['Email', 'Phone', 'WhatsApp']),
  companyName: z.string().optional(),
  instagramHandle: z.string().optional(),
  howDidYouFindMe: z.string().optional(),

  termsAgreed: z.boolean().refine(val => val === true, {
    message: 'You must agree to the Terms & Conditions'
  }),
  privacyAgreed: z.boolean().refine(val => val === true, {
    message: 'You must agree to the Privacy Policy'
  }),
  contactConsent: z.boolean().refine(val => val === true, {
    message: 'You must consent to being contacted'
  }),
}).superRefine((data, ctx) => {
  if (data.preferredDate && !data.preferredStartTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Pick a time slot for your preferred date',
      path: ['preferredStartTime'],
    });
  }
});

export type BookingFormData = z.infer<typeof bookingSchema>;
