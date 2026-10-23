import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeading from "../../components/PageHeading";
import SiteFrame from "../../components/SiteFrame";
import { getCountryFlag, getSeasonData, resolveSeason } from "../../lib/f1";

export const revalidate = 1800;

export default async function RaceBriefingPage({ params, searchParams }: { params: { slug: string }; searchParams?: { season?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  const match = params.slug.match(/^round-(\d+)$/);
  if (!match) notFound();
  const race = data.races.find((item) => item.round === Number(match[1]));
  if (!race || !race.winner) notFound();
  const winner = data.drivers.find((driver) => `${driver.firstName} ${driver.lastName}` === race.winner);
  const winnerPosition = winner ? data.drivers.findIndex((driver) => driver.id === winner.id) + 1 : null;
  return <SiteFrame season={season} updatedAt={data.updatedAt}><main className="page-content section-wrap listing-content" id="top">
    <PageHeading index="06" title="Race briefing." accent="" description="A verified race-result report drawn from the official season results feed." season={season} route={`/news/${params.slug}`} updatedAt={data.updatedAt} />
    <article className="briefing-article"><div className="briefing-masthead"><span className="section-kicker">{getCountryFlag(race.country)} · ROUND {race.round} · {season}</span><h2>{race.name}</h2><p>{race.circuit} · {race.locality}, {race.country} · {new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${race.date}T${race.time}`))}</p></div><div className="briefing-winner"><span>GRAND PRIX WINNER</span><strong>{race.winner}</strong><small>{winner ? `${winner.constructorName} · championship position ${winnerPosition} · ${winner.points} season points` : "Winner confirmed by the Grand Prix results feed."}</small></div><div className="briefing-copy"><h3>What the official results show</h3><p>{race.winner} won the {race.name} at {race.circuit} in the {season} season. That result is recorded in the championship standings and contributes to the ongoing battle across both the drivers&apos; and constructors&apos; championships.</p><p>This briefing is generated from the published race results; it does not contain independent reporting, unsourced quotations or speculative details.</p><div className="briefing-links"><Link className="text-link" href={`/calendar/${race.round}?season=${season}`}>Race weekend →</Link><Link className="text-link" href={`/standings?season=${season}`}>Updated championship standings →</Link><Link className="text-link" href="/news">All race briefings →</Link></div></div></article>
  </main></SiteFrame>;
}
