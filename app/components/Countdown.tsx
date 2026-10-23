"use client";

import { useEffect, useState } from "react";

export default function Countdown({ date }: { date?: string }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!date) return;
    const update = () => setRemaining(Math.max(0, Math.floor((new Date(date).getTime() - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [date]);

  if (!date) return <span className="countdown-unavailable">SEASON CALENDAR TO BE ANNOUNCED</span>;

  const days = Math.floor(remaining / 86_400);
  const hours = Math.floor(remaining / 3_600) % 24;
  const minutes = Math.floor(remaining / 60) % 60;
  const seconds = remaining % 60;

  return (
    <span className="countdown-digits" suppressHydrationWarning>
      {String(days).padStart(2, "0")} : {String(hours).padStart(2, "0")} : {String(minutes).padStart(2, "0")} : {String(seconds).padStart(2, "0")}
    </span>
  );
}
