"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.div
      className={className ? `cinematic-reveal ${className}` : "cinematic-reveal"}
      data-revealed={revealed}
      initial={{ opacity: 0, y: 76, rotateX: 3, scale: 0.965, filter: "blur(20px)", clipPath: "inset(0 0 22% 0)" }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.95, delay, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => setRevealed(true)}
    >
      {children}
    </motion.div>
  );
}
