import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Style",
  description: "My photography style and approach.",
};

export default function StylePage() {
  return (
    <div className="min-h-screen bg-[#33110b] -mt-[120px] p-4 pt-[100px] md:p-8 md:pt-[120px] overflow-x-hidden font-display flex flex-col items-center">
      
      {/* Main Inner Card (The Poster) - Fits exactly in viewport */}
      <div className="relative bg-[#f6f4f0] w-full max-w-[1400px] h-[calc(100dvh-132px)] md:h-[calc(100dvh-168px)] min-h-[500px] flex flex-col shadow-2xl overflow-hidden mt-4">
        
        {/* Floating Top Left Frame (Inside card for perfect mix-blend transparency) */}
        <div className="absolute top-[-2%] left-[-2%] md:top-[2%] md:left-[2%] w-[100px] h-[100px] md:w-[22vh] md:h-[22vh] z-40 pointer-events-none mix-blend-multiply opacity-90">
          <Image src="/frame-sq-2.jpg" alt="Art" fill className="object-contain" />
        </div>

        {/* Floating Bottom Right Frame (Inside card) */}
        <div className="absolute bottom-[22%] right-[-10%] md:bottom-[5%] md:right-[2%] w-[120px] h-[120px] md:w-[28vh] md:h-[28vh] z-40 pointer-events-none mix-blend-multiply opacity-90">
          <Image src="/frame-sq-1.jpg" alt="Art" fill className="object-contain" />
        </div>

        {/* Top Header inside the poster */}
        <div className="relative z-50 flex items-center justify-between px-6 py-4 md:px-10 md:py-8 h-[10vh] min-h-[60px]">
          <div className="text-ink text-xl md:text-2xl font-light leading-none">+</div>
          <div className="font-display italic text-2xl md:text-4xl text-ink absolute left-1/2 -translate-x-1/2">
            SH
          </div>
          <Link href="/contact" className="text-[9px] md:text-[1.2vh] font-sans font-semibold tracking-[0.2em] text-ink uppercase hover:text-accent">
            Contact
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative flex-1 flex flex-col items-center justify-center w-full">
          
          {/* Center Image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] md:w-[45vh] md:h-[45vh] z-10 mix-blend-multiply pointer-events-none">
            <Image src="/frame-circle.jpg" alt="Style Portrait" fill className="object-contain" priority />
          </div>

          {/* Huge Typography (Accent Color) */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center font-display text-[14vw] sm:text-[15.5vw] md:text-[20vh] leading-[0.75] tracking-tight text-[#e83b1c] mix-blend-multiply pointer-events-none select-none w-full">
            
            <div className="relative flex items-center justify-center w-full">
              <div className="hidden md:block text-[1vh] lg:text-[1.2vh] uppercase font-sans tracking-[0.2em] text-ink/50 absolute left-[5%] text-left leading-tight">
                MY<br />STYLE
              </div>
              <span>NATURAL</span>
            </div>
            
            <div className="relative flex items-center justify-center w-full mt-2 md:mt-0">
              <span>VIBRANT &amp;</span>
              <div className="hidden md:block text-[1vh] lg:text-[1.2vh] uppercase font-sans tracking-[0.2em] text-ink/50 absolute right-[5%] text-right leading-tight">
                EST.<br />2020
              </div>
            </div>
            
            <div className="relative flex items-center justify-center w-full mt-2 md:mt-0">
              <span>AUTHENTIC</span>
            </div>

          </div>
        </div>

        {/* Red Box Bottom Left */}
        <div className="absolute bottom-0 left-0 bg-[#e83b1c] text-paper w-full md:w-[45%] max-w-[500px] h-[16vh] min-h-[120px] p-4 md:p-6 z-50 flex items-center gap-4">
          
          {/* Bespoke faded edges blending into red using CSS Mask */}
          <div 
            className="relative w-20 h-20 md:w-[14vh] md:h-[14vh] min-w-[72px] min-h-[72px] shrink-0"
            style={{
              WebkitMaskImage: "radial-gradient(circle closest-side, black 65%, transparent 100%)",
              maskImage: "radial-gradient(circle closest-side, black 65%, transparent 100%)"
            }}
          >
             <Image src="/frame-sq-1.jpg" alt="Artwork" fill className="object-cover scale-110" />
          </div>
          
          <div className="flex flex-col text-left justify-center ml-2">
            <h2 className="font-display text-2xl md:text-[3.5vh] mb-1 leading-[0.9] tracking-tight text-white">
              Genuine<br />Connections
            </h2>
            <p className="text-[8px] md:text-[0.9vh] uppercase font-sans tracking-[0.1em] opacity-90 max-w-[200px] leading-relaxed text-white">
              FOR ME, PHOTOGRAPHY GOES BEYOND THE PICTURES. IT&apos;S ABOUT CONNECTING WITH MY CLIENTS. 
              <span className="ml-2 font-serif text-[2vh] leading-none align-middle font-light">⟶</span>
            </p>
          </div>
        </div>
      </div>

      {/* Original Style Text */}
      <div className="w-full max-w-[1300px] mt-16 md:mt-24 pb-10 px-4 md:px-0">
        <div className="mx-auto max-w-3xl">
          <article className="prose-none space-y-6 md:space-y-8 text-base md:text-[1.1rem] leading-relaxed text-[#f6f4f0]/80 md:text-center md:text-[1.25rem]">
            <p>
              My photography style is natural, vibrant and authentic. I love bright colours and
              capturing moments as they truly happen, without excessive editing. I focus on real
              emotions, genuine connections and storytelling, whether it&apos;s a love story, a
              wedding, an event or simply a meaningful moment.
            </p>
            <p>
              For me, photography goes beyond the pictures. It&apos;s about connecting with my
              clients and creating an excellent experience from the first interaction, throughout the
              shoot and even after delivery. I want every client to feel comfortable, valued and
              confident that their memories are being preserved beautifully and authentically.
            </p>
          </article>
        </div>
      </div>

    </div>
  );
}
