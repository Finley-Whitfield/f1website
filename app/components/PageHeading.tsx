"use client";

import { motion } from "framer-motion";
import SeasonPicker from "./SeasonPicker";

export default function PageHeading({
  index,
  title,
  accent,
  description,
  season,
  route,
  updatedAt,
}: {
  index: string;
  title: string;
  accent: string;
  description: string;
  season: number;
  route: string;
  updatedAt: string;
}) {
  const stamp = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(updatedAt));
  return (
    <motion.section
      className="page-heading"
      id="top"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.11 } } }}
    >
      <motion.div
        className="section-kicker"
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
      >
        {index} / APEX RACING HUB
      </motion.div>
      <div className="page-heading-row">
        <motion.div variants={{ hidden: { opacity: 0, y: 24, filter: "blur(12px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } } }}>
          <motion.h1 initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
            {title} <em>{accent}</em>
          </motion.h1>
          <motion.p variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>{description}</motion.p>
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, x: 18 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}>
          <SeasonPicker season={season} route={route} />
        </motion.div>
      </div>
      <motion.div
        className="data-attribution"
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
      >
        <span><i className="live-dot" /> {season} FIA FORMULA ONE WORLD CHAMPIONSHIP</span>
        <span>DATA REFRESHED {stamp} UTC · <a href="https://api.jolpi.ca/ergast/f1/" target="_blank" rel="noreferrer">JOLPICA F1 API ↗</a></span>
      </motion.div>
    </motion.section>
  );
}
