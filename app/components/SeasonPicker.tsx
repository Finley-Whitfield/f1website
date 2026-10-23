import Link from "next/link";
import { SUPPORTED_SEASONS } from "../lib/f1";

export default function SeasonPicker({
  season,
  route,
}: {
  season: number;
  route: string;
}) {
  return (
    <div className="season-picker" aria-label="Choose championship season">
      {SUPPORTED_SEASONS.map((year) => (
        <Link
          key={year}
          href={`${route}?season=${year}`}
          aria-current={season === year ? "page" : undefined}
          className={season === year ? "season-option selected" : "season-option"}
        >
          {year}
          {year === 2027 ? <span className="season-upcoming">NEW</span> : null}
        </Link>
      ))}
    </div>
  );
}
