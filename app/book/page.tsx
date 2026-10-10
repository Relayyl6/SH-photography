import BookingForm from '@/components/book/BookingForm';

export const metadata = {
  title: 'Book a Session | SH Photography',
  description: 'Request a custom quote and book a photography session with Benedict Henry.',
};

export default function BookPage() {
  return (
    <main className="min-h-screen bg-paper pt-24 pb-12">
      <div className="container-site mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12 space-y-4">
          <h1 className="font-display text-5xl md:text-6xl text-ink">Request a Quote</h1>
          <p className="text-lg text-ink/70 max-w-2xl mx-auto">
            Please provide as much detail as possible about your upcoming session. This helps me understand your vision and prepare an accurate, custom quote for you.
          </p>
        </header>
        <BookingForm />
      </div>
    </main>
  );
}
