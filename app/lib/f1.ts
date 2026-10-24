export type DriverStanding = {
  id: string;
  firstName: string;
  lastName: string;
  number: string;
  nationality: string;
  points: number;
  wins: number;
  poles: number;
  podiums: number;
  constructorId: string;
  constructorName: string;
};

export type ConstructorStanding = {
  id: string;
  name: string;
  nationality: string;
  points: number;
  wins: number;
};

export type RaceEvent = {
  round: number;
  id: string;
  name: string;
  date: string;
  time: string;
  circuit: string;
  circuitId: string;
  circuitUrl: string;
  locality: string;
  country: string;
  winner?: string;
  image?: string;
};

export type SeasonData = {
  season: number;
  round: number;
  updatedAt: string;
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
  races: RaceEvent[];
  winners: Record<string, string>;
  available: boolean;
};

type ErgastResponse<T> = { MRData?: T };
type StandingResponse = {
  StandingsTable?: {
    StandingsLists?: Array<{
      round: string;
      DriverStandings?: Array<{
        position: string;
        points: string;
        wins: string;
        Driver: {
          driverId: string;
          permanentNumber?: string;
          givenName: string;
          familyName: string;
          nationality: string;
        };
        Constructors: Array<{ constructorId: string; name: string; nationality: string }>;
      }>;
      ConstructorStandings?: Array<{
        position: string;
        points: string;
        wins: string;
        Constructor: { constructorId: string; name: string; nationality: string };
      }>;
    }>;
  };
};
type ScheduleResponse = {
  RaceTable?: {
    Races?: Array<{
      round: string;
      raceName: string;
      date: string;
      time?: string;
      Circuit: {
        circuitId: string;
        url: string;
        circuitName: string;
        Location: { locality: string; country: string };
      };
    }>;
  };
};
type ResultsResponse = {
  RaceTable?: {
    Races?: Array<{
      round: string;
      Results?: Array<{ position: string; grid?: string; Driver: { givenName: string; familyName: string } }>;
    }>;
  };
};

const API_ROOT = "https://api.jolpi.ca/ergast/f1";
const SEASON_REVALIDATE_SECONDS = 1800;
const HISTORY_REVALIDATE_SECONDS = 86400;
const seasonDriverExclusions: Record<number, ReadonlySet<string>> = {
  2026: new Set(["albon", "tsunoda"]),
};

