'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingSchema, BookingFormData } from './schema';
import { BookingCalendar } from './BookingCalendar';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

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

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    control,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      stylePreferences: [],
      deliverables: [],
    }
  });

  const onSubmit = (data: BookingFormData) => {
    console.log('Form submitted:', data);
    setIsSubmitted(true);
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof BookingFormData)[] = [];

    switch(currentStep) {
      case 0:
        fieldsToValidate = ['serviceCategory', 'preferredDate', 'preferredStartTime', 'dateFlexible'];
        break;
      case 1:
        fieldsToValidate = ['locationType', 'travelRequired'];
        break;
      case 2:
        fieldsToValidate = ['vision', 'stylePreferences', 'colorPreference'];
        break;
      case 3:
        fieldsToValidate = ['deliverables', 'turnaroundTime'];
        break;
      case 4:
        fieldsToValidate = ['budgetRange', 'budgetFlexible', 'howSoon', 'depositAck'];
        break;
      case 5:
        fieldsToValidate = ['fullName', 'email', 'phone', 'preferredContact'];
        break;
      case 6:
        fieldsToValidate = ['termsAgreed', 'privacyAgreed', 'contactConsent'];
        break;
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep(s => Math.min(s + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center px-4">
        <div className="w-16 h-16 bg-[#faf7f2] border border-ink text-[#e8491c] rounded-full flex items-center justify-center mx-auto mb-8">
          <Check size={32} />
        </div>
        <h2 className="font-display text-4xl text-ink mb-4">Request Received</h2>
        <p className="text-ink/70 text-lg mb-8">
          Thank you for your inquiry. I will review your details and respond within 24–48 hours with a custom quote.
        </p>
        <a href="/" className="inline-block px-8 py-4 bg-ink text-paper hover:bg-ink/90 transition-colors">
          Return Home
        </a>
      </div>
    );
  }

  const formData = watch();
  const serviceCat = watch('serviceCategory');
  const travelReq = watch('travelRequired');

  return (
    <div className="w-full py-12">
      {/* Progress Bar */}
      <div className="w-full mb-12">
        <div className="flex items-center justify-between text-sm text-ink/60 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span className="font-display">{steps[currentStep]}</span>
        </div>
        <div className="h-1 w-full bg-ink/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-ink"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#faf7f2] p-6 sm:p-8 md:p-12 shadow-sm border border-ink/5"
              >
                {/* STEP 1 */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8">Service & Session Type</h3>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium">Service Category *</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        {['Wedding', 'Portrait', 'Event', 'Retouching', 'Other'].map(cat => (
                          <label key={cat} className={`border p-3 sm:p-4 cursor-pointer transition-colors ${formData.serviceCategory === cat ? 'border-ink bg-ink text-paper' : 'border-ink/20 hover:border-ink'}`}>
                            <input type="radio" value={cat} {...register('serviceCategory')} className="hidden" />
                            <span className="block text-center text-sm sm:text-base">{cat}</span>
                          </label>
                        ))}
                      </div>
                      {errors.serviceCategory && <p className="text-red-500 text-sm">{errors.serviceCategory.message}</p>}
                    </div>

                    {serviceCat && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Session Sub-Type</label>
                        <input type="text" {...register('sessionSubType')} placeholder={serviceCat === 'Wedding' ? 'e.g., Full Day, Ceremony Only' : 'e.g., Individual, Family'} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Subjects/People</label>
                        <input type="text" {...register('numSubjects')} placeholder="e.g., 2, or 50+" className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Estimated Duration</label>
                        <select {...register('estimatedDuration')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select duration...</option>
                          <option value="30 min">30 min</option>
                          <option value="1 hr">1 hr</option>
                          <option value="2 hrs">2 hrs</option>
                          <option value="Half Day (4 hrs)">Half Day (4 hrs)</option>
                          <option value="Full Day (8 hrs)">Full Day (8 hrs)</option>
                          <option value="Multi-Day">Multi-Day</option>
                          <option value="Not sure">Not sure</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Date & Time *</label>
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
                        <input type="date" {...register('alternateDate')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                        <p className="text-xs text-ink/50 mt-1">Optional backup.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Is the date flexible? *</label>
                        <div className="flex gap-4 h-[50px] items-center">
                          <label className="flex items-center gap-2"><input type="radio" value="Yes" {...register('dateFlexible')} className="accent-ink" /> Yes</label>
                          <label className="flex items-center gap-2"><input type="radio" value="No" {...register('dateFlexible')} className="accent-ink" /> No</label>
                        </div>
                        {errors.dateFlexible && <p className="text-red-500 text-sm">{errors.dateFlexible.message}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8">Location & Logistics</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Shoot Location Type *</label>
                      <select {...register('locationType')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                        <option value="">Select location type...</option>
                        <option value="Studio">Studio</option>
                        <option value="Client's Location">Client's Location</option>
                        <option value="Outdoor">Outdoor</option>
                        <option value="Venue">Venue</option>
                        <option value="Multiple Locations">Multiple Locations</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.locationType && <p className="text-red-500 text-sm mt-1">{errors.locationType.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Full Address / Venue Name</label>
                        <input type="text" {...register('address')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">City, Postcode</label>
                        <input type="text" {...register('cityPostcode')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Indoors or Outdoors?</label>
                        <select {...register('indoorsOutdoors')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          <option value="Indoors">Indoors</option>
                          <option value="Outdoors">Outdoors</option>
                          <option value="Both">Both</option>
                          <option value="Not Sure">Not Sure</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Travel required? *</label>
                      <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2"><input type="radio" value="Yes" {...register('travelRequired')} className="accent-ink" /> Yes</label>
                        <label className="flex items-center gap-2"><input type="radio" value="No" {...register('travelRequired')} className="accent-ink" /> No</label>
                      </div>
                      {errors.travelRequired && <p className="text-red-500 text-sm">{errors.travelRequired.message}</p>}
                    </div>

                    {travelReq === 'Yes' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Travel Details (Distance / Overnight stay?)</label>
                        <textarea {...register('travelDetails')} rows={3} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink resize-none"></textarea>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">Parking / Access notes</label>
                      <textarea {...register('parkingNotes')} rows={3} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink resize-none"></textarea>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8">Creative Brief & Style</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Describe your vision *</label>
                      <p className="text-xs text-ink/60 mb-2">What mood, story, or feeling do you want captured?</p>
                      <textarea {...register('vision')} rows={4} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink resize-none"></textarea>
                      {errors.vision && <p className="text-red-500 text-sm mt-1">{errors.vision.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Preferred Photography Style *</label>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {['Candid', 'Posed', 'Documentary', 'Editorial', 'Fine Art', 'Lifestyle', 'Dramatic', 'Natural Light', 'Studio Lit', 'Vintage', 'Modern', 'Moody', 'Bright & Airy'].map(style => (
                          <label key={style} className="flex items-center gap-2 p-2 px-3 border border-ink/20 rounded-full cursor-pointer hover:border-ink text-sm">
                            <input type="checkbox" value={style} {...register('stylePreferences')} className="accent-ink" />
                            {style}
                          </label>
                        ))}
                      </div>
                      {errors.stylePreferences && <p className="text-red-500 text-sm mt-2">{errors.stylePreferences.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Color Preference *</label>
                        <select {...register('colorPreference')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          <option value="Color">Color</option>
                          <option value="Black & White">Black & White</option>
                          <option value="Mix">Mix</option>
                          <option value="Benedict's choice">Benedict's choice</option>
                        </select>
                        {errors.colorPreference && <p className="text-red-500 text-sm mt-1">{errors.colorPreference.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Inspiration Links</label>
                        <input type="text" {...register('inspirationLinks')} placeholder="Pinterest, Instagram, etc." className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Must-have shots</label>
                      <textarea {...register('mustHaveShots')} placeholder="e.g., family group photo, first dance, detail shots" rows={3} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink resize-none"></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Any special requests?</label>
                      <textarea {...register('specialRequests')} rows={2} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink resize-none"></textarea>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8">Deliverables & Usage</h3>

                    <div>
                      <label className="block text-sm font-medium mb-3">What do you want delivered? *</label>
                      <div className="flex flex-col gap-3">
                        {['Edited digital images', 'Prints', 'Album/Book', 'Canvas/Wall art', 'Social media package', 'Video/Hybrid coverage'].map(item => (
                          <label key={item} className="flex items-center gap-3">
                            <input type="checkbox" value={item} {...register('deliverables')} className="accent-ink w-4 h-4" />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                      {errors.deliverables && <p className="text-red-500 text-sm mt-2">{errors.deliverables.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Edited images expected</label>
                        <select {...register('editedImagesExpected')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          <option value="10–25">10–25</option>
                          <option value="25–50">25–50</option>
                          <option value="50–100">50–100</option>
                          <option value="100–250">100–250</option>
                          <option value="250+">250+</option>
                          <option value="Not sure">Not sure</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Turnaround time needed *</label>
                        <select {...register('turnaroundTime')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          <option value="Standard (2–3 weeks)">Standard (2–3 weeks)</option>
                          <option value="Rush (under 1 week)">Rush (under 1 week)</option>
                          <option value="Flexible">Flexible</option>
                        </select>
                        {errors.turnaroundTime && <p className="text-red-500 text-sm mt-1">{errors.turnaroundTime.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Usage Rights Needed</label>
                        <select {...register('usageRights')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          <option value="Personal use">Personal use</option>
                          <option value="Social media">Social media</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Editorial">Editorial</option>
                          <option value="Advertising">Advertising</option>
                          <option value="Full buyout">Full buyout</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Do you need a second shooter?</label>
                        <select {...register('secondShooter')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Recommend for me">Recommend for me</option>
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
                      <label className="block text-sm font-medium mb-4">Budget Range *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {['Under £500', '£500–£1,000', '£1,000–£2,500', '£2,500–£5,000', '£5,000+', 'Prefer to discuss'].map(range => (
                          <label key={range} className={`border p-3 sm:p-4 cursor-pointer transition-colors ${formData.budgetRange === range ? 'border-ink bg-ink text-paper' : 'border-ink/20 hover:border-ink'}`}>
                            <input type="radio" value={range} {...register('budgetRange')} className="hidden" />
                            <span className="block text-center text-sm">{range}</span>
                          </label>
                        ))}
                      </div>
                      {errors.budgetRange && <p className="text-red-500 text-sm mt-2">{errors.budgetRange.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Is budget flexible? *</label>
                        <select {...register('budgetFlexible')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Slightly">Slightly</option>
                        </select>
                        {errors.budgetFlexible && <p className="text-red-500 text-sm mt-1">{errors.budgetFlexible.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">How soon do you need to book? *</label>
                        <select {...register('howSoon')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          <option value="ASAP">ASAP</option>
                          <option value="Within 2 weeks">Within 2 weeks</option>
                          <option value="Within a month">Within a month</option>
                          <option value="1–3 months">1–3 months</option>
                          <option value="Just planning ahead">Just planning ahead</option>
                        </select>
                        {errors.howSoon && <p className="text-red-500 text-sm mt-1">{errors.howSoon.message}</p>}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-ink/10">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" {...register('depositAck')} className="mt-1 accent-ink w-4 h-4 shrink-0" />
                        <span className="text-sm">I understand a deposit is required to secure the date *</span>
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
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <input type="text" {...register('fullName')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <input type="email" {...register('email')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <input type="tel" {...register('phone')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Preferred contact method *</label>
                        <select {...register('preferredContact')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                          <option value="">Select...</option>
                          <option value="Email">Email</option>
                          <option value="Phone">Phone</option>
                          <option value="WhatsApp">WhatsApp</option>
                        </select>
                        {errors.preferredContact && <p className="text-red-500 text-sm mt-1">{errors.preferredContact.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Company/Brand Name</label>
                        <input type="text" {...register('companyName')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Instagram Handle</label>
                        <input type="text" {...register('instagramHandle')} placeholder="@username" className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">How did you find me?</label>
                      <select {...register('howDidYouFindMe')} className="w-full p-3 border border-ink/20 bg-transparent focus:outline-none focus:border-ink">
                        <option value="">Select...</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Google">Google</option>
                        <option value="Referral">Referral</option>
                        <option value="Venue">Venue</option>
                        <option value="Repeat Client">Repeat Client</option>
                        <option value="Other">Other</option>
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
                        <input type="checkbox" {...register('termsAgreed')} className="mt-1 accent-ink w-4 h-4 shrink-0" />
                        <span className="text-sm">I agree to the Terms & Conditions *</span>
                      </label>
                      {errors.termsAgreed && <p className="text-red-500 text-sm ml-7">{errors.termsAgreed.message}</p>}

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" {...register('privacyAgreed')} className="mt-1 accent-ink w-4 h-4 shrink-0" />
                        <span className="text-sm">I agree to the Privacy Policy *</span>
                      </label>
                      {errors.privacyAgreed && <p className="text-red-500 text-sm ml-7">{errors.privacyAgreed.message}</p>}

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" {...register('contactConsent')} className="mt-1 accent-ink w-4 h-4 shrink-0" />
                        <span className="text-sm">I consent to being contacted about this inquiry *</span>
                      </label>
                      {errors.contactConsent && <p className="text-red-500 text-sm ml-7">{errors.contactConsent.message}</p>}
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

        {/* Live Summary Sidebar (Sticky) */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-28 bg-[#faf7f2] border border-ink/10 p-6 shadow-sm rounded-lg">
            <h3 className="font-display text-xl mb-6 pb-4 border-b border-ink/10">Live Summary</h3>
            
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
                {formData.stylePreferences?.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.stylePreferences.map(s => <span key={s} className="text-[10px] bg-ink/10 px-2 py-0.5 rounded-full">{s}</span>)}
                  </div>
                ) : <p className="text-xs text-ink/40 italic">Pending...</p>}
              </div>

              {/* Deliverables */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium text-sm text-ink/60 uppercase tracking-widest">Deliverables</h4>
                  {currentStep > 3 && <button onClick={() => setCurrentStep(3)} className="text-xs text-[#e8491c] hover:underline">Edit</button>}
                </div>
                {formData.deliverables?.length > 0 ? (
                  <p className="text-xs leading-relaxed">{formData.deliverables.join(', ')}</p>
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
        </div>
      </div>
    </div>
  );
}
