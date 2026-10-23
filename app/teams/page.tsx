import Link from "next/link";
import EmptySeason from "../components/EmptySeason";
import PageHeading from "../components/PageHeading";
import Reveal from "../components/Reveal";
import SiteFrame from "../components/SiteFrame";
import { CURRENT_SEASON, getSeasonData, getTeamColor, resolveSeason } from "../lib/f1";

export const revalidate = 1800;
const constructorsHistory: Record<string, { titles: number; story: string }> = {
  mercedes: { titles: 8, story: "Eight consecutive constructors' championships made the Silver Arrows a defining force of the hybrid era." },
  ferrari: { titles: 16, story: "Formula One's longest-running team has competed from Maranello since the world championship began in 1950." },
  mclaren: { titles: 9, story: "Founded by Bruce McLaren in 1963, the Woking team remains one of Grand Prix racing's most decorated names." },
  red_bull: { titles: 6, story: "A modern championship powerhouse from Milton Keynes with a legacy built on audacious engineering." },
  williams: { titles: 9, story: "One of Britain's great independent racing teams, with nine constructors' championships." },
};

export default async function TeamsPage({ searchParams }: { searchParams?: { season?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  return (
    <SiteFrame season={season} updatedAt={data.updatedAt}>
      <main className="page-content section-wrap listing-content" id="top">
        <PageHeading index="02" title="The teams." accent="" description="The constructors behind every lap. Live team points, race wins, drivers and championship history." season={season} route="/teams" updatedAt={data.updatedAt} />
        {data.constructors.length ? <div className="pro-team-grid">{data.constructors.map((team, index) => {
          const teamDrivers = data.drivers.filter((driver) => driver.constructorId === team.id);
          const history = constructorsHistory[team.id];
          return <Reveal key={team.id} delay={(index % 4) * 0.05}><Link className="pro-team-card" href={`/teams/${team.id}?season=${season}`} style={{ "--team": getTeamColor(team.id) } as React.CSSProperties}>
            <div className="pro-team-head"><span>{String(index + 1).padStart(2, "0")} · CONSTRUCTOR</span><b>{team.nationality}</b></div>
            <div className="pro-team-monogram">{team.name.replace(/[^A-Z]/g, "").slice(0, 3)}</div>
            <h2>{team.name}</h2>
            <p>{history?.story ?? `${team.name} is part of the ${season} FIA Formula One World Championship grid.`}</p>
            <div className="pro-team-stats"><span><b>{team.points}</b><small>POINTS</small></span><span><b>{team.wins}</b><small>WINS</small></span><span><b>{history?.titles ?? "—"}</b><small>CONSTRUCTOR TITLES</small></span></div>
            <div className="pro-team-drivers"><span>2026 DRIVERS</span>{teamDrivers.length ? teamDrivers.map((driver) => <span key={driver.id}>{driver.firstName} <strong>{driver.lastName}</strong></span>) : <strong>Line-up not published</strong>}</div>
            <span className="pro-team-link">EXPLORE THE TEAM ↗</span>
          </Link></Reveal>;
        })}</div> : <EmptySeason season={season} />}
        {season === CURRENT_SEASON && <p className="method-note">Current points, race wins and entries refresh from the official-results dataset. Historical constructor title counts are provided as editorial context.</p>}
      </main>
    </SiteFrame>
  );
}
