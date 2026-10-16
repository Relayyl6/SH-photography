"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { fadeUp } from "@/lib/animations";

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const prefersReducedMotion = useReducedMotion();

  const variant = prefersReducedMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8, delay } } }
    : {
        ...fadeUp,
        show: {
          ...fadeUp.show,
          transition: { ...fadeUp.show.transition, delay }
        }
      };

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-20px" }}
      variants={variant}
      className={`${className || ''} transform-gpu`}
    >
      {children}
    </motion.div>
  );
}
