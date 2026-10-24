import DriverExplorer from "../components/DriverExplorer";
import EmptySeason from "../components/EmptySeason";
import PageHeading from "../components/PageHeading";
import SiteFrame from "../components/SiteFrame";
import { getCurrentSeason, getSeasonData, resolveSeason } from "../lib/f1";

export const revalidate = 1800;

export default async function DriversPage({ searchParams }: { searchParams?: { season?: string | string[] } }) {
  const season = resolveSeason(searchParams?.season);
  const data = await getSeasonData(season);
  return (
    <SiteFrame season={season} updatedAt={data.updatedAt}>
      <main className="page-content section-wrap listing-content" id="top">
        <PageHeading index="01" title="Meet the" accent="drivers." description="Every driver on the grid, with current championship points, race wins, pole starts and podiums." season={season} route="/drivers" updatedAt={data.updatedAt} />
        {data.drivers.length ? (
          <>
            <div className="data-summary-strip"><span><strong>{data.drivers.length}</strong> CLASSIFIED DRIVERS</span><span><strong>{data.constructors.length}</strong> CONSTRUCTORS</span><span>POLES COUNTED FROM GRAND PRIX STARTING GRIDS</span><span>RESULTS THROUGH ROUND {data.round || "—"}</span></div>
            <DriverExplorer drivers={data.drivers} season={season} />
          </>
        ) : <EmptySeason season={season} />}
        {season === getCurrentSeason() && <p className="method-note">Statistics are calculated from completed Grand Prix results in the Jolpica F1 data feed. Driver photos are illustrative and may not depict the named driver.</p>}
      </main>
    </SiteFrame>
  );
}
