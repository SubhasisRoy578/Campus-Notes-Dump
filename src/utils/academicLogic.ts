import { AcademicYearNumber, SemesterNumber, ResourceCategory, AcademicResource } from '../types';

export const YEAR_SEMESTER_MAP: Record<AcademicYearNumber, {
  stage: string;
  name: string;
  subtitle: string;
  semesters: { number: SemesterNumber; name: string; subjectsSummary: string }[];
}> = {
  1: {
    stage: 'Stage 01',
    name: '1st Year',
    subtitle: 'Foundation & Applied Sciences',
    semesters: [
      { number: 1, name: 'Semester 1', subjectsSummary: 'Engineering Math I, Mechanics, Physics' },
      { number: 2, name: 'Semester 2', subjectsSummary: 'Calculus II, C Programming, Chemistry' }
    ]
  },
  2: {
    stage: 'Stage 02',
    name: '2nd Year',
    subtitle: 'Core Engineering Disciplines',
    semesters: [
      { number: 3, name: 'Semester 3', subjectsSummary: 'Data Structures, Digital Logic, Discrete Math' },
      { number: 4, name: 'Semester 4', subjectsSummary: 'Algorithms, OS Principles, Microprocessors' }
    ]
  },
  3: {
    stage: 'Stage 03',
    name: '3rd Year',
    subtitle: 'Advanced Theory & Systems',
    semesters: [
      { number: 5, name: 'Semester 5', subjectsSummary: 'DBMS, Computer Networks, Automata Theory' },
      { number: 6, name: 'Semester 6', subjectsSummary: 'Compiler Design, Distributed Systems, AI' }
    ]
  },
  4: {
    stage: 'Stage 04',
    name: '4th Year',
    subtitle: 'Specialization & Capstones',
    semesters: [
      { number: 7, name: 'Semester 7', subjectsSummary: 'Cryptography, Cloud Computing, Electives' },
      { number: 8, name: 'Semester 8', subjectsSummary: 'Major Capstone Reports, Seminar Archives' }
    ]
  }
};

export function getSemestersForYear(year: AcademicYearNumber): SemesterNumber[] {
  if (year === 1) return [1, 2];
  if (year === 2) return [3, 4];
  if (year === 3) return [5, 6];
  if (year === 4) return [7, 8];
  return [1, 2];
}

export function getYearForSemester(sem: SemesterNumber): AcademicYearNumber {
  if (sem <= 2) return 1;
  if (sem <= 4) return 2;
  if (sem <= 6) return 3;
  return 4;
}

export function formatCategoryLabel(cat: ResourceCategory): string {
  switch (cat) {
    case 'lecture_notes':
      return 'Lecture Notes';
    case 'pyq':
      return 'Previous-Year Question Paper';
    case 'lab_manual':
      return 'Lab Manual';
    case 'reference_guide':
      return 'Reference Guide';
    case 'cheatsheet':
      return 'Formula / Cheatsheet';
    default:
      return 'Academic Resource';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function generateSearchKeywords(text: string): string[] {
  if (!text) return [];
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
  return Array.from(new Set(tokens));
}

export function matchesSearch(
  resource: AcademicResource,
  query: string,
  categoryFilter?: string,
  yearFilter?: number,
  semFilter?: number,
  formatFilter?: string
): boolean {
  if (categoryFilter && categoryFilter !== 'all' && resource.category !== categoryFilter) {
    return false;
  }
  if (yearFilter && resource.yearNumber !== yearFilter) {
    return false;
  }
  if (semFilter && resource.semesterNumber !== semFilter) {
    return false;
  }
  if (formatFilter && formatFilter !== 'all' && resource.fileFormat.toLowerCase() !== formatFilter.toLowerCase()) {
    return false;
  }

  if (!query || !query.trim()) return true;

  const normalized = query.toLowerCase().trim();
  const tokens = normalized.split(/\s+/);

  const searchableTarget = [
    resource.title,
    resource.courseCode,
    resource.subjectName,
    resource.department,
    resource.unitOrTopic || '',
    resource.uploaderName,
    resource.abstract || '',
    ...(resource.searchKeywords || [])
  ]
    .join(' ')
    .toLowerCase();

  return tokens.every((token) => searchableTarget.includes(token));
}

export function generateCitations(resource: AcademicResource) {
  const year = 2024;
  const author = resource.uploaderName || 'CampusNotes Academic Council';
  const title = resource.title;
  const course = `${resource.courseCode} ${resource.subjectName}`;

  return {
    apa: `${author}. (${year}). ${title} [${resource.categoryLabel}]. CampusNotes Academic Repository, ${course}.`,
    mla: `${author}. "${title}." CampusNotes Academic Repository, ${course}, ${year}.`,
    chicago: `${author}. "${title}." ${course}, CampusNotes Academic Repository (${year}).`,
    bibtex: `@misc{${resource.docRef?.toLowerCase().replace(/[^a-z0-9]/g, '_') || resource.id},
  author = {${author}},
  title = {${title}},
  year = {${year}},
  howpublished = {CampusNotes Academic Repository},
  note = {${course}}
}`
  };
}
