import Link from "next/link";
import { notFound } from "next/navigation";
import EmptySeason from "../../components/EmptySeason";
import PageHeading from "../../components/PageHeading";
import SiteFrame from "../../components/SiteFrame";
import { getCountryFlag, getSeasonData, resolveSeason } from "../../lib/f1";

export const revalidate = 1800;

export default async function CircuitProfilePage({ params, searchParams }: { params: { id: string }; searchParams?: { season?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  if (!data.races.length) return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top"><PageHeading index="05" title="Circuit explorer." accent="" description="Host city and published race-weekend information from the official schedule feed." season={season} route={`/circuits/${params.id}`} updatedAt={data.updatedAt} /><EmptySeason season={season} /></main></SiteFrame>;
  const events = data.races.filter((race) => race.circuitId === params.id);
  const circuit = events[0];
  if (!circuit) notFound();
  return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top">
    <PageHeading index="05" title={circuit.circuit} accent="." description={`${getCountryFlag(circuit.country)} ${circuit.locality}, ${circuit.country} · ${season} FIA Formula One World Championship`} season={season} route={`/circuits/${circuit.circuitId}`} updatedAt={data.updatedAt} />
    <div className="circuit-profile-layout"><section className="circuit-profile-map"><div className="map-grid" /><div className="circuit-coordinate-mark"><span>{getCountryFlag(circuit.country)}</span><strong>TRACK MAP</strong><small>OFFICIAL CIRCUIT LAYOUT NOT AVAILABLE IN THE LIVE RESULTS FEED</small><i>◎</i></div><span className="map-label map-label-top">HOST LOCATION <span>{circuit.locality.toUpperCase()} · {circuit.country.toUpperCase()}</span></span><span className="map-label map-label-bottom"><span>SEASON {season}</span><strong>{events.length} GRAND PRIX EVENT{events.length === 1 ? "" : "S"}</strong></span></section>
      <section className="circuit-profile-details"><span className="section-kicker">RACE VENUE</span><h2>{circuit.circuit}</h2><p>{circuit.name} takes place in {circuit.locality}, {circuit.country}. See the official schedule for published dates and race results.</p><div className="circuit-detail-metrics"><span><strong>{events.map((event) => `R${String(event.round).padStart(2, "0")}`).join(" · ")}</strong><small>SEASON ROUND</small></span><span><strong>{circuit.locality}</strong><small>HOST CITY</small></span><span><strong>{circuit.country}</strong><small>HOST COUNTRY</small></span></div><div className="unavailable-circuit-data"><span>TRACK SPECIFICATIONS</span><strong>Not available from the public race-calendar data</strong><p>Lap length, corner count, lap records, DRS zones and track layouts are not included in the results feed. Specifications are intentionally left blank instead of guessed.</p></div></section></div>
    <h2 className="circuit-races-title">Race weekends at this circuit</h2><div className="race-list">{events.map((race) => <Link className="race-list-card" href={`/calendar/${race.round}?season=${season}`} key={race.round}><span className="race-list-round">R{String(race.round).padStart(2, "0")}<small>ROUND</small></span><span className="race-list-flag">{getCountryFlag(race.country)}</span><span className="race-list-info"><strong>{race.name}</strong><small>{new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${race.date}T${race.time}`))}</small></span><span className="race-list-result"><small>{race.winner ? "RACE WINNER" : "SCHEDULED"}</small><strong>{race.winner ?? "—"}</strong></span><b className="race-list-link">↗</b></Link>)}</div>
  </main></SiteFrame>;
}
