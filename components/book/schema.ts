import { z } from 'zod';

export const bookingSchema = z.object({
  serviceCategory: z.string().min(1, 'Please select a service category'),
  sessionSubType: z.string().optional(),
  numSubjects: z.string().optional(),
  estimatedDuration: z.string().optional(),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  alternateDate: z.string().optional(),
  isDoubleDate: z.boolean().optional(),
  secondaryDate: z.string().optional(),
  multiDayCount: z.string().optional(),
  additionalDates: z.array(z.string()).optional(),
  additionalDatesText: z.string().optional(),
  // Selected from the time-slot calendar alongside preferredDate — see the
  // cross-field check below, which requires it whenever a date is set.
  preferredStartTime: z.string().optional(),
  dateFlexible: z.string().min(1, 'Please specify if date is flexible'),

  locationType: z.string().min(1, 'Please select a location type'),
  address: z.string().optional(),
  cityPostcode: z.string().optional(),
  indoorsOutdoors: z.string().optional(),
  travelRequired: z.string().min(1, 'Please specify if travel is required'),
  travelDetails: z.string().optional(),
  parkingNotes: z.string().optional(),

  vision: z.string().min(1, 'Please describe your vision'),
  stylePreferences: z.array(z.string()).min(1, 'Select at least one style'),
  colorPreference: z.string().min(1, 'Please select a color preference'),
  inspirationLinks: z.string().optional(),
  mustHaveShots: z.string().optional(),
  specialRequests: z.string().optional(),
  extraInfo: z.string().optional(),

  deliverables: z.array(z.string()).min(1, 'Select at least one deliverable'),
  editedImagesExpected: z.string().optional(),
  turnaroundTime: z.string().min(1, 'Please select turnaround time needed'),
  usageRights: z.string().optional(),
  secondShooter: z.string().optional(),

  budgetRange: z.string().min(1, 'Please select a budget range'),
  budgetFlexible: z.string().min(1, 'Please select if budget is flexible'),
  howSoon: z.string().min(1, 'Please select timeline urgency'),
  depositAck: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge the deposit requirement'
  }),

  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  preferredContact: z.string().min(1, 'Please select preferred contact method'),
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