async function fetchF1Endpoint<T>(
  path: string,
  context: string,
): Promise<(T & { total?: string; limit?: string; offset?: string }) | null> {
  try {
    const response = await fetch(`${API_ROOT}/${path}`, {
      next: { revalidate: context === "season" ? SEASON_REVALIDATE_SECONDS : HISTORY_REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      if (response.status !== 404) {
        console.error(`F1 data provider returned HTTP ${response.status} (${path}).`);
      }
      return null;
    }
    const body = await response.json() as ErgastResponse<T>;
    return body.MRData ?? null;
  } catch (error) {
    console.error(`Unable to fetch F1 data (${path}).`, error);
    return null;
  }
}

async function fetchSeasonEndpoint<T>(season: number, path: string): Promise<T | null> {
  return fetchF1Endpoint<T>(`${season}/${path}`, "season");
}

type HistoryRace = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  Circuit: {
    circuitName: string;
    Location: { locality: string; country: string };
  };
  Results?: Array<{
    position: string;
    positionText?: string;
    grid?: string;
    points?: string;
    Driver: { driverId: string; givenName: string; familyName: string };
    Constructor?: { constructorId: string; name: string };
  }>;
};

type HistoryResponse = { RaceTable?: { Races?: HistoryRace[] } };

export type DriverCareerHistory = {
  starts: number;
  wins: number;
  podiums: number;
  poles: number;
  points: number;
  bestFinish: number | null;
  activeSeasons: number[];
  teams: Array<{ id: string; name: string }>;
  firstRace: { name: string; season: number; circuit: string } | null;
  latestRace: { name: string; season: number; circuit: string; result: string } | null;
};

export type CircuitHistoryRace = {
  season: number;
  round: number;
  name: string;
  date: string;
  winner: string;
  winnerId: string;
  constructor: string;
  locality: string;
  country: string;
};

export type CircuitHistory = {
  races: CircuitHistoryRace[];
  debut: number | null;
  grandPrixCount: number;
  mostSuccessfulDriver: { name: string; wins: number } | null;
  mostSuccessfulConstructor: { name: string; wins: number } | null;
};

export async function getDriverCareerHistory(driverId: string): Promise<DriverCareerHistory> {
  const endpoint = `drivers/${encodeURIComponent(driverId)}/results.json`;
  const firstPage = await fetchF1Endpoint<HistoryResponse>(`${endpoint}?limit=100`, "history");
  const firstRaces = firstPage?.RaceTable?.Races ?? [];
  const total = Number(firstPage?.total ?? firstRaces.length);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, Math.ceil((total - 100) / 100)) }, (_, index) =>
      fetchF1Endpoint<HistoryResponse>(`${endpoint}?limit=100&offset=${(index + 1) * 100}`, "history"),
    ),
  );
  const races = [
    ...firstRaces,
    ...remainingPages.flatMap((page) => page?.RaceTable?.Races ?? []),
  ];
  const results = races.flatMap((race) => (race.Results ?? []).map((result) => ({ race, result })));
  const teams = new Map<string, string>();
  const activeSeasons = new Set<number>();
  let wins = 0;
  let podiums = 0;
  let poles = 0;
  let points = 0;
  let bestFinish: number | null = null;

  for (const { race, result } of results) {
    activeSeasons.add(Number(race.season));
    const finish = Number(result.position);
    if (Number.isFinite(finish)) {
      bestFinish = bestFinish === null ? finish : Math.min(bestFinish, finish);
      if (finish === 1) wins += 1;
      if (finish <= 3) podiums += 1;
    }
    if (Number(result.grid) === 1) poles += 1;
    points += Number(result.points ?? 0);
    if (result.Constructor) teams.set(result.Constructor.constructorId, result.Constructor.name);
  }

  const first = races[0];
  const latest = races[races.length - 1];
  const latestResult = latest?.Results?.[0];

  return {
    starts: races.length,
    wins,
    podiums,
    poles,
    points,
    bestFinish,
    activeSeasons: Array.from(activeSeasons).sort((a, b) => a - b),
    teams: Array.from(teams.entries()).map(([id, name]) => ({ id, name })),
    firstRace: first
      ? { name: first.raceName, season: Number(first.season), circuit: first.Circuit.circuitName }
      : null,
    latestRace: latest && latestResult
      ? {
          name: latest.raceName,
          season: Number(latest.season),
          circuit: latest.Circuit.circuitName,
          result: latestResult.positionText ?? latestResult.position,
        }
      : null,
  };
}

