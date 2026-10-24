import Link from "next/link";
import { notFound } from "next/navigation";
import EmptySeason from "../../components/EmptySeason";
import PageHeading from "../../components/PageHeading";
import SiteFrame from "../../components/SiteFrame";
import { getDriverCareerHistory, getSeasonData, getTeamColor, resolveSeason } from "../../lib/f1";
import { getDriverImage, getDriverImageByName, getDriverImageFallback } from "../../lib/site-images";

export const revalidate = 1800;

export default async function DriverProfilePage({ params, searchParams }: { params: { id: string }; searchParams?: { season?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  const driver = data.drivers.find((item) => item.id === params.id);
  if (!data.drivers.length) return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top"><PageHeading index="01" title="Driver" accent="profile." description="Career-to-date championship statistics from the live F1 results feed." season={season} route={`/drivers/${params.id}`} updatedAt={data.updatedAt} /><EmptySeason season={season} /></main></SiteFrame>;
  if (!driver) notFound();
  const career = await getDriverCareerHistory(driver.id);
  const position = data.drivers.findIndex((item) => item.id === driver.id) + 1;
  const teammate = data.drivers.find((item) => item.constructorId === driver.constructorId && item.id !== driver.id);
  return (
    <SiteFrame season={season} updatedAt={data.updatedAt}>
      <main className="page-content section-wrap listing-content" id="top">
        <PageHeading index="01" title={driver.firstName} accent={`${driver.lastName}.`} description={`${driver.constructorName} · ${driver.nationality} · car number ${driver.number || "—"}`} season={season} route={`/drivers/${driver.id}`} updatedAt={data.updatedAt} />
        <div className="profile-layout">
          <div className="profile-portrait" style={{ "--team": getTeamColor(driver.constructorId), backgroundImage: `linear-gradient(180deg,transparent 40%,#101114 100%),url("${getDriverImageByName(`${driver.firstName} ${driver.lastName}`)}"),url("${getDriverImage(driver.id)}"),url("${getDriverImageFallback(driver.id)}")` } as React.CSSProperties}><span className="profile-car-number">{driver.number || String(position).padStart(2, "0")}</span><span className="profile-portrait-name">{driver.firstName}<strong>{driver.lastName}</strong><small>{driver.constructorName.toUpperCase()}</small></span></div>
          <div className="profile-details"><div className="section-kicker">{season} DRIVER CHAMPIONSHIP · POSITION {position}</div><h2>{driver.firstName}<br /><em>{driver.lastName}</em></h2><p>{driver.nationality} · car number {driver.number || "not listed"}. Standings update when the source publishes new race results.</p>
            <div className="profile-stats"><div><span>{driver.points}</span><small>CHAMPIONSHIP POINTS</small></div><div><span>{driver.wins}</span><small>GRAND PRIX WINS</small></div><div><span>{driver.poles}</span><small>POLE STARTS</small></div><div><span>{driver.podiums}</span><small>PODIUMS</small></div></div>
            <div className="profile-team-row"><span>CONSTRUCTOR</span><Link href={`/teams/${driver.constructorId}?season=${season}`} style={{ color: getTeamColor(driver.constructorId) }}>{driver.constructorName} ↗</Link></div>
            <div className="profile-team-row"><span>TEAM-MATE</span><strong>{teammate ? `${teammate.firstName} ${teammate.lastName}` : "Not listed in this season's standings"}</strong></div>
            <Link className="button button-red profile-back-link" href={`/standings?season=${season}`}>Back to the championship →</Link>
          </div>
        </div>
        <section className="history-panel">
          <div className="history-panel-heading">
            <div><span className="section-kicker">THE CAREER SO FAR</span><h2>Every lap <em>counts.</em></h2><p>Career totals calculated from the published Grand Prix result archive.</p></div>
            <span className="history-data-stamp">JOLPICA F1 ARCHIVE · {career.activeSeasons.length ? `${career.activeSeasons[0]}–${career.activeSeasons[career.activeSeasons.length - 1]}` : "HISTORY UNAVAILABLE"}</span>
          </div>
          {career.starts ? <>
            <div className="history-stat-grid">
              <div><strong>{career.starts}</strong><span>GRAND PRIX STARTS</span></div>
              <div><strong>{career.wins}</strong><span>CAREER WINS</span></div>
              <div><strong>{career.podiums}</strong><span>CAREER PODIUMS</span></div>
              <div><strong>{career.poles}</strong><span>POLE STARTS</span></div>
              <div><strong>{career.points.toLocaleString("en-GB")}</strong><span>CAREER POINTS</span></div>
              <div><strong>{career.bestFinish ? `P${career.bestFinish}` : "—"}</strong><span>BEST FINISH</span></div>
            </div>
            <div className="history-milestones">
              <div><span>FORMULA ONE DEBUT</span><strong>{career.firstRace ? `${career.firstRace.name}, ${career.firstRace.season}` : "Not in the published archive"}</strong>{career.firstRace && <small>{career.firstRace.circuit}</small>}</div>
              <div><span>MOST RECENT RESULT</span><strong>{career.latestRace ? `${career.latestRace.name}, ${career.latestRace.season}` : "Not in the published archive"}</strong>{career.latestRace && <small>{career.latestRace.circuit} · {career.latestRace.result}</small>}</div>
              <div><span>CAREER CONSTRUCTORS</span><strong>{career.teams.length ? career.teams.map((team) => team.name).join(" · ") : "Not listed in the published archive"}</strong></div>
            </div>
          </> : <p className="history-unavailable">No historical race results are currently available for this driver in the published archive.</p>}
        </section>
        <p className="method-note">Add a personal portrait as <code>public/images/drivers/{driver.id}.jpg</code> or <code>public/images/drivers/{driver.firstName.replace(/\s+/g, "_")}_{driver.lastName}.jpg</code>. Results and championship position are sourced from the Jolpica F1 API.</p>
      </main>
    </SiteFrame>
  );
}
