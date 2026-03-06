import type { ArchivedOlympiad, ArchivedTask } from './CompetitionArchive.types.ts';

export const ARCHIVED_OLYMPIADS: ArchivedOlympiad[] = [
  {
    id: 1,
    name: 'National IT Olympiad 2025',
    year: 2025,
    level: 'national',
    tasksCount: 4,
  },
  {
    id: 2,
    name: 'Regional IT Olympiad 2025',
    year: 2025,
    level: 'regional',
    tasksCount: 2,
  },
  {
    id: 3,
    name: 'City IT Olympiad 2025',
    year: 2025,
    level: 'city',
    tasksCount: 2,
  },
  {
    id: 4,
    name: 'National IT Olympiad 2024',
    year: 2024,
    level: 'national',
    tasksCount: 4,
  },
  {
    id: 5,
    name: 'Regional IT Olympiad 2024',
    year: 2024,
    level: 'regional',
    tasksCount: 2,
  },
  {
    id: 6,
    name: 'National IT Olympiad 2023',
    year: 2023,
    level: 'national',
    tasksCount: 3,
  },
];

export const OLYMPIAD_TASKS: Record<number, ArchivedTask[]> = {
  1: [
    {
      id: 1,
      name: 'Database Management - Access',
      description: 'Library management system',
    },
    {
      id: 2,
      name: 'Spreadsheet Analysis - Excel',
      description: 'Financial forecasting',
    },
    {
      id: 3,
      name: 'Document Processing - Word',
      description: 'Technical report',
    },
    {
      id: 4,
      name: 'Presentation Design - PowerPoint',
      description: 'Technology trends',
    },
  ],

  2: [
    {
      id: 5,
      name: 'Database Design - Access',
      description: 'Student information system',
    },
    { id: 6, name: 'Data Analysis - Excel', description: 'Sales analysis' },
    { id: 7, name: 'Documentation - Word', description: 'User manual' },
  ],
  3: [
      {
        id: 8,
        name: 'Basic Database - Access',
        description: 'Contact management',
      },
      {
        id: 9,
        name: 'Spreadsheet Basics - Excel',
        description: 'Budget planning',
      },
  ],
  4: [
      {
        id: 10,
        name: 'Advanced Database - Access',
        description: 'Inventory system',
      },
      {
        id: 11,
        name: 'Complex Analysis - Excel',
        description: 'Market research',
      },
      {
        id: 12,
        name: 'Professional Documentation - Word',
        description: 'Project proposal',
      },
      {
        id: 13,
        name: 'Interactive Presentation - PowerPoint',
        description: 'Business pitch',
      },
  ],
  5: [
      {
        id: 14,
        name: 'Database Systems - Access',
        description: 'Event management',
      },
      {
        id: 15,
        name: 'Statistical Analysis - Excel',
        description: 'Survey results',
      },
  ],
  6: [
      {
        id: 16,
        name: 'Database Development - Access',
        description: 'Booking system',
      },
      {
        id: 17,
        name: 'Financial Modeling - Excel',
        description: 'Investment analysis',
      },
      {
        id: 18,
        name: 'Technical Writing - Word',
        description: 'System documentation',
      },
  ],
};