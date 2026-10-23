import Link from "next/link";
import { notFound } from "next/navigation";
import EmptySeason from "../../components/EmptySeason";
import PageHeading from "../../components/PageHeading";
import SiteFrame from "../../components/SiteFrame";
import { getSeasonData, getTeamColor, resolveSeason } from "../../lib/f1";

export const revalidate = 1800;

export default async function DriverProfilePage({ params, searchParams }: { params: { id: string }; searchParams?: { season?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  const driver = data.drivers.find((item) => item.id === params.id);
  if (!data.drivers.length) return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top"><PageHeading index="01" title="Driver" accent="profile." description="Career-to-date championship statistics from the live F1 results feed." season={season} route={`/drivers/${params.id}`} updatedAt={data.updatedAt} /><EmptySeason season={season} /></main></SiteFrame>;
  if (!driver) notFound();
  const position = data.drivers.findIndex((item) => item.id === driver.id) + 1;
  const teammate = data.drivers.find((item) => item.constructorId === driver.constructorId && item.id !== driver.id);
  return (
    <SiteFrame season={season} updatedAt={data.updatedAt}>
      <main className="page-content section-wrap listing-content" id="top">
        <PageHeading index="01" title={driver.firstName} accent={`${driver.lastName}.`} description={`${driver.constructorName} · ${driver.nationality} · car number ${driver.number || "—"}`} season={season} route={`/drivers/${driver.id}`} updatedAt={data.updatedAt} />
        <div className="profile-layout">
          <div className="profile-portrait" style={{ "--team": getTeamColor(driver.constructorId), backgroundImage: `linear-gradient(180deg,transparent 40%,#101114 100%),url(https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=1000&q=85)` }}><span className="profile-car-number">{driver.number || String(position).padStart(2, "0")}</span><span className="profile-portrait-name">{driver.firstName}<strong>{driver.lastName}</strong><small>{driver.constructorName.toUpperCase()}</small></span></div>
          <div className="profile-details"><div className="section-kicker">{season} DRIVER CHAMPIONSHIP · POSITION {position}</div><h2>{driver.firstName}<br /><em>{driver.lastName}</em></h2><p>{driver.nationality} · car number {driver.number || "not listed"}. Standings update when the source publishes new race results.</p>
            <div className="profile-stats"><div><span>{driver.points}</span><small>CHAMPIONSHIP POINTS</small></div><div><span>{driver.wins}</span><small>GRAND PRIX WINS</small></div><div><span>{driver.poles}</span><small>POLE STARTS</small></div><div><span>{driver.podiums}</span><small>PODIUMS</small></div></div>
            <div className="profile-team-row"><span>CONSTRUCTOR</span><Link href={`/teams/${driver.constructorId}?season=${season}`} style={{ color: getTeamColor(driver.constructorId) }}>{driver.constructorName} ↗</Link></div>
            <div className="profile-team-row"><span>TEAM-MATE</span><strong>{teammate ? `${teammate.firstName} ${teammate.lastName}` : "Not listed in this season's standings"}</strong></div>
            <Link className="button button-red profile-back-link" href={`/standings?season=${season}`}>Back to the championship →</Link>
          </div>
        </div>
        <p className="method-note">Driver portrait is illustrative and may not depict the named driver. Results and championship position are sourced from the Jolpica F1 API.</p>
      </main>
    </SiteFrame>
  );
}
