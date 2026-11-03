// Dedicated layout for the login page — no global Header, no Footer, locked to viewport height
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden">
      {children}
    </div>
  );
}
