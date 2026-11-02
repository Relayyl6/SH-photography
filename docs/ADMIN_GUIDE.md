# Owner Studio Admin Guide — SH Photography

Welcome to your bespoke Studio Dashboard! This guide explains how to manage your photography portfolio, swap photos in the Home Bento grid, control pricing visibility, update calendar availability, and handle client bookings.

---

## 1. Accessing the Dashboard

1. Navigate to: `https://your-domain.com/admin` (or `http://localhost:3000/admin` locally).
2. Sign in with your owner email (`shfotography1@gmail.com`) or Google account.
3. *Note: The admin panel is never linked in the public navigation or footer. It is accessible only via direct URL.*

---

## 2. Managing the 9-Slot Home Bento Grid (`/admin/bento`)

The Home page features a fixed 9-slot Bento layout:
- **Slot 1**: Weddings (Tall 2x2 Feature)
- **Slot 2**: Beauty & Portraits (Tall 1x2)
- **Slot 3**: Family (Square 1x1)
- **Slot 4**: Events (Square 1x1)
- **Slot 5**: Behind the Scenes (Wide 2x1)
- **Slot 6**: Birthdays (Square 1x1)
- **Slot 7**: Personal Branding (Square 1x1)
- **Slot 8**: Sports & Athletics (Wide 2x1)
- **Slot 9**: Photography & Retouching Classes (Wide 2x1)

### How to Swap a Picture:
1. Open `/admin/bento`.
2. Click **Swap Photo** on the slot you want to update.
3. Browse or search through your curated portfolio photos in that category.
4. Click on the photo you want. The slot immediately updates with the new image.
5. Click **Save Changes** in the top right to publish live to Firestore.

### Auto-Rotation:
- Click **Auto-Rotate ON/OFF** on any slot to automatically cycle through photos in that category.

---

## 3. Sessions & Packages Management (`/admin/sessions`)

### Pricing Visibility Guarantee:
- Per brand design standards, all packages have prices **hidden by default** (`show_price: false`).
- Clients see *"Request a quote"* or custom price labels (e.g., *"Quote on request"*).
- To show a price: click **Edit Package**, set *Price Visibility* to *Visible*, enter an optional label (e.g., *"From £350"*), and click **Apply Updates**.

### Updating Inclusions & Deliverables:
- In the package editor, edit the bullet points under *Inclusions* (one per line).
- Changes reflect across the public Services and Booking pages immediately upon saving.

---

## 4. Calendar & Availability Engine (`/admin/availability`)

- **View Open vs Closed Dates**:
  - Open dates are marked with a green dot.
  - Closed dates are highlighted in soft red with a lock icon.
- **Block a Date**:
  - Click on any open date on the calendar.
  - Enter the reason (e.g., *"Wedding shoot away"*, *"Personal leave"*, *"Studio Maintenance"*).
  - Click **Confirm Block**.
- **Unblock a Date**:
  - Click any blocked date or click *Unblock* in the right-hand list.
- Click **Save Calendar** to synchronize availability.

---

## 5. Reviewing & Confirming Bookings (`/admin/bookings`)

- View client submissions filtered by status: **All**, **Pending**, **Confirmed**, **Completed**, **Cancelled**.
- Click on any booking to open the **Detail Drawer**:
  - View full client contact info (Name, Email, Phone).
  - Inspect custom questionnaire answers (locations, guest counts, mood boards, specific requests).
  - Add private **Owner Studio Notes** with timestamps.
  - Change status from *Pending* to *Confirmed* with one click.

---

## 6. Client Accounts & Guest Claiming (`/account`)

- When visitors book shoots as guests without creating an account first, a cryptographic token is saved in their browser.
- When they later create an account or sign in at `/account`, the system automatically claims those bookings and attaches them to their account profile.
- Clients can view all their booked shoots and click **Add to Calendar (.ics)** to sync directly with Apple Calendar, Google Calendar, or Outlook.
