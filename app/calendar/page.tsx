import Link from "next/link";
import Countdown from "../components/Countdown";
import EmptySeason from "../components/EmptySeason";
import PageHeading from "../components/PageHeading";
import Reveal from "../components/Reveal";
import SiteFrame from "../components/SiteFrame";
import { getCountryFlag, getSeasonData, resolveSeason } from "../lib/f1";
import { getRaceImage, getRaceImageFallback } from "../lib/site-images";

export const revalidate = 1800;

export default async function CalendarPage({ searchParams }: { searchParams?: { season?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  const nextRace = data.races.find((race) => new Date(`${race.date}T${race.time}`).getTime() >= Date.now());
  return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content calendar-page" id="top">
    <PageHeading index="04" title="The race calendar." accent="" description="From lights out at the season opener to the chequered flag. Every Grand Prix on the published calendar." season={season} route="/calendar" updatedAt={data.updatedAt} />
    {nextRace && <Reveal><div className="calendar-next-banner" style={{ backgroundImage: `linear-gradient(95deg,#121318 25%,#101114cc),url("${getRaceImage(nextRace.circuitId)}"),url("${getRaceImageFallback(nextRace.circuitId)}")` }}><div><span className="section-kicker">UP NEXT · ROUND {nextRace.round}</span><h2>{nextRace.name}</h2><p>{getCountryFlag(nextRace.country)} &nbsp;{nextRace.locality}, {nextRace.country} · {nextRace.circuit}</p></div><div className="calendar-next-countdown"><small>LIGHTS OUT IN</small><Countdown date={`${nextRace.date}T${nextRace.time}`} /><span>{new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${nextRace.date}T${nextRace.time}`))}</span></div></div></Reveal>}
    {data.races.length ? <><div className="calendar-meta-row"><span>{data.races.length} ROUNDS ON THE {season} CALENDAR</span><span>{data.races.filter((race) => race.winner).length} COMPLETED · {data.races.length - data.races.filter((race) => race.winner).length} TO GO</span></div><div className="race-list">{data.races.map((race, index) => {
      const isPast = Boolean(race.winner);
      const date = new Date(`${race.date}T${race.time}`);
      return <Reveal key={race.round} delay={Math.min(index % 8, 5) * 0.035}><Link className={`race-list-card ${nextRace?.round === race.round ? "race-list-next" : ""}`} href={`/calendar/${race.round}?season=${season}`}>
        <span className="race-list-round">R{String(race.round).padStart(2, "0")}<small>ROUND</small></span><span className="race-list-visual" style={{ backgroundImage: `linear-gradient(0deg,#090a0dcc,transparent 65%),url("${getRaceImage(race.circuitId)}"),url("${getRaceImageFallback(race.circuitId)}")` }} aria-hidden="true" /><span className="race-list-flag">{getCountryFlag(race.country)}</span><span className="race-list-info"><strong>{race.name}</strong><small>{race.circuit} · {race.locality}, {race.country}</small></span><span className="race-list-result">{race.winner ? <><small>RACE WINNER</small><strong>{race.winner}</strong></> : <><small>{nextRace?.round === race.round ? "NEXT RACE · LIGHTS OUT" : "SCHEDULED"}</small><strong>{new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }).format(date).toUpperCase()}</strong></>}</span><b className="race-list-link">↗</b>
      </Link></Reveal>;
    })}</div></> : <EmptySeason season={season} />}
  </main></SiteFrame>;
}
