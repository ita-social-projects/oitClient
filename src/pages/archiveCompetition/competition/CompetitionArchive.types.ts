export interface ArchivedTask {
  id: number;
  name: string;
  description: string;
}

export interface ArchivedOlympiad {
  id: number;
  name: string;
  year: number;
  level: 'city' | 'regional' | 'national';
  tasksCount: number;
}
