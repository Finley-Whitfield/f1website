import Link from "next/link";
import { notFound } from "next/navigation";
import Countdown from "../../components/Countdown";
import EmptySeason from "../../components/EmptySeason";
import PageHeading from "../../components/PageHeading";
import SiteFrame from "../../components/SiteFrame";
import { getCountryFlag, getSeasonData, resolveSeason } from "../../lib/f1";
import { getRaceImage, getRaceImageFallback } from "../../lib/site-images";

export const revalidate = 1800;

export default async function RaceWeekendPage({ params, searchParams }: { params: { round: string }; searchParams?: { season?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  if (!data.races.length) return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top"><PageHeading index="04" title="Race weekend." accent="" description="The Grand Prix race schedule, venue details and confirmed race result." season={season} route={`/calendar/${params.round}`} updatedAt={data.updatedAt} /><EmptySeason season={season} /></main></SiteFrame>;
  const race = data.races.find((item) => item.round === Number(params.round));
  if (!race) notFound();
  const raceDate = new Date(`${race.date}T${race.time}`);
  const pastRace = Boolean(race.winner);
  const winner = race.winner && data.drivers.find((driver) => `${driver.firstName} ${driver.lastName}` === race.winner);
  return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top">
    <PageHeading index="04" title={race.name} accent="." description={`ROUND ${race.round} · ${season} FIA FORMULA ONE WORLD CHAMPIONSHIP`} season={season} route={`/calendar/${race.round}`} updatedAt={data.updatedAt} />
    <section className="race-detail-hero" style={{ backgroundImage: `linear-gradient(90deg,#111216 10%,#111216e6 52%,#11121699),url("${getRaceImage(race.circuitId)}"),url("${getRaceImageFallback(race.circuitId)}")` }}><span className="race-detail-number">{String(race.round).padStart(2, "0")}</span><div><span className="section-kicker">{getCountryFlag(race.country)} &nbsp; {race.locality}, {race.country}</span><h2>{race.name}<br /><em>{race.circuit}</em></h2><p>{new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeZone: "UTC" }).format(raceDate)}</p></div><div className="race-detail-outcome">{pastRace ? <><span>CHEQUERED FLAG</span><strong>{race.winner}</strong><small>{winner ? `${winner.constructorName} · ${winner.points} SEASON POINTS` : "CONFIRMED RACE WINNER"}</small></> : <><span>LIGHTS OUT IN</span><Countdown date={`${race.date}T${race.time}`} /><small>{race.time.slice(0, 5)} UTC</small></>}</div></section>
    <div className="race-detail-grid"><div><span className="section-kicker">THE CIRCUIT</span><h3>{race.circuit}</h3><p>{getCountryFlag(race.country)} {race.locality}, {race.country}</p><Link className="text-link" href={`/circuits/${race.circuitId}?season=${season}`}>Explore circuit details →</Link></div><div><span className="section-kicker">SEASON ROUND</span><h3>{String(race.round).padStart(2, "0")} / {data.races.length}</h3><p>{pastRace ? "Race result confirmed in the official results feed." : "Race result will appear here when the official feed is updated."}</p><Link className="text-link" href={`/standings?season=${season}`}>Championship standings →</Link></div><div><span className="section-kicker">TIMEZONE</span><h3>{race.time.slice(0, 5)} UTC</h3><p>Race start time published by the current schedule feed.</p><Link className="text-link" href="/calendar">Full race calendar →</Link></div></div>
  </main></SiteFrame>;
}
