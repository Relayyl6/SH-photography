'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { buildBookingSchema, bookingSchema, BookingFormData, STANDARD_BOOKING_FIELD_KEYS } from './schema';
import { BookingCalendar } from './BookingCalendar';
import { QuoteReceipt } from './QuoteReceipt';
import { AiAutofillAssistant } from './AiAutofillAssistant';
import { useAiAutofill } from './useAiAutofill';
import { Check, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';


import { BookingFieldDoc } from '@/types/firebase';

const steps = [
  'Service & Session Type',
  'Location & Logistics',
  'Creative Brief & Style',
  'Deliverables & Usage',
  'Budget & Timeline',
  'Contact Details',
  'Review & Submit'
];

function formatTimeLabel(hhmm?: string) {
  if (!hhmm) return '';
  const [hStr = '0', mStr = '00'] = hhmm.split(':');
  const h = Number(hStr);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${mStr} ${period}`;
}

// Maps ?service=<slug> URL param → serviceCategory radio value used in Step 1.
const slugToCategory: Record<string, BookingFormData['serviceCategory']> = {
  weddings: 'Wedding',
  birthdays: 'Event',
  birthday: 'Event',
  anniversaries: 'Event',
  graduations: 'Event',
  events: 'Event',
  sports: 'Event',
  portraits: 'Portrait',
  family: 'Portrait',
  personal: 'Portrait',
  'behind-the-scenes': 'Other',
  corporate: 'Portrait',
  'general-photography': 'Other',
  'general-photography-classes': 'Other',
  'photography-classes': 'Other',
  'retouching-classes': 'Retouching',
};

// Human-readable label shown in the pre-fill badge.
const slugToLabel: Record<string, string> = {
  weddings: 'Weddings',
  birthdays: 'Birthdays',
  birthday: 'Birthdays',
  anniversaries: 'Anniversaries',
  graduations: 'Graduations',
  events: 'Events',
  sports: 'Sports & Athletics',
  portraits: 'Portraits',
  family: 'Family Portraits',
  personal: 'Personal Branding',
  'behind-the-scenes': 'Behind the Scenes',
  corporate: 'Corporate Photography',
  'general-photography': 'General Photography',
  'general-photography-classes': 'Photography Classes',
  'photography-classes': 'Photography Classes',
  'retouching-classes': 'Retouching Classes',
};

function normalizeDate(val: any): string {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  const m = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m && m[1] && m[2] && m[3]) {
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${mo}-${day}`;
  }
  return trimmed;
}

