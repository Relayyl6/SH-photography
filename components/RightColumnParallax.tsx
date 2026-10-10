"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export function RightColumnParallax({ children, className }: Props) {
  const { scrollY } = useScroll();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);
  
  // Only freeze on desktop.
  const y = useTransform(scrollY, [0, 250], [0, isDesktop ? 250 : 0]);

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
