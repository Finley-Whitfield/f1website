import Link from "next/link";
import { notFound } from "next/navigation";
import EmptySeason from "../../components/EmptySeason";
import PageHeading from "../../components/PageHeading";
import SiteFrame from "../../components/SiteFrame";
import { getSeasonData, getTeamColor, resolveSeason } from "../../lib/f1";

export const revalidate = 1800;
const titles: Record<string, number> = { mercedes: 8, ferrari: 16, mclaren: 9, red_bull: 6, williams: 9 };
const history: Record<string, string> = {
  mercedes: "The Silver Arrows built one of Formula One's most dominant modern dynasties, taking eight consecutive constructors' championships in the hybrid era.",
  ferrari: "The only team to compete in every Formula One world championship since it began in 1950. Ferrari's Prancing Horse calls Maranello home.",
  mclaren: "Bruce McLaren founded the team in 1963. More than sixty years later, the Woking squad still fights for the biggest prizes in motorsport.",
  red_bull: "Since joining F1 in 2005, Red Bull has grown from an ambitious newcomer into a multiple world championship-winning team.",
  williams: "Nine constructors' championships and a proud independent spirit make Williams one of the most successful names in the sport.",
};

export default async function TeamProfilePage({ params, searchParams }: { params: { id: string }; searchParams?: { season?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  const team = data.constructors.find((item) => item.id === params.id);
  if (!data.constructors.length) return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top"><PageHeading index="02" title="Constructor" accent="profile." description="A closer look at the teams that make Formula One." season={season} route={`/teams/${params.id}`} updatedAt={data.updatedAt} /><EmptySeason season={season} /></main></SiteFrame>;
  if (!team) notFound();
  const teamDrivers = data.drivers.filter((driver) => driver.constructorId === team.id);
  const position = data.constructors.findIndex((entry) => entry.id === team.id) + 1;
  return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top">
    <PageHeading index="02" title={team.name} accent="." description={`${team.nationality} constructor · ${season} FIA Formula One World Championship`} season={season} route={`/teams/${team.id}`} updatedAt={data.updatedAt} />
    <section className="team-profile-panel" style={{ "--team": getTeamColor(team.id) } as React.CSSProperties}><div className="team-profile-art"><span>{team.name.toUpperCase()}</span><strong>{String(position).padStart(2, "0")}</strong><small>CONSTRUCTOR STANDING · {season}</small></div><div className="team-profile-info"><div className="section-kicker">THE CONSTRUCTOR</div><h2>{team.name}<em>.</em></h2><p>{history[team.id] ?? `${team.name} competes in the ${season} FIA Formula One World Championship. Team details and standings are updated from the race results feed.`}</p><div className="profile-stats"><div><span>{team.points}</span><small>CHAMPIONSHIP POINTS</small></div><div><span>{team.wins}</span><small>GRAND PRIX WINS</small></div><div><span>{titles[team.id] ?? "—"}</span><small>CONSTRUCTOR TITLES</small></div><div><span>#{position}</span><small>CHAMPIONSHIP PLACE</small></div></div><h3 className="team-driver-heading">{season} RACE DRIVERS</h3><div className="team-driver-list">{teamDrivers.length ? teamDrivers.map((driver) => <Link href={`/drivers/${driver.id}?season=${season}`} key={driver.id}><span>{driver.number || "—"}</span><strong>{driver.firstName} {driver.lastName}</strong><small>{driver.points} PTS · {driver.wins} WINS</small><b>↗</b></Link>) : <p>Driver entries are not yet published for this season.</p>}</div><Link className="button button-red" href={`/standings?season=${season}&type=constructors`}>View constructor championship →</Link></div></section>
  </main></SiteFrame>;
}
