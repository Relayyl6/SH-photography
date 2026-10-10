"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function AboutParallaxTitle() {
  const { scrollY } = useScroll();
  
  // "MY" moves up faster than the page scroll
  const yMy = useTransform(scrollY, [0, 800], [0, -200]);
  
  // "STORY" moves slightly slower than the page scroll, so they separate
  const yStory = useTransform(scrollY, [0, 800], [0, 50]);

  return (
    <>
      {/* Desktop Title */}
      <div className="hidden md:block w-full mb-12 select-none pointer-events-none relative h-[15vw] min-h-[190px]">
        {/* We use absolute positioning to overlap them and animate independently */}
        <motion.div style={{ y: yMy }} className="absolute top-0 left-0 w-full h-full z-20">
          <svg viewBox="0 0 1000 190" className="w-full h-auto text-ink fill-current overflow-visible">
            <text x="0" y="130" textLength="330" lengthAdjust="spacingAndGlyphs" className="font-display font-bold uppercase tracking-tighter" fontSize="150">
              MY
            </text>
          </svg>
        </motion.div>
        
        <motion.div style={{ y: yStory }} className="absolute top-0 left-0 w-full h-full z-10">
          <svg viewBox="0 0 1000 190" className="w-full h-auto text-ink fill-current overflow-visible">
            <text x="400" y="172" textLength="600" lengthAdjust="spacingAndGlyphs" className="font-display font-bold uppercase tracking-tighter" fontSize="210">
              STORY
            </text>
          </svg>
        </motion.div>
      </div>

      {/* Mobile Title */}
      <div className="md:hidden flex flex-col mb-8 select-none pointer-events-none relative h-[65vw]">
        <motion.div style={{ y: yMy }} className="absolute top-0 left-0 w-full h-full z-20">
          <svg viewBox="0 0 350 240" className="w-full h-auto text-ink fill-current overflow-visible">
            <text x="0" y="90" textLength="350" lengthAdjust="spacing" className="font-display font-bold uppercase" fontSize="100">MY</text>
          </svg>
        </motion.div>
        
        <motion.div style={{ y: yStory }} className="absolute top-0 left-0 w-full h-full z-10">
          <svg viewBox="0 0 350 240" className="w-full h-auto text-ink fill-current overflow-visible">
            <text x="0" y="230" textLength="350" lengthAdjust="spacingAndGlyphs" className="font-display font-bold uppercase" fontSize="160">STORY</text>
          </svg>
        </motion.div>
      </div>
    </>
  );
}
