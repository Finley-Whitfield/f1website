import Link from "next/link";
import Countdown from "./components/Countdown";
import HomeHeroEntrance from "./components/HomeHeroEntrance";
import Reveal from "./components/Reveal";
import SeasonPicker from "./components/SeasonPicker";
import SiteFrame from "./components/SiteFrame";
import { getCurrentSeason, getCountryFlag, getSeasonData, getSeasonStatus, getTeamColor, resolveSeason } from "./lib/f1";
import { getDriverImage, getDriverImageByName, getDriverImageFallback, getRaceImage, getRaceImageFallback } from "./lib/site-images";

export const revalidate = 1800;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { season?: string | string[] };
}) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  const leader = data.drivers[0];
  const constructorLeader = data.constructors[0];
  const nextRace = data.races.find((race) => new Date(`${race.date}T${race.time}`).getTime() >= Date.now());
  const lastRace = [...data.races].reverse().find((race) => race.winner);

  return (
    <SiteFrame season={season} updatedAt={data.updatedAt}>
      <main className="page-content home-content">
        <section className="home-hero" id="top">
          <div className="hero-photo" />
          <div className="hero-scrim" />
          <div className="hero-lines" />
          <HomeHeroEntrance>
            <div className="eyebrow"><span className="eyebrow-line" /> THE WORLD’S FASTEST SPORT <span className="eyebrow-line" /></div>
            <p className="section-kicker hero-season">{season} · FIA FORMULA ONE WORLD CHAMPIONSHIP</p><h1>THE EDGE<br />OF <span>EVERYTHING.</span></h1>
            <p className="home-hero-copy">Every lap. Every heartbeat. Every split-second that changes the game.<br />Live standings, race weekends and stories from the world of Formula One.</p><div className="hero-buttons"><Link className="button button-red" href={`/standings?season=${season}`}>View live standings <span>→</span></Link><Link className="button button-glass" href="/calendar">Explore the calendar</Link></div>
            <div className="hero-credits"><span>THE {season} SEASON, AS IT HAPPENS</span><span>DATA REFRESHES AUTOMATICALLY</span></div>
          </HomeHeroEntrance>
        </section>

        <Reveal><section className="section-wrap home-season-strip">
          <div className="season-status"><span className="live-dot" /><div><strong>{season} WORLD CHAMPIONSHIP</strong><small>{getSeasonStatus(data)}</small></div></div>
          <SeasonPicker season={season} route="/" />
          <a className="source-note" href="https://api.jolpi.ca/ergast/f1/" target="_blank" rel="noreferrer">OFFICIAL RESULTS FEED ↗</a>
        </section></Reveal>

        <section className="section-wrap home-main-section">
          <Reveal><div className="section-heading"><div><div className="section-kicker">THE STORY SO FAR</div><h2>A season <em>in motion.</em></h2><p>Real championship standings, race calendar and results — refreshed every 30 minutes.</p></div><Link className="text-link" href={`/standings?season=${season}`}>All standings <span>→</span></Link></div></Reveal>
          {!data.available ? (
            <div className="data-empty"><strong>{season} season results have not been published yet.</strong><p>The {season} standings and calendar will appear here automatically as the official feed is released.</p>            {season !== getCurrentSeason() && <Link className="text-link" href={`/standings?season=${getCurrentSeason()}`}>Explore the {getCurrentSeason()} season →</Link>}</div>
          ) : (
            <div className="home-grid">
              <Reveal className="home-leader-card" delay={0.08}>
                <div className="home-panel-head"><div><span>DRIVER CHAMPIONSHIP</span><small>{season} · {getSeasonStatus(data)}</small></div><Link href={`/standings?season=${season}`}>FULL TABLE <b>↗</b></Link></div>
                {data.drivers.slice(0, 5).map((driver, index) => (
                  <Link href={`/drivers/${driver.id}?season=${season}`} className={`home-standing-row ${index === 0 ? "home-leader-row" : ""}`} key={driver.id}>
                    <span className="home-position">{String(index + 1).padStart(2, "0")}</span><span className="home-driver-avatar" style={{ backgroundImage: `url("${getDriverImageByName(`${driver.firstName} ${driver.lastName}`)}"),url("${getDriverImage(driver.id)}"),url("${getDriverImageFallback(driver.id)}")` }} /><span className="home-driver-color" style={{ background: getTeamColor(driver.constructorId) }} />
                    <span className="home-driver-name">{driver.firstName} <strong>{driver.lastName}</strong><small>{driver.constructorName}</small></span>
                    <span className="home-points-bar"><i style={{ width: `${leader ? (driver.points / leader.points) * 100 : 0}%`, background: getTeamColor(driver.constructorId) }} /></span>
                    <strong className="home-points">{driver.points}<small>PTS</small></strong>
                  </Link>
                ))}
                {data.drivers.length === 0 && <p className="data-message">The drivers&apos; championship standings will be available when this season begins.</p>}
                <div className="home-panel-foot"><span>POINTS · GRAND PRIX WINS · CURRENT POSITION</span><Link href={`/standings?season=${season}`}>FULL STANDINGS →</Link></div>
              </Reveal>

              <Reveal className="home-race-card" delay={0.18}>
                <div className="home-panel-head"><div><span>{nextRace ? "NEXT RACE" : "LATEST RACE"}</span><small>{nextRace ? `ROUND ${nextRace.round} · ${season}` : `${season} SEASON`}</small></div><span className="live-tag"><i /> {nextRace ? "UP NEXT" : "SEASON COMPLETE"}</span></div>
                {nextRace ? <><div className="home-race-backdrop" style={{ backgroundImage: `linear-gradient(90deg,rgba(10,10,13,.89),rgba(10,10,13,.3)),linear-gradient(0deg,#111216,transparent 90%),url("${getRaceImage(nextRace.circuitId)}"),url("${getRaceImageFallback(nextRace.circuitId)}")` }} /><div className="home-race-content"><span className="home-race-flag">{getCountryFlag(nextRace.country)}</span><span className="section-kicker">{nextRace.locality}, {nextRace.country}</span><h3>{nextRace.name}</h3><p>{nextRace.circuit}</p><div className="race-countdown-label">LIGHTS OUT IN</div><Countdown date={`${nextRace.date}T${nextRace.time}`} /><small className="race-date-label">{new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${nextRace.date}T${nextRace.time}`))}</small><Link className="button button-red" href={`/calendar/${nextRace.round}?season=${season}`}>Race weekend details →</Link></div></> : lastRace ? <div className="home-race-content completed-race" style={{ backgroundImage: `linear-gradient(150deg,transparent,#e1060019),url("${getRaceImage(lastRace.circuitId)}"),url("${getRaceImageFallback(lastRace.circuitId)}")` }}><span className="home-race-flag">{getCountryFlag(lastRace.country)}</span><span className="section-kicker">ROUND {lastRace.round} · {season}</span><h3>{lastRace.name}</h3><p>Last Grand Prix winner</p><strong className="last-winner">{lastRace.winner}</strong><Link className="button button-red" href={`/calendar/${lastRace.round}?season=${season}`}>View race result →</Link></div> : <div className="home-race-content"><span className="section-kicker">THE GRID IS FORMING</span><h3>{season} calendar</h3><p>The season schedule will be added as soon as it is announced.</p><Link className="text-link" href="/calendar">Explore past races →</Link></div>}
              </Reveal>
            </div>
          )}
        </section>

        {data.available && (
          <Reveal><section className="season-snapshot">
            <div className="section-wrap"><div className="section-kicker">CHAMPIONSHIP SNAPSHOT</div><div className="snapshot-grid"><div><span>DRIVER LEADER</span><strong>{leader ? `${leader.firstName} ${leader.lastName}` : "—"}</strong><small>{leader ? `${leader.points} POINTS · ${leader.wins} WINS` : "STANDINGS NOT PUBLISHED"}</small></div><div><span>CONSTRUCTOR LEADER</span><strong>{constructorLeader?.name ?? "—"}</strong><small>{constructorLeader ? `${constructorLeader.points} POINTS · ${constructorLeader.wins} WINS` : "STANDINGS NOT PUBLISHED"}</small></div><div><span>RACES THIS SEASON</span><strong>{data.races.length || "—"}</strong><small>{data.races.filter((race) => race.winner).length} RACE RESULTS RECORDED</small></div><div><span>LATEST RACE WINNER</span><strong>{lastRace?.winner ?? "Awaiting lights out"}</strong><small>{lastRace ? `${lastRace.name.toUpperCase()} · ROUND ${lastRace.round}` : "NO RACE RESULTS YET"}</small></div></div></div>
          </section></Reveal>
        )}

        <section className="section-wrap home-more"><Reveal><div className="section-heading"><div><div className="section-kicker">THE WORLD OF FORMULA ONE</div><h2>Pick your <em>front row.</em></h2></div></div></Reveal><div className="home-route-grid">
         {[["DRIVER LINE-UP", "Follow every driver on the grid.", "/drivers", "01"], ["CONSTRUCTORS", "Discover the teams shaping F1.", "/teams", "02"], ["RACE CALENDAR", "Twenty-four weekends around the world.", "/calendar", "03"], ["CIRCUITS", "Explore corners, circuits and history.", "/circuits", "04"]].map(([title, description, href, number], index) => <Reveal key={href} delay={index * 0.08}><Link className="home-route-card" href={href}><span>{number}</span><strong>{title}</strong><p>{description}</p><b>↗</b></Link></Reveal>)}
        </div></section>
      </main>
    </SiteFrame>
  );
}
