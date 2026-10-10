"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode } from "react";

export function RightColumnParallax({ children, className }: { children: ReactNode, className?: string }) {
  const { scrollY } = useScroll();
  
  // Freeze the right column for the first 250px of scrolling by translating it downwards 
  // at the exact speed the user scrolls downwards. 
  // After 250px (when the left column's image hits its sticky point), cap the translation
  // so the right column begins scrolling up normally.
  const y = useTransform(scrollY, [0, 250], [0, 250]);

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
