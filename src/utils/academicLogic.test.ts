import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSemestersForYear,
  getYearForSemester,
  formatFileSize,
  generateSearchKeywords,
  matchesSearch,
  generateCitations,
  YEAR_SEMESTER_MAP
} from './academicLogic';
import { AcademicResource } from '../types';

test('academic taxonomy maps years to semesters correctly', () => {
  assert.deepEqual(getSemestersForYear(1), [1, 2]);
  assert.deepEqual(getSemestersForYear(2), [3, 4]);
  assert.deepEqual(getSemestersForYear(3), [5, 6]);
  assert.deepEqual(getSemestersForYear(4), [7, 8]);

  assert.equal(getYearForSemester(1), 1);
  assert.equal(getYearForSemester(3), 2);
  assert.equal(getYearForSemester(5), 3);
  assert.equal(getYearForSemester(8), 4);
});

test('formatFileSize converts bytes to readable string', () => {
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(1024 * 1.5), '1.5 KB');
  assert.equal(formatFileSize(1024 * 1024 * 3.7), '3.7 MB');
});

test('generateSearchKeywords tokenizes text into distinct lowercase tokens', () => {
  const keywords = generateSearchKeywords('AVL Trees: Self-Balancing Invariants & Rotation Mechanics');
  assert.ok(keywords.includes('avl'));
  assert.ok(keywords.includes('trees'));
  assert.ok(keywords.includes('balancing'));
  assert.ok(keywords.includes('rotation'));
});

test('matchesSearch filters resources by keywords and filters accurately', () => {
  const mockResource: AcademicResource = {
    id: 'res-1',
    title: 'AVL Trees & Red-Black Trees Rotation Visual Cheatsheet',
    normalizedTitle: 'avl trees red-black trees rotation visual cheatsheet',
    courseCode: 'CS201',
    subjectId: 'cs201',
    subjectName: 'Data Structures & Algorithms',
    department: 'Computer Science',
    yearNumber: 2,
    semesterNumber: 3,
    unitOrTopic: 'Unit 2: Balanced Search Trees',
    category: 'cheatsheet',
    categoryLabel: 'Formula / Cheatsheet',
    fileFormat: 'PDF',
    fileSize: '3.7 MB',
    fileSizeBytes: 3880000,
    downloadCount: 428,
    uploaderName: 'Student Council Archive',
    uploaderRole: 'Student Council',
    uploaderUid: 'uid-sc',
    publishDate: 'Oct 04, 2024',
    status: 'published',
    downloadUrl: '#',
    searchKeywords: ['avl', 'trees', 'rotation', 'cheatsheet'],
    createdAt: '2024-10-04T00:00:00Z'
  };

  assert.equal(matchesSearch(mockResource, 'AVL Trees'), true);
  assert.equal(matchesSearch(mockResource, 'data structures'), true);
  assert.equal(matchesSearch(mockResource, 'Quantum physics'), false);
  assert.equal(matchesSearch(mockResource, 'AVL', 'cheatsheet', 2, 3), true);
  assert.equal(matchesSearch(mockResource, 'AVL', 'lecture_notes'), false);
});

test('generateCitations generates APA, MLA and BibTeX entries', () => {
  const mockResource: AcademicResource = {
    id: 'res-avl',
    title: 'AVL Trees: Self-Balancing Invariants',
    normalizedTitle: 'avl trees',
    courseCode: 'CS201',
    subjectId: 'cs201',
    subjectName: 'Data Structures & Algorithms',
    department: 'Computer Science',
    yearNumber: 2,
    semesterNumber: 3,
    category: 'lecture_notes',
    categoryLabel: 'Lecture Notes',
    fileFormat: 'PDF',
    fileSize: '3.7 MB',
    fileSizeBytes: 3880000,
    downloadCount: 428,
    uploaderName: 'Student Academic Council',
    uploaderRole: 'Contributor',
    uploaderUid: 'sac-1',
    publishDate: 'Oct 04, 2024',
    status: 'published',
    docRef: 'CS201-U02-AVL',
    downloadUrl: '#',
    searchKeywords: [],
    createdAt: '2024-10-04T00:00:00Z'
  };

  const citations = generateCitations(mockResource);
  assert.ok(citations.apa.includes('Student Academic Council'));
  assert.ok(citations.mla.includes('AVL Trees'));
  assert.ok(citations.bibtex.includes('@misc{cs201_u02_avl'));
});
