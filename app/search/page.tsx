import Link from "next/link";
import EmptySeason from "../components/EmptySeason";
import PageHeading from "../components/PageHeading";
import SiteFrame from "../components/SiteFrame";
import { getCountryFlag, getSeasonData, getTeamColor, resolveSeason } from "../lib/f1";

export const revalidate = 1800;

export default async function SearchPage({ searchParams }: { searchParams?: { season?: string | string[]; q?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const query = (Array.isArray(searchParams?.q) ? searchParams?.q[0] : searchParams?.q ?? "").trim();
  const data = await getSeasonData(season);
  const term = query.toLowerCase();
  const drivers = data.drivers.filter((driver) => `${driver.firstName} ${driver.lastName} ${driver.constructorName}`.toLowerCase().includes(term));
  const teams = data.constructors.filter((team) => team.name.toLowerCase().includes(term));
  const races = data.races.filter((race) => `${race.name} ${race.circuit} ${race.locality} ${race.country}`.toLowerCase().includes(term));
  const hasResults = drivers.length + teams.length + races.length > 0;

  return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top">
    <PageHeading index="07" title="Search the grid." accent="" description={`Search current drivers, constructors, circuits and race weekends in the ${season} season.`} season={season} route="/search" updatedAt={data.updatedAt} />
    <form className="search-page-form" action="/search"><input type="hidden" name="season" value={season} /><label htmlFor="search-all">DRIVER, TEAM, CIRCUIT OR GRAND PRIX</label><div><input id="search-all" name="q" defaultValue={query} placeholder="Try a driver, team, circuit or Grand Prix…" autoFocus /><button className="button button-red" type="submit">SEARCH ↗</button></div></form>
    {!query ? <div className="data-empty"><h2>Find your <em>front row.</em></h2><p>Search live championship entries, the published race schedule and circuit locations.</p></div> : !data.available ? <EmptySeason season={season} /> : hasResults ? <>
      {drivers.length > 0 && <section className="search-results-section"><div className="news-section-label"><span>DRIVERS</span><span>{drivers.length} RESULTS</span></div>{drivers.map((driver, index) => <Link className="search-result-row" href={`/drivers/${driver.id}?season=${season}`} key={driver.id}><span className="standing-position">{String(index + 1).padStart(2, "0")}</span><span className="search-result-mark" style={{ background: getTeamColor(driver.constructorId) }} /><span><strong>{driver.firstName} {driver.lastName}</strong><small>{driver.constructorName} · {driver.nationality} · car {driver.number || "—"}</small></span><b>{driver.points} PTS ↗</b></Link>)}</section>}
      {teams.length > 0 && <section className="search-results-section"><div className="news-section-label"><span>CONSTRUCTORS</span><span>{teams.length} RESULTS</span></div>{teams.map((team) => <Link className="search-result-row" href={`/teams/${team.id}?season=${season}`} key={team.id}><span className="search-result-mark" style={{ background: getTeamColor(team.id) }} /><span><strong>{team.name}</strong><small>{team.nationality} constructor</small></span><b>{team.points} PTS ↗</b></Link>)}</section>}
      {races.length > 0 && <section className="search-results-section"><div className="news-section-label"><span>GRAND PRIX & CIRCUITS</span><span>{races.length} RESULTS</span></div>{races.map((race) => <Link className="search-result-row" href={`/calendar/${race.round}?season=${season}`} key={`${race.round}-${race.circuitId}`}><span className="search-result-flag">{getCountryFlag(race.country)}</span><span><strong>{race.name}</strong><small>{race.circuit} · {race.locality}, {race.country}</small></span><b>{race.winner ?? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${race.date}T${race.time}`))} ↗</b></Link>)}</section>}
    </> : <div className="data-empty"><h2>No results for <em>“{query}”.</em></h2><p>Try a driver surname, constructor name, host city or Grand Prix.</p></div>}
  </main></SiteFrame>;
}
