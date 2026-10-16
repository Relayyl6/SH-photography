import Image from "next/image";

// Curated editorial showcase frame for session galleries and previews.
// Designed with a warm darkroom / fine-art aesthetic matching SH Photography.
// Supports displaying real photographs with photographic corner crop marks
// and the "SH Archive · MCR · UK" stamp, as well as editorial placeholders.
export function PlaceholderImage({
  label,
  ratio = "4 / 5",
  className = "",
  src,
  alt,
  priority = false,
}: {
  label: string;
  ratio?: string;
  className?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
}) {
  const hasPhoto = Boolean(src && src.trim().length > 0);

  return (
    <div
      role="img"
      aria-label={alt || label}
      className={`group/frame relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#27231e] via-[#1c1815] to-[#110f0d] p-4 sm:p-5 text-paper border border-white/10 shadow-md transition-all duration-500 hover:shadow-xl hover:border-accent/40 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {/* Real Photograph Layer */}
      {hasPhoto && src && (
        <>
          <Image
            src={src}
            alt={alt || label}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover/frame:scale-105"
            priority={priority}
          />
          {/* Subtle dark film gradient overlay so text/stamps remain crystal clear */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none transition-opacity duration-300 group-hover/frame:opacity-85" />
        </>
      )}

      {/* Subtle photographic corner crop marks ("corner edge line stuff") */}
      <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/60 pointer-events-none z-10 drop-shadow-sm" />
      <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/60 pointer-events-none z-10 drop-shadow-sm" />
      <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-white/60 pointer-events-none z-10 drop-shadow-sm" />
      <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-white/60 pointer-events-none z-10 drop-shadow-sm" />

      {/* Top Bar with Camera Icon and Archive Stamp */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold text-accent/90 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10 shadow-sm">
          <svg className="w-3 h-3 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
          </svg>
          SH Archive
        </span>
        <span className="text-[9px] uppercase tracking-widest text-paper/70 font-mono bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 shadow-sm">
          MCR · UK
        </span>
      </div>

      {/* Center Focus Ring / Aperture Graphic (Only shown on placeholder items) */}
      {!hasPhoto && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover/frame:opacity-35 transition-opacity duration-500">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-dashed border-white/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-accent/60" />
          </div>
        </div>
      )}

      {/* Bottom Label Tag */}
      <div className="relative z-10 mt-auto pt-4">
        <span className="inline-block rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-[11px] sm:text-xs font-medium tracking-wide text-paper border border-white/20 transition-colors group-hover/frame:bg-accent/40 group-hover/frame:border-accent/60 shadow-sm">
          {label}
        </span>
      </div>
    </div>
  );
}
