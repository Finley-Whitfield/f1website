"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DriverStanding, getTeamColor } from "../lib/f1";
import { getDriverImage, getDriverImageByName, getDriverImageFallback } from "../lib/site-images";

function DriverCard({
  driver,
  index,
  season,
  favorite,
  compared,
  onToggleFavorite,
  onToggleCompare,
}: {
  driver: DriverStanding;
  index: number;
  season: number;
  favorite: boolean;
  compared: boolean;
  onToggleFavorite: () => void;
  onToggleCompare: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.05 });
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      ref={ref}
      className="explorer-driver-card"
      style={{ "--team": getTeamColor(driver.constructorId) } as React.CSSProperties}
      layout
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96, filter: "blur(10px)" }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : reduceMotion ? { opacity: 0 } : { opacity: 1, y: 30, scale: 0.96, filter: "blur(10px)", transition: { duration: 0 } }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 14, scale: 0.96, filter: "blur(8px)" }}
      transition={{ duration: reduceMotion ? 0.18 : 0.52, delay: reduceMotion ? 0 : (index % 6) * 0.055, ease: [0.22, 1, 0.36, 1], layout: { duration: reduceMotion ? 0 : 0.35 } }}
    >
      <Link className="explorer-driver-photo" href={`/drivers/${driver.id}?season=${season}`} style={{ backgroundImage: `linear-gradient(180deg,transparent 22%,rgba(6,7,9,.94)),url("${getDriverImageByName(`${driver.firstName} ${driver.lastName}`)}"),url("${getDriverImage(driver.id)}"),url("${getDriverImageFallback(driver.id)}")` }}>
        <span className="driver-number">{driver.number || String(index + 1).padStart(2, "0")}</span>
        <span className="driver-photo-name">{driver.firstName}<strong>{driver.lastName}</strong></span>
      </Link>
      <div className="explorer-driver-meta"><span><i style={{ background: getTeamColor(driver.constructorId) }} /> {driver.constructorName}</span><span>{driver.points} PTS</span></div>
      <div className="explorer-driver-stats"><span><b>{driver.wins}</b><small>WINS</small></span><span><b>{driver.poles}</b><small>POLES</small></span><span><b>{driver.podiums}</b><small>PODIUMS</small></span><span><b>{driver.nationality}</b><small>NATIONALITY</small></span></div>
      <div className="explorer-driver-actions">
        <Link href={`/drivers/${driver.id}?season=${season}`}>DRIVER PROFILE ↗</Link>
        <button aria-label={`${favorite ? "Remove from" : "Add to"} favourites`} aria-pressed={favorite} onClick={onToggleFavorite}>{favorite ? "♥ SAVED" : "♡ SAVE"}</button>
        <button aria-pressed={compared} onClick={onToggleCompare}>{compared ? "✓ ADDED" : "+ COMPARE"}</button>
      </div>
    </motion.article>
  );
}

export default function DriverExplorer({
  drivers,
  season,
}: {
  drivers: DriverStanding[];
  season: number;
}) {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState("All teams");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparison, setComparison] = useState<string[]>([]);
  const teams = useMemo(() => Array.from(new Set(drivers.map((driver) => driver.constructorName))), [drivers]);
  const filtered = useMemo(() => drivers.filter((driver) => {
    const matchesText = `${driver.firstName} ${driver.lastName} ${driver.constructorName}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (team === "All teams" || driver.constructorName === team);
  }), [drivers, query, team]);

  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id]);
  }
  function toggleCompare(id: string) {
    setComparison((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 2 ? [...current, id] : [current[1], id]);
  }

  return (
    <>
      <div className="explorer-tools">
        <label className="explorer-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a driver or team…" aria-label="Search drivers" /></label>
        <label className="team-select-label" htmlFor="team-select">FILTER BY TEAM</label>
        <select id="team-select" value={team} onChange={(event) => setTeam(event.target.value)}><option>All teams</option>{teams.map((name) => <option key={name}>{name}</option>)}</select>
        <span className="explorer-results">{filtered.length} DRIVERS · {favorites.length} FAVOURITES</span>
      </div>
      {filtered.length === 0 ? <div className="data-empty"><h2>No drivers <em>found.</em></h2><p>Try another name or choose a different team.</p></div> : (
        <motion.div className="explorer-grid" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((driver, index) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                index={index}
                season={season}
                favorite={favorites.includes(driver.id)}
                compared={comparison.includes(driver.id)}
                onToggleFavorite={() => toggleFavorite(driver.id)}
                onToggleCompare={() => toggleCompare(driver.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      {comparison.length > 0 && (
        <div className="compare-dock">
          <div><span className="compare-label">SEASON COMPARISON</span><strong>{comparison.map((id) => { const driver = drivers.find((item) => item.id === id); return driver ? `${driver.firstName} ${driver.lastName}` : id; }).join("  VS  ")}</strong></div>
          <div className="compare-mini-stats">{comparison.map((id) => { const driver = drivers.find((item) => item.id === id); return driver ? <span key={id} style={{ color: getTeamColor(driver.constructorId) }}>{driver.points} <small>PTS</small></span> : null; })}</div>
          <button onClick={() => setComparison([])} aria-label="Close driver comparison">×</button>
        </div>
      )}
    </>
  );
}
