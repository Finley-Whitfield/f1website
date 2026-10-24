import Link from "next/link";
import EmptySeason from "../components/EmptySeason";
import PageHeading from "../components/PageHeading";
import SiteFrame from "../components/SiteFrame";
import { getSeasonData, getTeamColor, resolveSeason } from "../lib/f1";
import Reveal from "../components/Reveal";
import { getDriverImage, getDriverImageByName, getDriverImageFallback } from "../lib/site-images";

export const revalidate = 1800;

export default async function StandingsPage({ searchParams }: { searchParams?: { season?: string | string[]; type?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const typeValue = Array.isArray(searchParams?.type) ? searchParams?.type[0] : searchParams?.type;
  const type = typeValue === "constructors" ? "constructors" : "drivers";
  const data = await getSeasonData(season);
  const rows = type === "drivers" ? data.drivers : data.constructors;
  const maxPoints = Math.max(1, ...rows.map((entry) => entry.points));

  return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top">
    <PageHeading index="03" title="The championship." accent="" description="Every point, win and position from the official Formula One results feed. Choose the drivers' or constructors' championship." season={season} route="/standings" updatedAt={data.updatedAt} />
    <Reveal><div className="championship-switch"><Link className={type === "drivers" ? "championship-option active" : "championship-option"} href={`/standings?season=${season}&type=drivers`}>01 <span>DRIVERS</span><small>{data.drivers.length} CLASSIFIED</small></Link><Link className={type === "constructors" ? "championship-option active" : "championship-option"} href={`/standings?season=${season}&type=constructors`}>02 <span>CONSTRUCTORS</span><small>{data.constructors.length} TEAMS</small></Link></div></Reveal>
    {rows.length ? <section className="standings-full">
      <div className="standings-full-head"><span>POSITION</span><span>{type === "drivers" ? "DRIVER / CONSTRUCTOR" : "CONSTRUCTOR / NATIONALITY"}</span><span>POINTS PROGRESS</span><span>WINS</span><span>POINTS</span></div>
      {rows.map((entry, index) => {
        const isDriver = "firstName" in entry;
        const href = isDriver ? `/drivers/${entry.id}?season=${season}` : `/teams/${entry.id}?season=${season}`;
        const team = isDriver ? getTeamColor(entry.constructorId) : getTeamColor(entry.id);
        const label = isDriver ? `${entry.firstName} ${entry.lastName}` : entry.name;
        const sublabel = isDriver ? entry.constructorName : entry.nationality;
        return <Reveal className="standing-row-reveal" key={entry.id} delay={Math.min(index, 7) * 0.045}><Link className={`standings-full-row ${index === 0 ? "standings-first" : ""}`} href={href}>
          <span className="standing-position">{String(index + 1).padStart(2, "0")}</span><span className="standings-full-name">{isDriver && <span className="standing-avatar" style={{ backgroundImage: `url("${getDriverImageByName(label)}"),url("${getDriverImage(entry.id)}"),url("${getDriverImageFallback(entry.id)}")` }} aria-hidden="true" />}<i style={{ background: team }} /><span><strong>{label}</strong><small>{sublabel}</small></span></span>
          <span className="standings-full-bar"><i style={{ background: team, width: `${(entry.points / maxPoints) * 100}%` }} /></span><span className="standings-wins">{entry.wins}<small>WINS</small></span><strong className="standings-full-points">{entry.points}<small>PTS</small></strong>
        </Link></Reveal>;
      })}
      <div className="standings-source-note">POSITIONS AND POINTS FROM THE {season} FIA FORMULA ONE WORLD CHAMPIONSHIP · AFTER ROUND {data.round || "—"}</div>
    </section> : <EmptySeason season={season} />}
    <div className="season-note"><span className="live-dot" /> RESULTS AUTOMATICALLY REFRESH FROM THE JOLPICA F1 API · LAST VERIFIED {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(data.updatedAt))} UTC</div>
  </main></SiteFrame>;
}
