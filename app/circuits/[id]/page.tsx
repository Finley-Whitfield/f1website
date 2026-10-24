import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import EmptySeason from "../../components/EmptySeason";
import PageHeading from "../../components/PageHeading";
import SiteFrame from "../../components/SiteFrame";
import { getCircuitHistory, getCircuitTrackMap, getCountryFlag, getSeasonData, resolveSeason } from "../../lib/f1";

export const revalidate = 1800;

export default async function CircuitProfilePage({ params, searchParams }: { params: { id: string }; searchParams?: { season?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  if (!data.races.length) return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top"><PageHeading index="05" title="Circuit explorer." accent="" description="Host city and published race-weekend information from the official schedule feed." season={season} route={`/circuits/${params.id}`} updatedAt={data.updatedAt} /><EmptySeason season={season} /></main></SiteFrame>;
  const events = data.races.filter((race) => race.circuitId === params.id);
  const circuit = events[0];
  if (!circuit) notFound();
  const [history, trackMap] = await Promise.all([
    getCircuitHistory(circuit.circuitId),
    getCircuitTrackMap(circuit.circuitUrl),
  ]);
  const recentWinners = [...history.races].reverse().slice(0, 8);
  return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top">
    <PageHeading index="05" title={circuit.circuit} accent="." description={`${getCountryFlag(circuit.country)} ${circuit.locality}, ${circuit.country} · ${season} FIA Formula One World Championship`} season={season} route={`/circuits/${circuit.circuitId}`} updatedAt={data.updatedAt} />
    <div className="circuit-profile-layout"><section className="circuit-profile-map"><div className="map-grid" />{trackMap ? <><Image className="circuit-layout-image" src={trackMap.src} alt={trackMap.alt} width={1600} height={1000} unoptimized priority /><a className="map-source-link" href={trackMap.pageUrl} target="_blank" rel="noreferrer">TRACK LAYOUT · SOURCE ↗</a></> : <div className="circuit-map-unavailable"><strong>TRACK MAP NOT FOUND</strong><span>We could not retrieve a layout image for this venue.</span><a href={circuit.circuitUrl} target="_blank" rel="noreferrer">VIEW CIRCUIT SOURCE ↗</a></div>}<span className="map-label map-label-top">HOST LOCATION <span>{circuit.locality.toUpperCase()} · {circuit.country.toUpperCase()}</span></span><span className="map-label map-label-bottom"><span>{history.debut ? `F1 DEBUT · ${history.debut}` : "F1 HISTORY"}</span><strong>{history.grandPrixCount} GRAND PRIX EVENTS</strong></span></section>
      <section className="circuit-profile-details"><span className="section-kicker">VENUE DOSSIER · {circuit.country.toUpperCase()}</span><h2>{circuit.circuit}</h2><p>The {circuit.name} sits in {circuit.locality}, {circuit.country}. Its race record and notable winners below are drawn from completed Formula One Grand Prix results.</p><div className="circuit-detail-metrics"><span><strong>{events.map((event) => `R${String(event.round).padStart(2, "0")}`).join(" · ")}</strong><small>{season} SEASON ROUND</small></span><span><strong>{history.debut ?? "—"}</strong><small>FIRST F1 WINNER IN ARCHIVE</small></span><span><strong>{history.races.length}</strong><small>CLASSIFIED F1 WINNERS</small></span></div><div className="circuit-honours"><div><span>MOST SUCCESSFUL DRIVER</span><strong>{history.mostSuccessfulDriver?.name ?? "No result in archive"}</strong><small>{history.mostSuccessfulDriver ? `${history.mostSuccessfulDriver.wins} wins at this circuit` : "Historical winner data unavailable"}</small></div><div><span>MOST SUCCESSFUL CONSTRUCTOR</span><strong>{history.mostSuccessfulConstructor?.name ?? "No result in archive"}</strong><small>{history.mostSuccessfulConstructor ? `${history.mostSuccessfulConstructor.wins} wins at this circuit` : "Historical winner data unavailable"}</small></div></div><div className="unavailable-circuit-data"><span>TRACK SPECIFICATIONS</span><strong>Not included in the live race-results feed</strong><p>Lap length, corner count, lap records and DRS zones are left out rather than presented as unverified facts.</p></div></section></div>
    <section className="circuit-history-section"><div className="history-panel-heading"><div><span className="section-kicker">THE CIRCUIT&apos;S STORY</span><h2>History in <em>motion.</em></h2><p>Recent Grand Prix winners at {circuit.circuit}, from the official results archive.</p></div><span className="history-data-stamp">{history.debut ? `${history.debut}–${history.races[history.races.length - 1]?.season ?? season}` : "HISTORICAL ARCHIVE"}</span></div>
      {recentWinners.length ? <div className="circuit-history-list">{recentWinners.map((race) => <div className="circuit-history-row" key={`${race.season}-${race.round}`}><span>{race.season}</span><div><strong>{race.name}</strong><small>{race.locality}, {race.country}</small></div><span className="circuit-history-winner"><strong>{race.winner}</strong><small>{race.constructor}</small></span></div>)}</div> : <p className="history-unavailable">No completed winner records are available for this venue yet.</p>}
    </section>
    <h2 className="circuit-races-title">Race weekends at this circuit</h2><div className="race-list">{events.map((race) => <Link className="race-list-card" href={`/calendar/${race.round}?season=${season}`} key={race.round}><span className="race-list-round">R{String(race.round).padStart(2, "0")}<small>ROUND</small></span><span className="race-list-flag">{getCountryFlag(race.country)}</span><span className="race-list-info"><strong>{race.name}</strong><small>{new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${race.date}T${race.time}`))}</small></span><span className="race-list-result"><small>{race.winner ? "RACE WINNER" : "SCHEDULED"}</small><strong>{race.winner ?? "—"}</strong></span><b className="race-list-link">↗</b></Link>)}</div>
  </main></SiteFrame>;
}
