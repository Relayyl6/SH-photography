"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { staggerContainer, fadeUp, fadeDown, fadeScale, fadeUpLarge, imageReveal } from "@/lib/animations";

type StaggerRevealProps = {
  children: React.ReactNode;
  className?: string;
  staggerVariant?: "fast" | "slow";
};

export function StaggerReveal({ children, className, staggerVariant = "fast" }: StaggerRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  const containerVariant = staggerVariant === "fast" ? staggerContainer : {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariant}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, variant = "fadeUp" }: { children: React.ReactNode, className?: string, variant?: "fadeUp" | "fadeDown" | "fadeScale" | "fadeUpLarge" | "imageReveal" }) {
  const variants = {
    fadeUp,
    fadeDown,
    fadeScale,
    fadeUpLarge,
    imageReveal
  };
  
  return (
    <motion.div variants={variants[variant]} className={className}>
      {children}
    </motion.div>
  );
}
