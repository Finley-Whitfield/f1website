const portraitFallbacks = [
  "photo-1535713875002-d1d0cf377fde",
  "photo-1500648767791-00dcc994a43e",
  "photo-1506794778202-cad84cf45f1d",
  "photo-1507003211169-0a1dd7228f2d",
  "photo-1507591064344-4c6ce005b128",
  "photo-1501196354995-cbb51c65aaea",
];

const raceFallbacks = [
  "photo-1533105079780-92b9be482077",
  "photo-1519608487953-e999c86e7455",
  "photo-1500534623283-312aade485b7",
  "photo-1500534314209-a25ddb2bd429",
];

function stableIndex(value: string, length: number): number {
  return Array.from(value).reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0) % length;
}

export function getDriverImage(driverId: string): string {
  return `/images/drivers/${encodeURIComponent(driverId)}.jpg`;
}

export function getDriverImageByName(driverName: string): string {
  const filename = driverName.trim().replace(/\s+/g, "_");
  return `/images/drivers/${encodeURIComponent(filename)}.jpg`;
}

export function getDriverImageFallback(driverId: string): string {
  const photo = portraitFallbacks[stableIndex(driverId, portraitFallbacks.length)];
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1000&q=85`;
}

export function getRaceImage(circuitId: string): string {
  return `/images/races/${encodeURIComponent(circuitId)}.jpg`;
}

export function getRaceImageFallback(circuitId: string): string {
  const photo = raceFallbacks[stableIndex(circuitId, raceFallbacks.length)];
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1400&q=85`;
}
