import Link from "next/link";
import EmptySeason from "../components/EmptySeason";
import PageHeading from "../components/PageHeading";
import Reveal from "../components/Reveal";
import SiteFrame from "../components/SiteFrame";
import { getCountryFlag, getSeasonData, resolveSeason } from "../lib/f1";

export const revalidate = 1800;
const storyImages = ["photo-1500534623283-312aade485b7", "photo-1500534314209-a25ddb2bd429", "photo-1519608487953-e999c86e7455", "photo-1525625293386-3f8f99389edd"];

export default async function NewsPage({ searchParams }: { searchParams?: { season?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  const completed = [...data.races].filter((race) => race.winner).reverse();
  const leader = data.drivers[0];
  const nextRace = data.races.find((race) => new Date(`${race.date}T${race.time}`).getTime() >= Date.now());
  return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top">
    <PageHeading index="06" title="Inside the paddock." accent="" description="A verified race-weekend briefing, built from published Formula One championship standings, calendar and race results." season={season} route="/news" updatedAt={data.updatedAt} />
    {data.available ? <>
      <div className="news-brief-banner"><div><span className="section-kicker">THE {season} PADDOCK BRIEFING</span><h2>{leader ? `${leader.firstName} ${leader.lastName} leads the championship.` : "The season is about to begin."}</h2><p>{leader ? `${leader.constructorName} driver ${leader.firstName} ${leader.lastName} leads the ${season} drivers' standings on ${leader.points} points after round ${data.round}.` : `${season} championship entries and standings have not been published by the data provider yet.`}</p><Link className="text-link" href={`/standings?season=${season}`}>See the verified standings →</Link></div><div className="news-brief-number"><strong>{String(data.round).padStart(2, "0")}</strong><span>ROUNDS<br />COMPLETED</span></div></div>
      {completed.length ? <><div className="news-section-label"><span>RACE RESULTS · {season}</span><span>{completed.length} CONFIRMED WINNERS</span></div><div className="news-results-grid">{completed.slice(0, 12).map((race, index) => <Reveal key={race.round} delay={(index % 4) * 0.04}><Link className={`news-result-card ${index === 0 ? "news-result-featured" : ""}`} href={`/news/round-${race.round}?season=${season}`}><div className="news-result-image" style={{ backgroundImage: `linear-gradient(180deg,transparent 20%,rgba(8,9,12,.93)),url(https://images.unsplash.com/${storyImages[index % storyImages.length]}?auto=format&fit=crop&w=900&q=85)` }}><span>{getCountryFlag(race.country)} &nbsp; ROUND {race.round} · {season}</span><strong>{race.winner}</strong></div><div className="news-result-copy"><span>CONFIRMED RACE WINNER</span><h3>{race.name}</h3><p>{race.circuit} · {race.locality}, {race.country}</p><b>READ RACE BRIEFING ↗</b></div></Link></Reveal>)}</div></> : <EmptySeason season={season} />}
      {nextRace && <div className="news-next-line"><span className="live-dot" /> NEXT UP · {getCountryFlag(nextRace.country)} {nextRace.name} · {new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${nextRace.date}T${nextRace.time}`))}<Link href={`/calendar/${nextRace.round}?season=${season}`}>RACE WEEKEND DETAILS →</Link></div>}
    </> : <EmptySeason season={season} />}
    <p className="method-note">Apex Racing Hub is an independent fan experience, not a live newsroom. This briefing contains verifiable championship and race-result data; it does not invent quotes, breaking news or unsourced reporting.</p>
  </main></SiteFrame>;
}
