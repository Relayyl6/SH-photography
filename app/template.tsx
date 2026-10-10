"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { easing } from "@/lib/animations";

export default function Template({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.6, ease: easing }}
    >
      {children}
    </motion.div>
  );
}