export async function getCircuitHistory(circuitId: string): Promise<CircuitHistory> {
  const [response, scheduleResponse] = await Promise.all([
    fetchF1Endpoint<HistoryResponse>(`circuits/${encodeURIComponent(circuitId)}/results/1.json?limit=1000`, "history"),
    fetchF1Endpoint<HistoryResponse>(`circuits/${encodeURIComponent(circuitId)}/races.json?limit=1000`, "history"),
  ]);
  const races = (response?.RaceTable?.Races ?? []).flatMap((race) => {
    const winner = race.Results?.[0];
    if (!winner) return [];
    return [{
      season: Number(race.season),
      round: Number(race.round),
      name: race.raceName,
      date: race.date,
      winner: `${winner.Driver.givenName} ${winner.Driver.familyName}`,
      winnerId: winner.Driver.driverId,
      constructor: winner.Constructor?.name ?? "Not listed",
      locality: race.Circuit.Location.locality,
      country: race.Circuit.Location.country,
    }];
  });
  const countBy = (key: "winner" | "constructor") => {
    const counts = new Map<string, number>();
    for (const race of races) counts.set(race[key], (counts.get(race[key]) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0] ?? null;
  };
  const driver = countBy("winner");
  const constructor = countBy("constructor");

  return {
    races,
    debut: scheduleResponse?.RaceTable?.Races?.length
      ? Math.min(...scheduleResponse.RaceTable.Races.map((race) => Number(race.season)))
      : null,
    grandPrixCount: scheduleResponse?.RaceTable?.Races?.length ?? races.length,
    mostSuccessfulDriver: driver ? { name: driver[0], wins: driver[1] } : null,
    mostSuccessfulConstructor: constructor ? { name: constructor[0], wins: constructor[1] } : null,
  };
}

export type CircuitTrackMap = { src: string; pageUrl: string; alt: string } | null;

export async function getCircuitTrackMap(circuitUrl: string): Promise<CircuitTrackMap> {
  try {
    const pageUrl = new URL(circuitUrl);
    const title = decodeURIComponent(pageUrl.pathname.split("/").filter(Boolean).pop() ?? "");
    if (!title) return null;
    const params = new URLSearchParams({
      action: "query",
      titles: title,
      prop: "pageimages",
      format: "json",
      pithumbsize: "1600",
    });
    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
      next: { revalidate: HISTORY_REVALIDATE_SECONDS },
      headers: { Accept: "application/json", "User-Agent": "ApexRacingHub/1.0 (unofficial F1 fan experience)" },
    });
    if (!response.ok) {
      console.error(`Wikipedia returned HTTP ${response.status} while loading circuit map ${title}.`);
      return null;
    }
    const body = await response.json() as {
      query?: { pages?: Record<string, { thumbnail?: { source?: string }; title?: string }> };
    };
    const page = Object.values(body.query?.pages ?? {})[0];
    const imageName = page?.thumbnail?.source
      ? decodeURIComponent(new URL(page.thumbnail.source).pathname.split("/").pop() ?? "")
      : "";
    if (page?.thumbnail?.source && /(circuit|track|map|layout)/i.test(imageName)) {
      return {
        src: page.thumbnail.source,
        pageUrl: pageUrl.toString(),
        alt: `${page.title ?? title} circuit map`,
      };
    }

    const searchParams = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${title.replace(/_/g, " ")} circuit layout`,
      gsrnamespace: "6",
      gsrlimit: "10",
      prop: "imageinfo|info",
      iiprop: "url",
      iiurlwidth: "1600",
      inprop: "url",
      format: "json",
    });
    const commonsResponse = await fetch(`https://commons.wikimedia.org/w/api.php?${searchParams}`, {
      next: { revalidate: HISTORY_REVALIDATE_SECONDS },
      headers: { Accept: "application/json", "User-Agent": "ApexRacingHub/1.0 (unofficial F1 fan experience)" },
    });
    if (!commonsResponse.ok) {
      console.error(`Wikimedia Commons returned HTTP ${commonsResponse.status} while searching for circuit map ${title}.`);
      return null;
    }
    const commonsBody = await commonsResponse.json() as {
      query?: { pages?: Record<string, { title?: string; fullurl?: string; imageinfo?: Array<{ thumburl?: string }> }> };
    };
    const candidates = Object.values(commonsBody.query?.pages ?? {})
      .filter((candidate) => candidate.imageinfo?.[0]?.thumburl && /(circuit|track|layout|grand.?prix|street)/i.test(candidate.title ?? ""))
      .sort((left, right) => {
        const score = (value: string) => {
          const title = value.toLowerCase();
          const year = Number(title.match(/\b20\d{2}\b/)?.[0] ?? 0);
          return (/(layout|map)/.test(title) ? 20 : 0)
            + (/(circuit|track|grand prix|street)/.test(title) ? 10 : 0)
            + Math.min(year, 2030) / 1000;
        };
        return score(right.title ?? "") - score(left.title ?? "");
      });
    const selected = candidates[0];
    const source = selected?.imageinfo?.[0]?.thumburl;
    if (!selected || !source) return null;
    return {
      src: source,
      pageUrl: selected.fullurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(selected.title ?? "")}`,
      alt: `${selected.title?.replace(/^File:/, "").replace(/_/g, " ") ?? title} circuit layout`,
    };
  } catch (error) {
    console.error(`Unable to load circuit map from Wikipedia (${circuitUrl}).`, error);
    return null;
  }
}

export async function getSeasonData(season: number): Promise<SeasonData> {
  const [driverResponse, constructorResponse, scheduleResponse, resultsResponse] = await Promise.all([
    fetchSeasonEndpoint<StandingResponse>(season, "driverStandings.json?limit=100"),
    fetchSeasonEndpoint<StandingResponse>(season, "constructorStandings.json?limit=100"),
    fetchSeasonEndpoint<ScheduleResponse>(season, "races.json?limit=100"),
    fetchSeasonEndpoint<ResultsResponse>(season, "results.json?limit=1000"),
  ]);

  const driverList = driverResponse?.StandingsTable?.StandingsLists?.[0];
  const constructorList = constructorResponse?.StandingsTable?.StandingsLists?.[0];
  const driverRows = driverList?.DriverStandings ?? [];
  const constructorRows = constructorList?.ConstructorStandings ?? [];
  const results = resultsResponse?.RaceTable?.Races ?? [];
  const poles = new Map<string, number>();
  const podiums = new Map<string, number>();
  const winners: Record<string, string> = {};

  for (const race of results) {
    for (const result of race.Results ?? []) {
      const name = `${result.Driver.givenName} ${result.Driver.familyName}`;
      const position = Number(result.position);
      if (position === 1) winners[race.round] = name;
      if (Number(result.grid) === 1) poles.set(name, (poles.get(name) ?? 0) + 1);
      if (position >= 1 && position <= 3) podiums.set(name, (podiums.get(name) ?? 0) + 1);
    }
  }

  const excludedDrivers = seasonDriverExclusions[season] ?? new Set<string>();
  const drivers: DriverStanding[] = driverRows.filter((entry) => !excludedDrivers.has(entry.Driver.driverId)).map((entry) => {
    const constructor = entry.Constructors[0];
    const fullName = `${entry.Driver.givenName} ${entry.Driver.familyName}`;
    return {
      id: entry.Driver.driverId,
      firstName: entry.Driver.givenName,
      lastName: entry.Driver.familyName,
      number: entry.Driver.permanentNumber ?? "",
      nationality: entry.Driver.nationality,
      points: Number(entry.points),
      wins: Number(entry.wins),
      poles: poles.get(fullName) ?? 0,
      podiums: podiums.get(fullName) ?? 0,
      constructorId: constructor?.constructorId ?? "",
      constructorName: constructor?.name ?? "Unattached",
    };
  });

  const constructors: ConstructorStanding[] = constructorRows.map((entry) => ({
    id: entry.Constructor.constructorId,
    name: entry.Constructor.name,
    nationality: entry.Constructor.nationality,
    points: Number(entry.points),
    wins: Number(entry.wins),
  }));

  const races: RaceEvent[] = (scheduleResponse?.RaceTable?.Races ?? []).map((race) => ({
    round: Number(race.round),
    id: race.Circuit.circuitId,
    name: race.raceName,
    date: race.date,
    time: race.time ?? "00:00:00Z",
    circuit: race.Circuit.circuitName,
    circuitId: race.Circuit.circuitId,
    circuitUrl: race.Circuit.url,
    locality: race.Circuit.Location.locality,
    country: race.Circuit.Location.country,
    winner: winners[race.round],
  }));

  return {
    season,
    round: Number(driverList?.round ?? constructorList?.round ?? 0),
    updatedAt: new Date().toISOString(),
    drivers,
    constructors,
    races,
    winners,
    available: Boolean(driverList || constructorList || scheduleResponse),
  };
}

export function getUpcomingRace(seasonData: SeasonData, now = new Date()): RaceEvent | undefined {
  return seasonData.races.find((race) => new Date(`${race.date}T${race.time}`).getTime() >= now.getTime());
}

export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    Australia: "🇦🇺", Austria: "🇦🇹", Azerbaijan: "🇦🇿", Bahrain: "🇧🇭", Belgium: "🇧🇪",
    Brazil: "🇧🇷", Canada: "🇨🇦", China: "🇨🇳", Hungary: "🇭🇺", Italy: "🇮🇹", Japan: "🇯🇵",
    Mexico: "🇲🇽", Monaco: "🇲🇨", Netherlands: "🇳🇱", Qatar: "🇶🇦", "Saudi Arabia": "🇸🇦",
    Singapore: "🇸🇬", Spain: "🇪🇸", UAE: "🇦🇪", "United Arab Emirates": "🇦🇪",
    "United Kingdom": "🇬🇧", UK: "🇬🇧", USA: "🇺🇸", "United States": "🇺🇸",
  };
  return flags[country] ?? "🏁";
}

export function getTeamColor(constructorId: string): string {
  const colors: Record<string, string> = {
    mercedes: "#27F4D2", ferrari: "#E8002D", mclaren: "#FF8000", red_bull: "#3671C6",
    rb: "#6692FF", alpine: "#FF87BC", haas: "#B6BABD", audi: "#D71920",
    williams: "#64C4FF", aston_martin: "#229971", cadillac: "#E6E6E6",
  };
  return colors[constructorId] ?? "#E10600";
}

export function getSeasonStatus(data: SeasonData): string {
  if (!data.available) return "No season data published yet";
  if (!data.round) return "Schedule published · Season not started";
  return `After round ${data.round} of ${data.races.length || "—"}`;
}

export function getCurrentSeason(): number {
  return new Date().getUTCFullYear();
}

export const CURRENT_SEASON = getCurrentSeason();
export function getSupportedSeasons(): number[] {
  const currentSeason = getCurrentSeason();
  return Array.from(new Set([currentSeason - 1, currentSeason, currentSeason + 1]));
}

export function resolveSeason(value?: string | string[]): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed >= 1950 && parsed <= getCurrentSeason() + 1
    ? parsed
    : CURRENT_SEASON;
}
