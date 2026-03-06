import type { ArchivedOlympiad } from './CompetitionArchive.types.ts';


export function filterOlympiads(
  olympiads: ArchivedOlympiad[],
  search: string,
  level: string,
  year: string,
) {
  return olympiads.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = level === 'all' || o.level === level;
    const matchesYear = year === 'all' || o.year.toString() === year;
    return matchesSearch && matchesLevel && matchesYear;
  });
}

export function extractYears(olympiads: ArchivedOlympiad[]) {
  return Array.from(new Set(olympiads.map(o => o.year))).sort((a, b) => b - a);
}
