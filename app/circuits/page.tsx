import Link from "next/link";
import EmptySeason from "../components/EmptySeason";
import PageHeading from "../components/PageHeading";
import Reveal from "../components/Reveal";
import SiteFrame from "../components/SiteFrame";
import { getCountryFlag, getSeasonData, resolveSeason } from "../lib/f1";

export const revalidate = 1800;
const circuitImages = ["photo-1531366936337-7c912a4589a7", "photo-1518684079-3c830dcef090", "photo-1500530855697-b586d89ba3ee", "photo-1493976040374-85c8e12f0c0e", "photo-1533105079780-92b9be482077", "photo-1525625293386-3f8f99389edd", "photo-1513635269975-59663e0ac1ad", "photo-1539037116277-4db20889f2d4"];

export default async function CircuitsPage({ searchParams }: { searchParams?: { season?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  const uniqueCircuits = Array.from(new Map(data.races.map((race) => [race.circuitId, race])).values());
  return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top">
    <PageHeading index="05" title="Circuits." accent="Every turn tells a story." description="Explore the host cities and legendary venues on the Formula One calendar. Each circuit page uses published race-calendar and location data." season={season} route="/circuits" updatedAt={data.updatedAt} />
    {uniqueCircuits.length ? <><div className="data-summary-strip"><span><strong>{uniqueCircuits.length}</strong> UNIQUE VENUES</span><span><strong>{data.races.length}</strong> GRAND PRIX WEEKENDS</span><span>COUNTRY FLAGS · CIRCUIT · HOST CITY</span><span>RACE DISTANCES AND LAP RECORDS NOT PROVIDED BY THE RESULTS FEED</span></div><div className="circuit-cards-grid">{uniqueCircuits.map((circuit, index) => <Reveal key={circuit.circuitId} delay={(index % 4) * 0.05}><Link className="circuit-list-card" href={`/circuits/${circuit.circuitId}?season=${season}`}><div className="circuit-list-art" style={{ backgroundImage: `linear-gradient(180deg,transparent 18%,rgba(9,10,12,.9)),url(https://images.unsplash.com/${circuitImages[index % circuitImages.length]}?auto=format&fit=crop&w=780&q=80)` }}><span>R{String(circuit.round).padStart(2, "0")} · {season}</span><strong>{getCountryFlag(circuit.country)}</strong><small>{circuit.country.toUpperCase()}</small></div><div className="circuit-list-copy"><h2>{circuit.circuit}</h2><p>{circuit.name}</p><span>{circuit.locality}, {circuit.country}</span><b>EXPLORE CIRCUIT ↗</b></div></Link></Reveal>)}</div></> : <EmptySeason season={season} />}
    <p className="method-note">Circuit maps, lengths, turn counts and lap records are not available in the public race-calendar feed. We clearly mark those details as unavailable rather than present estimates as official facts.</p>
  </main></SiteFrame>;
}
