import SeasonPicker from "./SeasonPicker";

export default function PageHeading({
  index,
  title,
  accent,
  description,
  season,
  route,
  updatedAt,
}: {
  index: string;
  title: string;
  accent: string;
  description: string;
  season: number;
  route: string;
  updatedAt: string;
}) {
  const stamp = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(updatedAt));
  return (
    <section className="page-heading" id="top">
      <div className="section-kicker">{index} / APEX RACING HUB</div>
      <div className="page-heading-row">
        <div>
          <h1>{title} <em>{accent}</em></h1>
          <p>{description}</p>
        </div>
        <SeasonPicker season={season} route={route} />
      </div>
      <div className="data-attribution">
        <span><i className="live-dot" /> {season} FIA FORMULA ONE WORLD CHAMPIONSHIP</span>
        <span>DATA REFRESHED {stamp} UTC · <a href="https://api.jolpi.ca/ergast/f1/" target="_blank" rel="noreferrer">JOLPICA F1 API ↗</a></span>
      </div>
    </section>
  );
}
