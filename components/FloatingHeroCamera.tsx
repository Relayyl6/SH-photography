'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

export function FloatingHeroCamera() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute left-1/2 -translate-x-1/2 -top-6 sm:-top-12 md:-top-16 lg:top-auto lg:bottom-[-8px] xl:bottom-[-12px] pointer-events-none -z-10 select-none w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80 max-w-[80vw]">
      <motion.div
        className="transform-gpu will-change-transform"
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
      >
        <div className="relative aspect-[756/634] w-full transform-gpu drop-shadow-xl">
          <Image
            src="/hero-camera-top.png"
            alt="Levitating DSLR Camera"
            fill
            className="object-contain"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
}

