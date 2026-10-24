import { Subject, AcademicResource, ResourceReport, ModerationLog } from '../../types';
import { INITIAL_SUBJECTS, INITIAL_RESOURCES } from '../../data/initialData';
import { generateSearchKeywords, matchesSearch } from '../../utils/academicLogic';

const STORAGE_KEY_RESOURCES = 'campusnotes_resources_v3';
const STORAGE_KEY_SUBJECTS = 'campusnotes_subjects_v3';
const STORAGE_KEY_REPORTS = 'campusnotes_reports_v3';
const STORAGE_KEY_MOD_LOGS = 'campusnotes_mod_logs_v3';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      saveToStorage(key, fallback);
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && Array.isArray(parsed) && parsed.length < (fallback as any[]).length) {
      saveToStorage(key, fallback);
      return fallback;
    }
    return parsed;
  } catch (e) {
    console.warn(`Failed to read ${key} from storage`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to storage`, e);
  }
}

// In-memory / localStorage database instances
let subjectsCache: Subject[] = loadFromStorage(STORAGE_KEY_SUBJECTS, INITIAL_SUBJECTS);
let resourcesCache: AcademicResource[] = loadFromStorage(STORAGE_KEY_RESOURCES, INITIAL_RESOURCES);
let reportsCache: ResourceReport[] = loadFromStorage(STORAGE_KEY_REPORTS, [
  {
    id: 'rep-01',
    resourceId: 'cs201-asymptotic',
    resourceTitle: 'Lecture 01-04: Big-O, Omega, Theta Notations & Master Theorem',
    reason: 'incorrect_subject',
    description: 'Typo in Equation 4 on slide 12 for Master Theorem case 2b.',
    reporterEmail: 'scholar24@university.edu',
    createdAt: '2024-10-23T14:20:00Z',
    status: 'pending'
  }
]);
let modLogsCache: ModerationLog[] = loadFromStorage(STORAGE_KEY_MOD_LOGS, [
  {
    id: 'log-01',
    resourceId: 'cs201-avl-trees',
    resourceTitle: 'CS201: AVL Trees: Self-Balancing Invariants & Rotation Mechanics',
    action: 'approve',
    moderatorUid: 'admin-1',
    moderatorName: 'Senate Lead Dr. Allen',
    reason: 'Verified against CS201 Fall 2024 syllabus.',
    timestamp: '2024-10-04T10:05:00Z'
  }
]);

export async function getSubjects(filter?: {
  yearNumber?: number;
  semesterNumber?: number;
}): Promise<Subject[]> {
  let list = [...subjectsCache];
  if (filter?.yearNumber) {
    list = list.filter((s) => s.yearNumber === filter.yearNumber);
  }
  if (filter?.semesterNumber) {
    list = list.filter((s) => s.semesterNumber === filter.semesterNumber);
  }
  return list;
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const normalized = id.toLowerCase();
  const found = subjectsCache.find(
    (s) => s.id.toLowerCase() === normalized || s.code.toLowerCase() === normalized
  );
  return found || null;
}

export async function getPublishedResources(options?: {
  subjectId?: string;
  yearNumber?: number;
  semesterNumber?: number;
  category?: string;
  query?: string;
  format?: string;
  sortBy?: string;
}): Promise<AcademicResource[]> {
  let list = resourcesCache.filter((r) => r.status === 'published');

  if (options?.subjectId) {
    const sId = options.subjectId.toLowerCase();
    list = list.filter(
      (r) => r.subjectId.toLowerCase() === sId || r.courseCode.toLowerCase() === sId
    );
  }

  if (options?.query || options?.category || options?.yearNumber || options?.semesterNumber || options?.format) {
    list = list.filter((r) =>
      matchesSearch(
        r,
        options.query || '',
        options.category,
        options.yearNumber,
        options.semesterNumber,
        options.format
      )
    );
  }

  // Sorting
  const sortBy = options?.sortBy || 'newest';
  list.sort((a, b) => {
    if (sortBy === 'downloads') {
      return b.downloadCount - a.downloadCount;
    }
    if (sortBy === 'alpha' || sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    // Default newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return list;
}

export async function getResourceById(id: string): Promise<AcademicResource | null> {
  const norm = id.toLowerCase();
  const found = resourcesCache.find((r) => r.id.toLowerCase() === norm);
  return found || null;
}

export async function getRecentResources(limitCount = 10): Promise<AcademicResource[]> {
  const published = resourcesCache.filter((r) => r.status === 'published');
  published.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return published.slice(0, limitCount);
}

export async function getUserUploads(uploaderUid: string): Promise<AcademicResource[]> {
  return resourcesCache.filter((r) => r.uploaderUid === uploaderUid);
}

export async function getPendingResources(): Promise<AcademicResource[]> {
  return resourcesCache.filter((r) => r.status === 'pending_review');
}

export async function getAllResourcesForAdmin(): Promise<AcademicResource[]> {
  return [...resourcesCache];
}

export async function submitResource(
  payload: Omit<
    AcademicResource,
    'id' | 'createdAt' | 'status' | 'downloadCount' | 'searchKeywords' | 'normalizedTitle'
  >,
  isVerifiedTA = false
): Promise<AcademicResource> {
  const id = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const status = isVerifiedTA ? 'published' : 'pending_review';
  const createdAt = new Date().toISOString();

  const newResource: AcademicResource = {
    ...payload,
    id,
    status,
    downloadCount: 0,
    normalizedTitle: payload.title.toLowerCase(),
    searchKeywords: generateSearchKeywords(
      `${payload.title} ${payload.courseCode} ${payload.subjectName} ${payload.unitOrTopic || ''} ${payload.abstract || ''}`
    ),
    createdAt,
    verifiedBadge: isVerifiedTA ? 'Verified by Department' : undefined
  };

  resourcesCache = [newResource, ...resourcesCache];
  saveToStorage(STORAGE_KEY_RESOURCES, resourcesCache);

  // If auto-cleared, add moderation log
  if (isVerifiedTA) {
    const log: ModerationLog = {
      id: `log-${Date.now()}`,
      resourceId: id,
      resourceTitle: newResource.title,
      action: 'approve',
      moderatorUid: payload.uploaderUid,
      moderatorName: `${payload.uploaderName} (Fast-track Clearance)`,
      reason: 'Immediate Archival Clearance via Verified Contributor Privilege',
      timestamp: createdAt
    };
    modLogsCache = [log, ...modLogsCache];
    saveToStorage(STORAGE_KEY_MOD_LOGS, modLogsCache);
  }

  return newResource;
}

export async function moderateResource(
  resourceId: string,
  action: 'approve' | 'reject' | 'archive' | 'restore',
  moderatorUid: string,
  moderatorName: string,
  reason?: string
): Promise<AcademicResource | null> {
  const index = resourcesCache.findIndex((r) => r.id === resourceId);
  if (index === -1) return null;

  const target = { ...resourcesCache[index] };
  if (action === 'approve' || action === 'restore') {
    target.status = 'published';
    target.moderatorUid = moderatorUid;
    target.moderatedAt = new Date().toISOString();
  } else if (action === 'reject') {
    target.status = 'rejected';
    target.moderationReason = reason || 'Did not meet institutional quality standards.';
    target.moderatorUid = moderatorUid;
    target.moderatedAt = new Date().toISOString();
  } else if (action === 'archive') {
    target.status = 'archived';
    target.moderationReason = reason || 'Archived by administrator.';
  }

  resourcesCache[index] = target;
  saveToStorage(STORAGE_KEY_RESOURCES, resourcesCache);

  const log: ModerationLog = {
    id: `log-${Date.now()}`,
    resourceId,
    resourceTitle: target.title,
    action,
    moderatorUid,
    moderatorName,
    reason: reason || `Admin action: ${action}`,
    timestamp: new Date().toISOString()
  };
  modLogsCache = [log, ...modLogsCache];
  saveToStorage(STORAGE_KEY_MOD_LOGS, modLogsCache);

  return target;
}

export async function submitReport(
  payload: Omit<ResourceReport, 'id' | 'createdAt' | 'status'>
): Promise<ResourceReport> {
  const id = `rep-${Date.now()}`;
  const report: ResourceReport = {
    ...payload,
    id,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  reportsCache = [report, ...reportsCache];
  saveToStorage(STORAGE_KEY_REPORTS, reportsCache);
  return report;
}

export async function getReports(): Promise<ResourceReport[]> {
  return [...reportsCache];
}

export async function resolveReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  reportsCache = reportsCache.map((r) => (r.id === reportId ? { ...r, status } : r));
  saveToStorage(STORAGE_KEY_REPORTS, reportsCache);
}

export async function getModerationLogs(): Promise<ModerationLog[]> {
  return [...modLogsCache];
}

export async function incrementDownloadCount(resourceId: string): Promise<number> {
  const index = resourcesCache.findIndex((r) => r.id === resourceId);
  if (index === -1) return 0;
  resourcesCache[index].downloadCount += 1;
  saveToStorage(STORAGE_KEY_RESOURCES, resourcesCache);
  return resourcesCache[index].downloadCount;
}

export function resetToSeedData() {
  subjectsCache = [...INITIAL_SUBJECTS];
  resourcesCache = [...INITIAL_RESOURCES];
  reportsCache = [];
  modLogsCache = [];
  saveToStorage(STORAGE_KEY_SUBJECTS, subjectsCache);
  saveToStorage(STORAGE_KEY_RESOURCES, resourcesCache);
  saveToStorage(STORAGE_KEY_REPORTS, reportsCache);
  saveToStorage(STORAGE_KEY_MOD_LOGS, modLogsCache);
}
