export const easing = [0.6, -0.05, 0.01, 0.99] as const;

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

export const slowStaggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.2 } }
};

export const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: easing } }
};

export const fadeUpLarge = {
  hidden: { y: 60, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 1, ease: easing } }
};

export const fadeScale = {
  hidden: { scale: 0.95, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: easing } }
};

export const fadeDown = {
  hidden: { y: -30, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: easing } }
};

export const imageReveal = {
  hidden: { scale: 1.1, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] as const } }
};
