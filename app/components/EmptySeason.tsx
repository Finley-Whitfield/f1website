import Link from "next/link";
import { CURRENT_SEASON } from "../lib/f1";

export default function EmptySeason({ season }: { season: number }) {
  return (
    <div className="data-empty">
      <span className="section-kicker">{season} · GRID NOT YET PUBLISHED</span>
      <h2>The season is <em>getting ready.</em></h2>
      <p>The official feed has not published the {season} race calendar or championship standings yet. This page automatically picks up the schedule, teams, drivers and results as soon as they are released.</p>
      {season !== CURRENT_SEASON && <Link className="button button-red" href="/standings">Follow the {CURRENT_SEASON} championship →</Link>}
    </div>
  );
}
