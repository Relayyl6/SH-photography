'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

export function FloatingHeroCamera() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        shouldReduceMotion
          ? { y: 0, rotate: -4 }
          : {
              y: [0, -10, 0],
              rotate: [-6, -2, -6],
            }
      }
      transition={{
        duration: 5.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-[64%] pointer-events-none -z-10 select-none w-56 sm:w-64 md:w-72 lg:w-80 xl:w-96 max-w-[85vw]"
    >
      <div className="relative aspect-[756/634] w-full filter drop-shadow-[0_20px_35px_rgba(21,19,15,0.35)]">
        <Image
          src="/hero-camera-top.png"
          alt="Levitating DSLR Camera"
          fill
          className="object-contain"
          priority
        />
      </div>
    </motion.div>
  );
}

