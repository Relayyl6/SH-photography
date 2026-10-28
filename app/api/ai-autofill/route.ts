import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-pro-preview'];

export async function POST(req: Request) {
  try {
    const { transcript, currentData, conversationHistory } = await req.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI Auto-Fill is not configured. Please set GEMINI_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return NextResponse.json({ error: 'Please provide event details or speak your request.' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = `You are an expert booking assistant for Benedict Henry at SH Photography (Manchester, UK).
Your task is to analyze the user's natural language event description (which may be typed or transcribed from speech) and extract all relevant booking form fields into structured JSON.

Today's date is: ${today}.
If the user mentions relative dates like "next month", "this summer", or "in October", compute a realistic date in YYYY-MM-DD format (year 2026 or 2027).

The allowed values and exact field names are:
- serviceCategory: exactly one of: 'Wedding' | 'Portrait' | 'Event' | 'Retouching' | 'Other'
- sessionSubType: string (e.g. 'Full Day Wedding', 'Maternity', 'Graduation', 'Milestone Birthday', 'Corporate Gala', 'Studio Beauty')
- numSubjects: string (e.g. '1-2', '3-5', '50-100', '120 guests')
- estimatedDuration: exactly one of: '30 min' | '1 hr' | '2 hrs' | 'Half Day (4 hrs)' | 'Full Day (8 hrs)' | 'Multi-Day' | 'Not sure'
- preferredDate: string in 'YYYY-MM-DD' format (e.g. '2026-09-12'). Leave null if not mentioned.
- alternateDate: string in 'YYYY-MM-DD' format (backup date if user mentions 'or backup date...', 'alternatively...', 'or next week...', 'either X or Y', 'backup is...'). Leave null if not mentioned.
- preferredStartTime: string in 'HH:mm' format (e.g. '10:00', '11:00', '14:00', '15:00'). Leave null if not mentioned.
- dateFlexible: 'Yes' | 'No'
- locationType: exactly one of: 'Studio' | "Client's Location" | 'Outdoor' | 'Venue' | 'Multiple Locations' | 'Other'
- address: string (venue name or street)
- cityPostcode: string (city or postcode, e.g. 'Manchester' or 'Salford M3')
- indoorsOutdoors: 'Indoors' | 'Outdoors' | 'Both' | 'Not Sure'
- travelRequired: 'Yes' | 'No'
- travelDetails: string (if outside Manchester or travel needed)
- parkingNotes: string
- vision: string (summarize their vision, mood, theme, story)
- stylePreferences: array of strings matching: ['Candid', 'Posed', 'Documentary', 'Editorial', 'Fine Art', 'Lifestyle', 'Dramatic', 'Natural Light', 'Studio Lit', 'Vintage', 'Modern', 'Moody', 'Bright & Airy']
- colorPreference: exactly one of: 'Color' | 'Black & White' | 'Mix' | "Benedict's choice"
- inspirationLinks: string
- mustHaveShots: string (key requested photos)
- specialRequests: string
- deliverables: array of strings matching: ['Edited digital images', 'Prints', 'Album/Book', 'Canvas/Wall art', 'Social media package', 'Video/Hybrid coverage']
- editedImagesExpected: exactly one of: '10–25' | '25–50' | '50–100' | '100–250' | '250+' | 'Not sure'
- turnaroundTime: exactly one of: 'Standard (2–3 weeks)' | 'Rush (under 1 week)' | 'Flexible'
- usageRights: exactly one of: 'Personal use' | 'Social media' | 'Commercial' | 'Editorial' | 'Advertising' | 'Full buyout'
- secondShooter: exactly one of: 'Yes' | 'No' | 'Recommend for me'
- budgetRange: exactly one of: 'Under £500' | '£500–£1,000' | '£1,000–£2,500' | '£2,500–£5,000' | '£5,000+' | 'Prefer to discuss'
- budgetFlexible: 'Yes' | 'No' | 'Slightly'
- howSoon: exactly one of: 'ASAP' | 'Within 2 weeks' | 'Within a month' | '1–3 months' | 'Just planning ahead'
- fullName: string (MUST use key 'fullName', not 'clientName' or 'name')
- email: string (MUST use key 'email', not 'clientEmail')
- phone: string (MUST use key 'phone', not 'clientPhone')
- preferredContact: exactly one of: 'Email' | 'Phone' | 'WhatsApp'
- companyName: string
- instagramHandle: string
- howDidYouFindMe: exactly one of: 'Instagram' | 'Google' | 'Referral' | 'Venue' | 'Repeat Client' | 'Other'

- depositAck: boolean (set to true when user requests a quote)
- termsAgreed: boolean (set to true when user requests a quote)
- privacyAgreed: boolean (set to true when user requests a quote)
- contactConsent: boolean (set to true when user requests a quote)

CRITICAL RULES:
1. ONLY include fields in the 'fields' object if there is evidence or clear inference for them in the transcript. DO NOT invent fake contact info (email/phone/name) if not mentioned.
2. If the user mentions a preferredDate, ALWAYS also provide a valid preferredStartTime (e.g. '10:00', '11:00', '14:00', '15:00'). If the user didn't mention an exact hour, infer a sensible slot (e.g. '14:00' for afternoon/evening, '10:00' for morning).
3. If user mentions an alternate, backup, or secondary date option (e.g. 'or the 21st', 'backup date is...', 'either Saturday or Sunday'), ALWAYS extract and format as alternateDate (YYYY-MM-DD).
4. If a numerical budget is stated (e.g. '£800' -> '£500–£1,000', '£1500' or '2000' -> '£1,000–£2,500', '3000' -> '£2,500–£5,000', 'under 500' -> 'Under £500'), map it to the exact budgetRange enum.
5. If duration is stated (e.g. '1 hour', '2 hours', '4 hours', 'half day', 'full day'), map to estimatedDuration ('1 hr', '2 hrs', 'Half Day (4 hrs)', 'Full Day (8 hrs)').
6. If phone number is spoken with 'oh' or spaces, convert to clean digits and spaces (e.g. '07700 900123').
7. If email is spoken with 'at' or 'dot', convert to valid email format (e.g. 'name@example.com').
8. If dateFlexible is not explicitly specified, set dateFlexible: 'Yes'.
9. If turnaroundTime is not explicitly specified, set turnaroundTime: 'Standard (2–3 weeks)'.
10. If budgetFlexible is not explicitly specified, set budgetFlexible: 'Yes'.
11. If depositAck is not set, set depositAck: true, termsAgreed: true, privacyAgreed: true, contactConsent: true so the quote request is ready to review.
12. Use the exact keys listed above. Do NOT use alternative names like 'clientName' or 'locationDetails'.
13. If previous data already has fields filled, preserve them unless the user explicitly updates them in the latest transcript.
14. In 'filledFieldsSummary', provide a concise array of human-readable summaries of what was populated (e.g. ["Wedding session in Manchester", "Date: 14 Nov 2026", "Alternate: 21 Nov 2026", "Documentary & Warm style", "Budget: £1,000–£2,500"]).
15. In 'missingFields', list the key missing items that Benedict needs to finalize the quote (e.g. ["Phone number", "Approximate budget"]).
16. In 'assistantMessage', write a warm, personal 1-2 sentence response acknowledging what was captured, and asking a direct, friendly follow-up question for 1 or 2 of the most critical missing fields to help complete their booking.

Respond ONLY with a valid JSON object with the following schema:
{
  "fields": { ... },
  "filledFieldsSummary": [ ... ],
  "missingFields": [ ... ],
  "assistantMessage": "..."
}`;

    const userPromptContent = `User's latest input / transcript:
"${transcript}"

Existing already-filled form data (if any):
${JSON.stringify(currentData || {}, null, 2)}

Previous conversation context (if any):
${JSON.stringify(conversationHistory || [], null, 2)}`;

    let lastError = null;
    let resultJson: any = null;

    for (const model of FALLBACK_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: systemPrompt },
                  { text: userPromptContent }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          })
        });

        const data = await response.json();
        if (data.error) {
          lastError = data.error.message || JSON.stringify(data.error);
          continue;
        }

        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          resultJson = JSON.parse(rawText);
          break;
        }
      } catch (err: any) {
        lastError = err.message || String(err);
      }
    }

    if (!resultJson || !resultJson.fields) {
      return NextResponse.json(
        { error: `Could not parse event details. ${lastError || 'Please try again.'}` },
        { status: 500 }
      );
    }

    // Defensive normalization in case LLM outputs alternative keys
    const f = resultJson.fields;
    if (f.clientName && !f.fullName) f.fullName = f.clientName;
    if (f.clientEmail && !f.email) f.email = f.clientEmail;
    if (f.clientPhone && !f.phone) f.phone = f.clientPhone;
    if (f.locationDetails && !f.address) f.address = f.locationDetails;
    if (f.guestCount && !f.numSubjects) f.numSubjects = String(f.guestCount);

    return NextResponse.json(resultJson);
  } catch (error: any) {
    console.error('AI autofill error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
