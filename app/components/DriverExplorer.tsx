"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DriverStanding, getTeamColor } from "../lib/f1";

const portraits = [
  "photo-1535713875002-d1d0cf377fde", "photo-1500648767791-00dcc994a43e",
  "photo-1506794778202-cad84cf45f1d", "photo-1507003211169-0a1dd7228f2d",
  "photo-1507591064344-4c6ce005b128", "photo-1501196354995-cbb51c65aaea",
];

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
  const teams = useMemo(() => [...new Set(drivers.map((driver) => driver.constructorName))], [drivers]);
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
        <div className="explorer-grid">
          {filtered.map((driver, index) => (
            <article className="explorer-driver-card" style={{ "--team": getTeamColor(driver.constructorId) } as React.CSSProperties} key={driver.id}>
              <Link className="explorer-driver-photo" href={`/drivers/${driver.id}?season=${season}`} style={{ backgroundImage: `linear-gradient(180deg,transparent 22%,rgba(6,7,9,.94)),url(https://images.unsplash.com/${portraits[index % portraits.length]}?auto=format&fit=crop&w=700&q=80)` }}>
                <span className="driver-number">{driver.number || String(index + 1).padStart(2, "0")}</span>
                <span className="driver-photo-name">{driver.firstName}<strong>{driver.lastName}</strong></span>
              </Link>
              <div className="explorer-driver-meta"><span><i style={{ background: getTeamColor(driver.constructorId) }} /> {driver.constructorName}</span><span>{driver.points} PTS</span></div>
              <div className="explorer-driver-stats"><span><b>{driver.wins}</b><small>WINS</small></span><span><b>{driver.poles}</b><small>POLES</small></span><span><b>{driver.podiums}</b><small>PODIUMS</small></span><span><b>{driver.nationality}</b><small>NATIONALITY</small></span></div>
              <div className="explorer-driver-actions">
                <Link href={`/drivers/${driver.id}?season=${season}`}>DRIVER PROFILE ↗</Link>
                <button aria-label={`${favorites.includes(driver.id) ? "Remove from" : "Add to"} favourites`} aria-pressed={favorites.includes(driver.id)} onClick={() => toggleFavorite(driver.id)}>{favorites.includes(driver.id) ? "♥ SAVED" : "♡ SAVE"}</button>
                <button aria-pressed={comparison.includes(driver.id)} onClick={() => toggleCompare(driver.id)}>{comparison.includes(driver.id) ? "✓ ADDED" : "+ COMPARE"}</button>
              </div>
            </article>
          ))}
        </div>
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
