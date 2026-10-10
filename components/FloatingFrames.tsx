"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function FloatingFrames() {
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, x: -50, y: -50, rotate: -5 }}
        animate={{ opacity: 0.9, x: 0, y: 0, rotate: 0 }}
        transition={{ duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99], delay: 0.2 }}
        className="absolute top-[120px] left-[-2%] md:top-[160px] md:left-[4%] w-[100px] h-[100px] md:w-[200px] md:h-[200px] lg:w-[240px] lg:h-[240px] z-40 pointer-events-none mix-blend-multiply"
      >
        <Image src="/frame-sq-2.jpg" alt="Art" fill className="object-contain" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 50, y: 50, rotate: 5 }}
        animate={{ opacity: 0.9, x: 0, y: 0, rotate: 0 }}
        transition={{ duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99], delay: 0.4 }}
        className="absolute bottom-[22%] right-[-10%] md:bottom-[5%] md:right-[2%] w-[120px] h-[120px] md:w-[220px] md:h-[220px] lg:w-[280px] lg:h-[280px] z-40 pointer-events-none mix-blend-multiply"
      >
        <Image src="/frame-sq-1.jpg" alt="Art" fill className="object-contain" />
      </motion.div>
    </>
  );
}