function normalizeTime(val: any): string {
  if (!val || typeof val !== 'string') return '';
  const s = val.trim().toLowerCase();
  const m24 = s.match(/^(\d{1,2}):(\d{2})/);
  if (m24 && m24[1] && m24[2]) {
    return `${m24[1].padStart(2, '0')}:${m24[2]}`;
  }
  const m12 = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (m12 && m12[1]) {
    let h = Number(m12[1]);
    const min = m12[2] || '00';
    if (m12[3] === 'pm' && h < 12) h += 12;
    if (m12[3] === 'am' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${min}`;
  }
  return val;
}

function normalizeBudget(val: any): string {
  if (!val) return '';
  const valid = ['Under £500', '£500–£1,000', '£1,000–£2,500', '£2,500–£5,000', '£5,000+', 'Prefer to discuss'];
  if (valid.includes(val)) return val;
  const num = Number(String(val).replace(/[^0-9]/g, ''));
  if (num > 0) {
    if (num < 500) return 'Under £500';
    if (num <= 1000) return '£500–£1,000';
    if (num <= 2500) return '£1,000–£2,500';
    if (num <= 5000) return '£2,500–£5,000';
    return '£5,000+';
  }
  return val;
}

function normalizeDuration(val: any): string {
  if (!val) return '';
  const valid = ['30 min', '1 hr', '2 hrs', 'Half Day (4 hrs)', 'Full Day (8 hrs)', 'Multi-Day', 'Not sure'];
  if (valid.includes(val)) return val;
  const s = String(val).toLowerCase();
  if (s.includes('30') || s.includes('half hour')) return '30 min';
  if (s.includes('1') && (s.includes('hr') || s.includes('hour'))) return '1 hr';
  if (s.includes('2') && (s.includes('hr') || s.includes('hour'))) return '2 hrs';
  if (s.includes('half') || s.includes('4')) return 'Half Day (4 hrs)';
  if (s.includes('full') || s.includes('8') || s.includes('all day')) return 'Full Day (8 hrs)';
  if (s.includes('multi') || s.includes('days') || s.includes('weekend')) return 'Multi-Day';
  return val;
}

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<BookingFormData | null>(null);
  const [prefillLabel, setPrefillLabel] = useState<string | null>(null);
  const [cancellationPolicy, setCancellationPolicy] = useState<string | null>(null);
  const [fields, setFields] = useState<BookingFieldDoc[]>([]);

  const searchParams = useSearchParams();

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const { getBookingSettings, getBookingFields } = await import('@/lib/content');
        const [b, f] = await Promise.all([getBookingSettings(), getBookingFields()]);
        if (!isMounted) return;
        if (b?.cancellationPolicyText) {
          setCancellationPolicy(b.cancellationPolicyText);
        }
        if (f && f.length > 0) {
          setFields(f);
        }
      } catch (err) {
        console.warn('Error loading dynamic booking settings/fields:', err);
      }
    }
    loadData();

    // Live real-time listener for bookingFields so options configured in admin reflect instantly on live form
    let unsubFields: (() => void) | undefined;
    import('@/lib/firebase/config').then(({ db }) => {
      import('firebase/firestore').then(({ collection, onSnapshot }) => {
        if (!isMounted) return;
        unsubFields = onSnapshot(collection(db, 'bookingFields'), (snap) => {
          if (!isMounted) return;
          const liveList: BookingFieldDoc[] = [];
          snap.forEach((d) => {
            const data = d.data() as BookingFieldDoc;
            if (data.published !== false) {
              liveList.push({ ...data, id: d.id });
            }
          });
          liveList.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
          if (liveList.length > 0) {
            setFields(liveList);
          }
        });
      });
    });

    return () => {
      isMounted = false;
      if (unsubFields) unsubFields();
    };
  }, []);

  const isFieldRequired = (keyOrId: string, defaultRequired: boolean = false): boolean => {
    const field = fields.find((f) => f.key === keyOrId || f.id === keyOrId);
    if (field && typeof field.required === 'boolean') {
      return field.required;
    }
    return defaultRequired;
  };

  const getFieldLabel = (keyOrId: string, defaultLabel: string): string => {
    const field = fields.find((f) => f.key === keyOrId || f.id === keyOrId);
    return field?.label || defaultLabel;
  };

  const getFieldOptions = (keyOrId: string, fallback: string[]): Array<{ label: string; value: string }> => {
    const field = fields.find((f) => f.key === keyOrId || f.id === keyOrId);
    if (field?.options && Array.isArray(field.options) && field.options.length > 0) {
      return field.options.map((opt: any) => {
        if (typeof opt === 'string') return { label: opt, value: opt };
        return {
          label: opt.label || opt.value || '',
          value: opt.value || opt.label || '',
        };
      }).filter((o) => o.label && o.value);
    }
    return fallback.map((val) => ({ label: val, value: val }));
  };

  const dynamicSchema = useMemo(() => {
    return buildBookingSchema(fields);
  }, [fields]);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    control,
    setValue,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: (values, context, options) => {
      return zodResolver(dynamicSchema)(values, context, options);
    },
    defaultValues: {
      stylePreferences: [],
      deliverables: [],
    }
  });

  // Pre-fill serviceCategory from ?service= URL param on mount.
  useEffect(() => {
    const slug = searchParams.get('service');
    if (!slug) return;
    const cat = slugToCategory[slug];
    if (cat) {
      setValue('serviceCategory', cat, { shouldValidate: false });
    }
    const label = slugToLabel[slug];
    if (label) setPrefillLabel(label);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: BookingFormData) => {
    console.log('Form submitted:', data);

    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payload = {
      bookingId,
      sessionId: data.serviceCategory || 'general',
      sessionName: data.serviceCategory || 'Photography Session',
      date: data.preferredDate || new Date().toISOString().split('T')[0],
      timeSlot: { start: data.preferredStartTime || '10:00', end: '11:30' },
      customer: {
        name: data.fullName,
        email: data.email,
        phone: data.phone,
      },
      isDoubleDate: Boolean(data.isDoubleDate),
      secondaryDate: data.secondaryDate || null,
      multiDayCount: data.multiDayCount || (data.isDoubleDate ? '2 Days' : null),
      additionalDates: [
        ...(data.secondaryDate ? [data.secondaryDate] : []),
        ...(data.additionalDates || []),
      ],
      extraInfo: data.extraInfo || null,
      answers: data,
      customerUid: null,
    };

    let bookingSaved = false;
    let claimToken = '';

    // 1. Try server API
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let resData: any = {};
      try {
        resData = JSON.parse(text);
      } catch {
        resData = { error: text };
      }

      if (res.ok && resData.success) {
        bookingSaved = true;
        claimToken = resData.claimToken || '';
      } else if (res.status === 409) {
        // Slot collision
        alert(resData.error || 'The selected date/time is already reserved. Please choose an alternate date.');
        return;
      }
    } catch (apiErr) {
      console.warn('Server booking API note:', apiErr);
    }

    // 2. Direct Firestore fallback if server API failed or timed out
    if (!bookingSaved) {
      try {
        const { db } = await import('@/lib/firebase/config');
        const { doc, setDoc } = await import('firebase/firestore');
        const fallbackDoc = {
          id: bookingId,
          sessionId: payload.sessionId,
          sessionSnapshot: {
            name: payload.sessionName,
            price: 'Quote on Request',
            durationMinutes: 90,
          },
          slot: {
            date: payload.date,
            start: payload.timeSlot.start,
            end: payload.timeSlot.end,
          },
          isDoubleDate: payload.isDoubleDate,
          secondaryDate: payload.secondaryDate,
          multiDayCount: payload.multiDayCount,
          additionalDates: payload.additionalDates,
          extraInfo: payload.extraInfo,
          answers: data,
          customer: payload.customer,
          status: 'pending',
          ownerNotes: [],
          customerUid: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          source: 'web',
          emailStatus: { owner: 'queued', customer: 'queued' },
          statusHistory: [{ status: 'pending', by: data.fullName, at: Date.now() }],
        };

        await setDoc(doc(db, 'bookings', bookingId), fallbackDoc);
        bookingSaved = true;
      } catch (fsErr) {
        console.warn('Client direct save error:', fsErr);
      }
    }

    // 3. Save to local guest records & show confirmation
    try {
      const existing = JSON.parse(localStorage.getItem('sh_guest_bookings') || '[]');
      existing.push({
        bookingId,
        claimToken,
        sessionName: data.serviceCategory || 'Photography Session',
        date: data.preferredDate,
        status: 'pending',
        createdAt: Date.now(),
        answers: data,
      });
      localStorage.setItem('sh_guest_bookings', JSON.stringify(existing));
      localStorage.setItem('sh_latest_booking', JSON.stringify({
        bookingId,
        claimToken,
        date: data.preferredDate,
        status: 'pending',
      }));
    } catch {}

    setSubmittedData(data);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formData = watch();
  const serviceCat = watch('serviceCategory');
  const travelReq = watch('travelRequired');

  const customFields = useMemo(() => {
    return fields.filter((f) => {
      const k = f.key || f.id;
      if (!k || STANDARD_BOOKING_FIELD_KEYS.has(k)) return false;
      if (f.published === false) return false;
      if (!f.appliesTo || f.appliesTo === 'all') return true;
      if (Array.isArray(f.appliesTo)) {
        const arr = f.appliesTo as string[];
        if (arr.includes('all')) return true;
        if (serviceCat && arr.some((cat: string) => String(cat).toLowerCase() === String(serviceCat).toLowerCase())) return true;
        return false;
      }
      if (typeof f.appliesTo === 'string') {
        const str = String(f.appliesTo);
        if (str === 'all') return true;
        if (serviceCat && str.toLowerCase() === String(serviceCat).toLowerCase()) return true;
      }
      return true;
    });
  }, [fields, serviceCat]);

  const getFieldsForStep = (stepIdx: number): string[] => {
    switch(stepIdx) {
      case 0:
        return ['serviceCategory', 'preferredDate', 'preferredStartTime', 'dateFlexible'];
      case 1:
        return ['locationType', 'travelRequired'];
      case 2:
        return [
          'vision',
          'stylePreferences',
          'colorPreference',
          ...(customFields.map((f) => f.key || f.id)),
        ];
      case 3:
        return ['deliverables', 'turnaroundTime'];
      case 4:
        return ['budgetRange', 'budgetFlexible', 'howSoon', 'depositAck'];
      case 5:
        return ['fullName', 'email', 'phone', 'preferredContact'];
      case 6:
        return ['termsAgreed', 'privacyAgreed', 'contactConsent'];
      default:
        return [];
    }
  };

  const handleNext = async () => {
    const candidateFields = getFieldsForStep(currentStep);
    // Only validate fields on this step that are currently required per DB configuration
    const fieldsToValidate = candidateFields.filter((key) => isFieldRequired(key, true));

    const isStepValid = fieldsToValidate.length === 0 || (await trigger(fieldsToValidate as any));
    if (isStepValid) {
      setCurrentStep(s => Math.min(s + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onInvalid = (fieldErrors: any) => {
    console.warn('Form submission validation issues:', fieldErrors);
    const errorKeys = Object.keys(fieldErrors);
    for (let i = 0; i < steps.length; i++) {
      const stepFields = getFieldsForStep(i);
      if (stepFields.some((k) => errorKeys.includes(k))) {
        setCurrentStep(i);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyAiFields = (fields: Partial<BookingFormData>) => {
    const sanitized: Record<string, any> = { ...fields };

    if (sanitized.preferredDate) {
      sanitized.preferredDate = normalizeDate(sanitized.preferredDate);
      if (!sanitized.preferredStartTime) {
        sanitized.preferredStartTime = '11:00';
      }
    }
    if (sanitized.alternateDate) {
      sanitized.alternateDate = normalizeDate(sanitized.alternateDate);
    }
    if (sanitized.secondaryDate) {
      sanitized.secondaryDate = normalizeDate(sanitized.secondaryDate);
      sanitized.isDoubleDate = true;
    }
    if (sanitized.isDoubleDate) {
      sanitized.isDoubleDate = Boolean(sanitized.isDoubleDate);
    }
    if (sanitized.preferredStartTime) {
      sanitized.preferredStartTime = normalizeTime(sanitized.preferredStartTime);
    }
    if (sanitized.budgetRange) {
      sanitized.budgetRange = normalizeBudget(sanitized.budgetRange);
    }
    if (sanitized.estimatedDuration) {
      sanitized.estimatedDuration = normalizeDuration(sanitized.estimatedDuration);
    }

    Object.entries(sanitized).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        setValue(key as any, value as any, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    });
  };

  const aiAssistant = useAiAutofill({
    currentFormData: formData,
    onApplyFields: handleApplyAiFields,
  });

  if (isSubmitted && submittedData) {
    return (
      <QuoteReceipt
        data={submittedData}
        onReset={() => {
          setIsSubmitted(false);
          setSubmittedData(null);
          setCurrentStep(0);
        }}
      />
    );
  }

  return (
    <div className="w-full pt-1 sm:pt-3 pb-12">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12">
        <div className="flex-1 min-w-0">
          <header className="mb-6 space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight font-medium">Request a Quote</h1>
            <p className="text-sm sm:text-base text-ink/70 max-w-2xl leading-relaxed">
              Please provide as much detail as possible about your upcoming session. This helps me understand your vision and prepare an accurate, custom quote for you.
            </p>
          </header>

          {/* Mobile & Tablet: Top Auto-Fill Assistant (Closed by default, 1-click open) */}
          <div className="block lg:hidden mb-6 sm:mb-8">
            <AiAutofillAssistant
              controller={aiAssistant}
              onJumpToReview={() => {
                setCurrentStep(steps.length - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>

          {/* Progress Bar */}
          <div className="w-full mb-8 sm:mb-10">
            <div className="flex items-center justify-between gap-4 text-xs sm:text-sm text-ink/60 mb-2">
              <span className="font-semibold whitespace-nowrap shrink-0">Step {currentStep + 1} of {steps.length}</span>
              <span className="font-display text-right truncate text-ink/80">{steps[currentStep]}</span>
            </div>
            <div className="h-1.5 w-full bg-ink/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-ink"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {/* STEP 1 */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3 mb-6 sm:mb-8">
                      <h3 className="font-display text-2xl sm:text-3xl">Service &amp; Session Type</h3>
                      {prefillLabel && (
                        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                          Pre-filled for: {prefillLabel}
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium">Service Category{isFieldRequired('serviceCategory', true) ? ' *' : ''}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-3.5">
                        {getFieldOptions('serviceCategory', ['Wedding', 'Portrait', 'Event', 'Retouching', 'Other']).map(cat => (
                          <label
                            key={cat.value}
                            className={`border p-3 sm:p-3.5 md:p-4 rounded-xl cursor-pointer transition-all flex items-center justify-center min-w-0 select-none ${
                              formData.serviceCategory === cat.value
                                ? 'border-ink bg-ink text-paper shadow-sm font-semibold'
                                : 'border-ink/20 hover:border-ink bg-white/40'
                            }`}
                          >
                            <input
                              type="radio"
                              value={cat.value}
                              checked={formData.serviceCategory === cat.value}
                              {...register('serviceCategory')}
                              className="hidden"
                            />
                            <span className="block text-center text-xs sm:text-sm font-medium break-words leading-tight px-1">
                              {cat.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors.serviceCategory && <p className="text-red-500 text-sm">{errors.serviceCategory.message}</p>}
                    </div>

                    {serviceCat && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Session Sub-Type</label>
                        <input type="text" value={formData.sessionSubType ?? ''} {...register('sessionSubType')} placeholder={serviceCat === 'Wedding' ? 'e.g., Full Day, Ceremony Only' : 'e.g., Individual, Family'} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Subjects/People</label>
                        <input type="text" value={formData.numSubjects ?? ''} {...register('numSubjects')} placeholder="e.g., 2, or 50+" className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Estimated Duration</label>
                        <select value={formData.estimatedDuration ?? ''} {...register('estimatedDuration')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select duration...</option>
                          {getFieldOptions('estimatedDuration', ['30 min', '1 hr', '2 hrs', 'Half Day (4 hrs)', 'Full Day (8 hrs)', 'Multi-Day', 'Not sure']).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Date & Time{isFieldRequired('preferredDate', true) ? ' *' : ''}</label>
                      <Controller
                        name="preferredDate"
                        control={control}
                        render={({ field: dateField }) => (
                          <Controller
                            name="preferredStartTime"
                            control={control}
                            render={({ field: timeField }) => (
                              <BookingCalendar
                                selectedDate={dateField.value}
                                selectedTime={timeField.value}
                                onSelectDate={(iso) => {
                                  dateField.onChange(iso);
                                  timeField.onChange('');
                                }}
                                onSelectTime={(time) => timeField.onChange(time)}
                                dateError={errors.preferredDate?.message}
                                timeError={errors.preferredStartTime?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Alternate Date</label>
                        <input type="date" value={formData.alternateDate ?? ''} {...register('alternateDate')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                        <p className="text-xs text-ink/50 mt-1">Optional backup.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Is the date flexible?{isFieldRequired('dateFlexible', true) ? ' *' : ''}</label>
                        <div className="flex gap-4 h-[50px] items-center">
                          {getFieldOptions('dateFlexible', ['Yes', 'No']).map(opt => (
                            <label key={opt.value} className="flex items-center gap-2">
                              <input type="radio" value={opt.value} checked={formData.dateFlexible === opt.value} {...register('dateFlexible')} className="accent-ink" />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                        {errors.dateFlexible && <p className="text-red-500 text-sm">{errors.dateFlexible.message}</p>}
                      </div>
                    </div>

                    {/* Double Date / Multi-Day Option */}
                    <div className="pt-2 border-t border-ink/10 space-y-3">
                      <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.isDoubleDate ?? false}
                          {...register('isDoubleDate')}
                          className="accent-ink w-4 h-4"
                        />
                        <span>Need coverage across multiple or double dates? (e.g. 2-day wedding, 3-day workshop, 4-day festival)</span>
                      </label>

                      {formData.isDoubleDate && (
                        <div className="pl-4 border-l-2 border-ink/30 animate-in fade-in duration-200 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                                Shoot Duration (Days)
                              </label>
                              <select
                                value={formData.multiDayCount ?? '2 Days'}
                                {...register('multiDayCount')}
                                className="w-full p-2.5 border border-ink/20 bg-transparent text-sm focus:outline-none focus:border-ink"
                              >
                                {getFieldOptions('multiDayCount', ['2 Days', '3 Days', '4 Days', '5+ Days']).map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                                Day 2 / Secondary Shoot Date
                              </label>
                              <input
                                type="date"
                                value={formData.secondaryDate ?? ''}
                                {...register('secondaryDate')}
                                className="w-full p-2.5 border border-ink/20 bg-transparent text-sm focus:outline-none focus:border-ink"
                              >
                              </input>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                              Day 3, Day 4 or Additional Schedule Details (Optional)
                            </label>
                            <input
                              type="text"
                              value={formData.additionalDatesText ?? ''}
                              {...register('additionalDatesText')}
                              placeholder="e.g. Day 3: 2026-11-20, Day 4: 2026-11-21 (or date range)"
                              className="w-full max-w-lg p-2.5 border border-ink/20 bg-transparent text-sm focus:outline-none focus:border-ink"
                            />
                            <p className="text-xs text-ink/50 mt-1">
                              All specified shoot days will be held and locked once confirmed by Benedict in the owner dashboard.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8">Location & Logistics</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Shoot Location Type{isFieldRequired('locationType', true) ? ' *' : ''}</label>
                      <select value={formData.locationType ?? ''} {...register('locationType')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                        <option value="">Select location type...</option>
                        {getFieldOptions('locationType', ['Studio', "Client's Location", 'Outdoor', 'Venue', 'Multiple Locations', 'Other']).map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {errors.locationType && <p className="text-red-500 text-sm mt-1">{errors.locationType.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Full Address / Venue Name</label>
                        <input type="text" value={formData.address ?? ''} {...register('address')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">City, Postcode</label>
                        <input type="text" value={formData.cityPostcode ?? ''} {...register('cityPostcode')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Indoors or Outdoors?</label>
                        <select value={formData.indoorsOutdoors ?? ''} {...register('indoorsOutdoors')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          {getFieldOptions('indoorsOutdoors', ['Indoors', 'Outdoors', 'Both', 'Not Sure']).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Travel required?{isFieldRequired('travelRequired', true) ? ' *' : ''}</label>
                      <div className="flex gap-4 mb-2">
                        {getFieldOptions('travelRequired', ['Yes', 'No']).map(opt => (
                          <label key={opt.value} className="flex items-center gap-2">
                            <input type="radio" value={opt.value} checked={formData.travelRequired === opt.value} {...register('travelRequired')} className="accent-ink" />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                      {errors.travelRequired && <p className="text-red-500 text-sm">{errors.travelRequired.message}</p>}
                    </div>

                    {travelReq === 'Yes' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Travel Details (Distance / Overnight stay?)</label>
                        <textarea value={formData.travelDetails ?? ''} {...register('travelDetails')} rows={3} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink resize-none"></textarea>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">Parking / Access notes</label>
                      <textarea value={formData.parkingNotes ?? ''} {...register('parkingNotes')} rows={3} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink resize-none"></textarea>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8">Creative Brief & Style</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Describe your vision{isFieldRequired('vision', true) ? ' *' : ''}</label>
                      <p className="text-xs text-ink/60 mb-2">What mood, story, or feeling do you want captured?</p>
                      <textarea value={formData.vision ?? ''} {...register('vision')} rows={4} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink resize-none"></textarea>
                      {errors.vision && <p className="text-red-500 text-sm mt-1">{errors.vision.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Preferred Photography Style{isFieldRequired('stylePreferences', true) ? ' *' : ''}</label>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {getFieldOptions('stylePreferences', ['Candid', 'Posed', 'Documentary', 'Editorial', 'Fine Art', 'Lifestyle', 'Dramatic', 'Natural Light', 'Studio Lit', 'Vintage', 'Modern', 'Moody', 'Bright & Airy']).map(opt => {
                          const isSelected = formData.stylePreferences?.includes(opt.value) ?? false;
                          return (
                            <label key={opt.value} className={`flex items-center gap-2 p-2 px-3 border rounded-full cursor-pointer transition-colors text-sm ${isSelected ? 'border-ink bg-ink text-paper font-medium' : 'border-ink/20 hover:border-ink'}`}>
                              <input type="checkbox" value={opt.value} checked={isSelected} {...register('stylePreferences')} className="accent-ink" />
                              {opt.label}
                            </label>
                          );
                        })}
                      </div>
                      {errors.stylePreferences && <p className="text-red-500 text-sm mt-2">{errors.stylePreferences.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Color Preference{isFieldRequired('colorPreference', true) ? ' *' : ''}</label>
                        <select value={formData.colorPreference ?? ''} {...register('colorPreference')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          {getFieldOptions('colorPreference', ['Color', 'Black & White', 'Mix', "Benedict's choice"]).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.colorPreference && <p className="text-red-500 text-sm mt-1">{errors.colorPreference.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Inspiration Links</label>
                        <input type="text" value={formData.inspirationLinks ?? ''} {...register('inspirationLinks')} placeholder="Pinterest, Instagram, etc." className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Must-have shots</label>
                      <textarea value={formData.mustHaveShots ?? ''} {...register('mustHaveShots')} placeholder="e.g., family group photo, first dance, detail shots" rows={3} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink resize-none"></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Any special requests?</label>
                      <textarea value={formData.specialRequests ?? ''} {...register('specialRequests')} rows={2} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink resize-none"></textarea>
                    </div>

                    {/* Dynamic Vendor Custom Fields added from Admin Form Builder */}
                    {customFields.length > 0 && (
                      <div className="pt-4 border-t border-ink/10 space-y-5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-accent" />
                          <h4 className="font-display text-lg sm:text-xl text-ink">
                            Additional Session Specifications
                          </h4>
                        </div>
                        <div className="space-y-4">
                          {customFields.map((field) => {
                            const fieldKey = field.key || field.id;
                            const isReq = Boolean(field.required);
                            const currentVal = (formData as Record<string, any>)[fieldKey];
                            const fieldError = (errors as Record<string, any>)[fieldKey]?.message as string | undefined;

                            return (
                              <div key={field.id || field.key} className="space-y-1.5">
                                <label className="block text-sm font-medium">
                                  {field.label}
                                  {isReq && <span className="text-accent ml-0.5">*</span>}
                                </label>
                                {field.helpText && (
                                  <p className="text-xs text-ink/60">{field.helpText}</p>
                                )}

                                {field.type === 'textarea' ? (
                                  <textarea
                                    rows={3}
                                    placeholder={field.placeholder || ''}
                                    value={currentVal ?? ''}
                                    {...register(fieldKey as any)}
                                    className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink resize-none"
                                  />
                                ) : field.type === 'select' ? (
                                  <select
                                    value={currentVal ?? ''}
                                    {...register(fieldKey as any)}
                                    className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink"
                                  >
                                    <option value="">{field.placeholder || 'Select...'}</option>
                                    {(field.options || []).map((opt: any) => {
                                      const val = typeof opt === 'string' ? opt : (opt.value || opt.label);
                                      const lbl = typeof opt === 'string' ? opt : (opt.label || opt.value);
                                      return <option key={val} value={val}>{lbl}</option>;
                                    })}
                                  </select>
                                ) : field.type === 'radio' ? (
                                  <div className="flex flex-wrap gap-4 pt-1">
                                    {(field.options || []).map((opt: any) => {
                                      const val = typeof opt === 'string' ? opt : (opt.value || opt.label);
                                      const lbl = typeof opt === 'string' ? opt : (opt.label || opt.value);
                                      return (
                                        <label key={val} className="flex items-center gap-2 cursor-pointer text-sm">
                                          <input
                                            type="radio"
                                            value={val}
                                            checked={currentVal === val}
                                            {...register(fieldKey as any)}
                                            className="accent-ink"
                                          />
                                          <span>{lbl}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : field.type === 'checkbox' ? (
                                  <div className="flex flex-wrap gap-2.5 pt-1">
                                    {(field.options || []).map((opt: any) => {
                                      const val = typeof opt === 'string' ? opt : (opt.value || opt.label);
                                      const lbl = typeof opt === 'string' ? opt : (opt.label || opt.value);
                                      const currentArr: string[] = Array.isArray(currentVal) ? currentVal : [];
                                      const isChecked = currentArr.includes(val);
                                      return (
                                        <label
                                          key={val}
                                          className={`flex items-center gap-2 px-3 py-1.5 border rounded-full cursor-pointer text-xs sm:text-sm transition-colors ${
                                            isChecked
                                              ? 'border-ink bg-ink text-paper font-medium'
                                              : 'border-ink/20 hover:border-ink'
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            value={val}
                                            checked={isChecked}
                                            {...register(fieldKey as any)}
                                            className="hidden"
                                          />
                                          <span>{lbl}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : field.type === 'date' ? (
                                  <input
                                    type="date"
                                    value={currentVal ?? ''}
                                    {...register(fieldKey as any)}
                                    className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink"
                                  />
                                ) : field.type === 'number' ? (
                                  <input
                                    type="number"
                                    placeholder={field.placeholder || ''}
                                    value={currentVal ?? ''}
                                    {...register(fieldKey as any)}
                                    className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink"
                                  />
                                ) : field.type === 'email' ? (
                                  <input
                                    type="email"
                                    placeholder={field.placeholder || 'name@example.com'}
                                    value={currentVal ?? ''}
                                    {...register(fieldKey as any)}
                                    className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink"
                                  />
                                ) : field.type === 'phone' ? (
                                  <input
                                    type="tel"
                                    placeholder={field.placeholder || '+44 ...'}
                                    value={currentVal ?? ''}
                                    {...register(fieldKey as any)}
                                    className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    placeholder={field.placeholder || ''}
                                    value={currentVal ?? ''}
                                    {...register(fieldKey as any)}
                                    className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink"
                                  />
                                )}

                                {fieldError && (
                                  <p className="text-red-500 text-xs sm:text-sm mt-1">{fieldError}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Additional Details &amp; Custom Requests <span className="text-xs text-ink/50 font-normal">(anything else we didn&apos;t account for)</span>
                      </label>
                      <p className="text-xs text-ink/60 mb-2">Tell us about accessibility, multi-location logistics, custom timelines, props, equipment, or any specific requirements.</p>
                      <textarea
                        value={formData.extraInfo ?? ''}
                        {...register('extraInfo')}
                        placeholder="Tell us anything else we didn't account for..."
                        rows={3}
                        className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8">Deliverables & Usage</h3>

                    <div>
                      <label className="block text-sm font-medium mb-3">What do you want delivered?{isFieldRequired('deliverables', true) ? ' *' : ''}</label>
                      <div className="flex flex-col gap-3">
                        {getFieldOptions('deliverables', ['Edited digital images', 'Prints', 'Album/Book', 'Canvas/Wall art', 'Social media package', 'Video/Hybrid coverage']).map(opt => {
                          const isSelected = formData.deliverables?.includes(opt.value) ?? false;
                          return (
                            <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" value={opt.value} checked={isSelected} {...register('deliverables')} className="accent-ink w-4 h-4" />
                              <span className={isSelected ? 'font-medium text-ink' : 'text-ink/80'}>{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      {errors.deliverables && <p className="text-red-500 text-sm mt-2">{errors.deliverables.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Edited images expected</label>
                        <select value={formData.editedImagesExpected ?? ''} {...register('editedImagesExpected')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          {getFieldOptions('editedImagesExpected', ['10–25', '25–50', '50–100', '100–250', '250+', 'Not sure']).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Turnaround time needed{isFieldRequired('turnaroundTime', true) ? ' *' : ''}</label>
                        <select value={formData.turnaroundTime ?? ''} {...register('turnaroundTime')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          {getFieldOptions('turnaroundTime', ['Standard (2–3 weeks)', 'Rush (under 1 week)', 'Flexible']).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.turnaroundTime && <p className="text-red-500 text-sm mt-1">{errors.turnaroundTime.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Usage Rights Needed</label>
                        <select value={formData.usageRights ?? ''} {...register('usageRights')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          {getFieldOptions('usageRights', ['Personal use', 'Social media', 'Commercial', 'Editorial', 'Advertising', 'Full buyout']).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Do you need a second shooter?</label>
                        <select value={formData.secondShooter ?? ''} {...register('secondShooter')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          {getFieldOptions('secondShooter', ['Yes', 'No', 'Recommend for me']).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5 */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8">Budget & Timeline</h3>

                    <div>
                      <label className="block text-sm font-medium mb-4">Budget Range{isFieldRequired('budgetRange', true) ? ' *' : ''}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                        {getFieldOptions('budgetRange', ['Under £500', '£500–£1,000', '£1,000–£2,500', '£2,500–£5,000', '£5,000+', 'Prefer to discuss']).map(opt => (
                          <label key={opt.value} className={`border p-3 sm:p-4 cursor-pointer transition-colors ${formData.budgetRange === opt.value ? 'border-ink bg-ink text-paper' : 'border-ink/20 hover:border-ink'}`}>
                            <input type="radio" value={opt.value} checked={formData.budgetRange === opt.value} {...register('budgetRange')} className="hidden" />
                            <span className="block text-center text-sm">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.budgetRange && <p className="text-red-500 text-sm mt-2">{errors.budgetRange.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Is budget flexible?{isFieldRequired('budgetFlexible', true) ? ' *' : ''}</label>
                        <select value={formData.budgetFlexible ?? ''} {...register('budgetFlexible')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          {getFieldOptions('budgetFlexible', ['Yes', 'No', 'Slightly']).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.budgetFlexible && <p className="text-red-500 text-sm mt-1">{errors.budgetFlexible.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">How soon do you need to book?{isFieldRequired('howSoon', true) ? ' *' : ''}</label>
                        <select value={formData.howSoon ?? ''} {...register('howSoon')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          {getFieldOptions('howSoon', ['ASAP', 'Within 2 weeks', 'Within a month', '1–3 months', 'Just planning ahead']).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.howSoon && <p className="text-red-500 text-sm mt-1">{errors.howSoon.message}</p>}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-ink/10">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={!!formData.depositAck} {...register('depositAck')} className="mt-1 accent-ink w-4 h-4 shrink-0" />
                        <span className="text-sm">I understand a deposit is required to secure the date{isFieldRequired('depositAck', true) ? ' *' : ''}</span>
                      </label>
                      {errors.depositAck && <p className="text-red-500 text-sm mt-1 ml-7">{errors.depositAck.message}</p>}
                    </div>
                  </div>
                )}

                {/* STEP 6 */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8">Contact Details</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name{isFieldRequired('fullName', true) ? ' *' : ''}</label>
                        <input type="text" value={formData.fullName ?? ''} {...register('fullName')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email{isFieldRequired('email', true) ? ' *' : ''}</label>
                        <input type="email" value={formData.email ?? ''} {...register('email')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone{isFieldRequired('phone', true) ? ' *' : ''}</label>
                        <input type="tel" value={formData.phone ?? ''} {...register('phone')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Preferred contact method{isFieldRequired('preferredContact', true) ? ' *' : ''}</label>
                        <select value={formData.preferredContact ?? ''} {...register('preferredContact')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          {getFieldOptions('preferredContact', ['Email', 'Phone', 'WhatsApp']).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.preferredContact && <p className="text-red-500 text-sm mt-1">{errors.preferredContact.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Company/Brand Name</label>
                        <input type="text" value={formData.companyName ?? ''} {...register('companyName')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Instagram Handle</label>
                        <input type="text" value={formData.instagramHandle ?? ''} {...register('instagramHandle')} placeholder="@username" className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">How did you find me?</label>
                      <select value={formData.howDidYouFindMe ?? ''} {...register('howDidYouFindMe')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                        <option value="">Select...</option>
                        {getFieldOptions('howDidYouFindMe', ['Instagram', 'Google', 'Referral', 'Venue', 'Repeat Client', 'Other']).map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 7 */}
                {currentStep === 6 && (
                  <div className="space-y-8">
                    <h3 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8">Final Review & Submit</h3>

                    <div className="space-y-4 pt-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={!!formData.termsAgreed} {...register('termsAgreed')} className="mt-1 accent-ink w-4 h-4 shrink-0" />
                        <span className="text-sm">I agree to the Terms & Conditions *</span>
                      </label>
                      {errors.termsAgreed && <p className="text-red-500 text-sm ml-7">{errors.termsAgreed.message}</p>}

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={!!formData.privacyAgreed} {...register('privacyAgreed')} className="mt-1 accent-ink w-4 h-4 shrink-0" />
                        <span className="text-sm">I agree to the Privacy Policy *</span>
                      </label>
                      {errors.privacyAgreed && <p className="text-red-500 text-sm ml-7">{errors.privacyAgreed.message}</p>}

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={!!formData.contactConsent} {...register('contactConsent')} className="mt-1 accent-ink w-4 h-4 shrink-0" />
                        <span className="text-sm">I consent to being contacted about this inquiry *</span>
                      </label>
                      {errors.contactConsent && <p className="text-red-500 text-sm ml-7">{errors.contactConsent.message}</p>}

                      {cancellationPolicy && (
                        <div className="mt-4 p-4 rounded-2xl bg-sand/60 border border-line/60 text-xs text-ink/75 space-y-1">
                          <p className="font-semibold text-ink uppercase tracking-wider text-[10px]">Studio Cancellation Policy</p>
                          <p className="leading-relaxed">{cancellationPolicy}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-ink/10">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 sm:px-6 py-3 border border-ink/20 hover:bg-ink/5 transition-colors text-sm sm:text-base"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-ink text-paper hover:bg-ink/90 transition-colors text-sm sm:text-base"
                >
                  Next Step
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-[#e8491c] text-paper font-medium hover:bg-[#e8491c]/90 transition-colors text-sm sm:text-base"
                >
                  Request My Quote
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Live Summary Sidebar (Sticky on desktop, stacked on mobile) */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 mt-8 lg:mt-0">
          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="rounded-2xl sm:rounded-3xl border border-line/70 bg-sand/30 p-5 sm:p-6 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink/10">
                <h3 className="font-display text-xl">Live Summary</h3>
                <span className="text-[10px] uppercase font-bold text-accent tracking-wider bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                  Auto-sync
                </span>
              </div>
              
              <div className="space-y-6">
                {/* Service */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-sm text-ink/60 uppercase tracking-widest">Service</h4>
                    {currentStep > 0 && <button onClick={() => setCurrentStep(0)} className="text-xs text-[#e8491c] hover:underline">Edit</button>}
                  </div>
                  {formData.serviceCategory ? (
                    <>
                      <p className="text-sm font-semibold">{formData.serviceCategory} {formData.sessionSubType && `- ${formData.sessionSubType}`}</p>
                      <p className="text-xs text-ink/80 mt-1">
                        {formData.preferredDate}
                        {formData.preferredStartTime && ` at ${formatTimeLabel(formData.preferredStartTime)}`}
                        {formData.dateFlexible === 'Yes' ? ' (Flexible)' : ''}
                      </p>
                    </>
                  ) : <p className="text-xs text-ink/40 italic">Pending...</p>}
                </div>

                {/* Logistics */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-sm text-ink/60 uppercase tracking-widest">Location</h4>
                    {currentStep > 1 && <button onClick={() => setCurrentStep(1)} className="text-xs text-[#e8491c] hover:underline">Edit</button>}
                  </div>
                  {formData.locationType ? (
                    <p className="text-sm">{formData.locationType} <br/><span className="text-xs text-ink/80">{formData.address || 'Address TBD'}</span></p>
                  ) : <p className="text-xs text-ink/40 italic">Pending...</p>}
                </div>

                {/* Creative */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-sm text-ink/60 uppercase tracking-widest">Style</h4>
                    {currentStep > 2 && <button onClick={() => setCurrentStep(2)} className="text-xs text-[#e8491c] hover:underline">Edit</button>}
                  </div>
                  {(formData.stylePreferences?.length ?? 0) > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.stylePreferences?.map((s: string) => <span key={s} className="text-[10px] bg-ink/10 px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  ) : <p className="text-xs text-ink/40 italic">Pending...</p>}
                </div>

                {/* Deliverables */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-sm text-ink/60 uppercase tracking-widest">Deliverables</h4>
                    {currentStep > 3 && <button onClick={() => setCurrentStep(3)} className="text-xs text-[#e8491c] hover:underline">Edit</button>}
                  </div>
                  {(formData.deliverables?.length ?? 0) > 0 ? (
                    <p className="text-xs leading-relaxed">{formData.deliverables?.join(', ')}</p>
                  ) : <p className="text-xs text-ink/40 italic">Pending...</p>}
                </div>

                {/* Budget */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-sm text-ink/60 uppercase tracking-widest">Budget</h4>
                    {currentStep > 4 && <button onClick={() => setCurrentStep(4)} className="text-xs text-[#e8491c] hover:underline">Edit</button>}
                  </div>
                  {formData.budgetRange ? (
                    <p className="text-sm font-medium text-[#e8491c]">{formData.budgetRange}</p>
                  ) : <p className="text-xs text-ink/40 italic">Pending...</p>}
                </div>
              </div>
            </div>

            {/* Desktop: Auto-Fill Assistant placed directly below Live Summary */}
            <div className="hidden lg:block">
              <AiAutofillAssistant
                controller={aiAssistant}
                layout="sidebar"
                onJumpToReview={() => {
                  setCurrentStep(steps.length - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
