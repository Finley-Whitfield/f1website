"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function HomeHeroEntrance({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="hero-inner"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 34, filter: reduceMotion ? "none" : "blur(14px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: reduceMotion ? 0.22 : 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
