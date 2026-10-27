import { Suspense } from 'react';
import BookingForm from '@/components/book/BookingForm';

export const metadata = {
  title: 'Book a Session | SH Photography',
  description: 'Request a custom quote and book a photography session with Benedict Henry.',
};

export default function BookPage() {
  return (
    <main className="min-h-screen bg-paper pt-6 sm:pt-10 md:pt-14 pb-12">
      <div className="container-site">
        <Suspense fallback={<div className="py-24 text-center text-ink/40">Loading form…</div>}>
          <BookingForm />
        </Suspense>
      </div>
    </main>
  );
}
