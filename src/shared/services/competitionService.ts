import type { Competition, CompetitionFilters, Page, Task } from '../models/CompetitionArchive.types.ts';

const API = 'http://localhost:8080/api/v1/competitions';

export async function getCompetitions(params: {
  search?: string;
  level?: string;
  year?: string;
  page?: number;
  size?: number;
  status?: string;
}): Promise<Page<Competition>> {
  const query = new URLSearchParams();

  if (params.search) query.append('search', params.search);
  if (params.level && params.level !== 'all') query.append('level', params.level);
  if (params.year && params.year !== 'all') query.append('year', params.year);

  query.append('page', String(params.page ?? 0));
  query.append('size', String(params.size ?? 10));
  query.append('status', String(params.status ?? 'ARCHIVED'));

  const res = await fetch(`${API}?${query.toString()}`);
  return res.json();
}

export async function getFilters(): Promise<CompetitionFilters> {
  const res = await fetch(`${API}/filters`);
  return res.json();
}

export async function getTasks(competitionId: number): Promise<Task[]> {
  const res = await fetch(`${API}/${competitionId}/tasks`);
  return res.json();
}
