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

async function fetchSeasonEndpoint<T>(season: number, path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_ROOT}/${season}/${path}`, {
      next: { revalidate: SEASON_REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const body = await response.json() as ErgastResponse<T>;
    return body.MRData ?? null;
  } catch (error) {
    console.error(`Unable to fetch season ${season} F1 data (${path}).`, error);
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

  const drivers: DriverStanding[] = driverRows.map((entry) => {
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
    Mexico: "🇲🇽", Monaco: "🇲🇨", Netherlands: "🇳🇱", Qatar: "🇶🇦", Saudi Arabia: "🇸🇦",
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

export const CURRENT_SEASON = new Date().getFullYear();
export const SUPPORTED_SEASONS = [...new Set([CURRENT_SEASON - 1, CURRENT_SEASON, CURRENT_SEASON + 1])];

export function resolveSeason(value?: string | string[]): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed >= 1950 && parsed <= CURRENT_SEASON + 1
    ? parsed
    : CURRENT_SEASON;
}
