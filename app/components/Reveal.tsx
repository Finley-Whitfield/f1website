"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.05 });
  const reduceMotion = useReducedMotion();
  const revealed = reduceMotion || isInView;
  const hidden = { opacity: 0, y: 76, rotateX: 3, scale: 0.965, filter: "blur(20px)", clipPath: "inset(0 0 22% 0)" };
  const visible = { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)" };

  return (
    <motion.div
      ref={ref}
      className={className ? `cinematic-reveal ${className}` : "cinematic-reveal"}
      data-revealed={revealed}
      initial={reduceMotion ? false : hidden}
      animate={revealed ? visible : { ...visible, transition: { duration: 0 } }}
      transition={{ duration: reduceMotion ? 0 : 0.72, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
