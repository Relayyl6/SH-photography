import { z } from 'zod';
import { BookingFieldDoc } from '@/types/firebase';

export function buildBookingSchema(fields?: BookingFieldDoc[]) {
  const reqMap = new Map<string, boolean>();
  if (fields && Array.isArray(fields)) {
    for (const f of fields) {
      if (f.key) reqMap.set(f.key, Boolean(f.required));
      if (f.id) reqMap.set(f.id, Boolean(f.required));
    }
  }

  const isReq = (key: string, defaultReq: boolean): boolean => {
    if (reqMap.has(key)) return reqMap.get(key)!;
    return defaultReq;
  };

  const stringField = (key: string, defaultReq: boolean, reqMsg: string) => {
    return isReq(key, defaultReq)
      ? z.string().min(1, reqMsg)
      : z.string().optional();
  };

  const arrayField = (key: string, defaultReq: boolean, reqMsg: string) => {
    return isReq(key, defaultReq)
      ? z.array(z.string()).min(1, reqMsg)
      : z.array(z.string()).optional();
  };

  return z.object({
    serviceCategory: stringField('serviceCategory', true, 'Please select a service category'),
    sessionSubType: stringField('sessionSubType', false, 'Please specify session sub-type'),
    numSubjects: stringField('numSubjects', false, 'Please specify number of subjects'),
    estimatedDuration: stringField('estimatedDuration', false, 'Please select duration'),
    preferredDate: stringField('preferredDate', true, 'Preferred date is required'),
    alternateDate: stringField('alternateDate', false, 'Alternate date'),
    isDoubleDate: z.boolean().optional(),
    secondaryDate: stringField('secondaryDate', false, 'Secondary date'),
    multiDayCount: stringField('multiDayCount', false, 'Multi-day duration'),
    additionalDates: z.array(z.string()).optional(),
    additionalDatesText: z.string().optional(),
    preferredStartTime: stringField('preferredStartTime', true, 'Pick a time slot for your preferred date'),
    dateFlexible: stringField('dateFlexible', true, 'Please specify if date is flexible'),

    locationType: stringField('locationType', true, 'Please select a location type'),
    address: stringField('address', false, 'Please provide an address'),
    cityPostcode: stringField('cityPostcode', false, 'City & Postcode'),
    indoorsOutdoors: stringField('indoorsOutdoors', false, 'Setting'),
    travelRequired: stringField('travelRequired', true, 'Please specify if travel is required'),
    travelDetails: stringField('travelDetails', false, 'Travel details'),
    parkingNotes: stringField('parkingNotes', false, 'Parking notes'),

    vision: stringField('vision', true, 'Please describe your vision'),
    stylePreferences: arrayField('stylePreferences', true, 'Select at least one style'),
    colorPreference: stringField('colorPreference', true, 'Please select a color preference'),
    inspirationLinks: stringField('inspirationLinks', false, 'Inspiration links'),
    mustHaveShots: stringField('mustHaveShots', false, 'Must-have shots'),
    specialRequests: stringField('specialRequests', false, 'Special requests'),
    extraInfo: stringField('extraInfo', false, 'Extra info'),

    deliverables: arrayField('deliverables', true, 'Select at least one deliverable'),
    editedImagesExpected: stringField('editedImagesExpected', false, 'Edited images expected'),
    turnaroundTime: stringField('turnaroundTime', true, 'Please select turnaround time needed'),
    usageRights: stringField('usageRights', false, 'Usage rights'),
    secondShooter: stringField('secondShooter', false, 'Second shooter'),

    budgetRange: stringField('budgetRange', true, 'Please select a budget range'),
    budgetFlexible: stringField('budgetFlexible', true, 'Please select if budget is flexible'),
    howSoon: stringField('howSoon', true, 'Please select timeline urgency'),
    depositAck: isReq('depositAck', true)
      ? z.boolean().refine(val => val === true, {
          message: 'You must acknowledge the deposit requirement',
        })
      : z.boolean().optional(),

    fullName: stringField('fullName', true, 'Full name is required'),
    email: isReq('email', true)
      ? z.string().email('Invalid email address')
      : z.string().optional(),
    phone: stringField('phone', true, 'Phone number is required'),
    preferredContact: stringField('preferredContact', true, 'Please select preferred contact method'),
    companyName: stringField('companyName', false, 'Company name'),
    instagramHandle: stringField('instagramHandle', false, 'Instagram handle'),
    howDidYouFindMe: stringField('howDidYouFindMe', false, 'How did you find me'),

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
    if (data.preferredDate && isReq('preferredStartTime', true) && !data.preferredStartTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Pick a time slot for your preferred date',
        path: ['preferredStartTime'],
      });
    }
  });
}

export const bookingSchema = buildBookingSchema();

export type BookingFormData = z.infer<typeof bookingSchema>;
