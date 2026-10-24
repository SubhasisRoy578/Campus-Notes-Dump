export type AcademicYearNumber = 1 | 2 | 3 | 4;
export type SemesterNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ResourceCategory =
  | 'lecture_notes'
  | 'pyq'
  | 'lab_manual'
  | 'reference_guide'
  | 'cheatsheet'
  | 'other';

export type ResourceStatus = 'pending_review' | 'published' | 'rejected' | 'archived';

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  yearNumber: AcademicYearNumber;
  semesterNumber: SemesterNumber;
  credits: number;
  description?: string;
  units: {
    unitNumber: number;
    title: string;
    description?: string;
  }[];
  resourceCount?: number;
}

export interface AcademicResource {
  id: string;
  title: string;
  normalizedTitle: string;
  courseCode: string;
  subjectId: string;
  subjectName: string;
  department: string;
  yearNumber: AcademicYearNumber;
  semesterNumber: SemesterNumber;
  unitOrTopic?: string;
  category: ResourceCategory;
  categoryLabel: string;
  fileFormat: 'PDF' | 'DOCX' | 'TXT' | 'PNG' | 'JPG';
  fileSize: string;
  fileSizeBytes: number;
  downloadCount: number;
  verifiedBadge?: string;
  uploaderName: string;
  uploaderRole: string;
  uploaderUid: string;
  publishDate: string; // ISO string or human formatted
  status: ResourceStatus;
  abstract?: string;
  docRef?: string;
  version?: string;
  sha256?: string;
  md5Checksum?: string;
  license?: string;
  downloadUrl: string;
  searchKeywords: string[];
  moderationReason?: string;
  moderatorUid?: string;
  moderatedAt?: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'verified_ta' | 'faculty_admin';
  standing?: string;
  publishedCount?: number;
  downloadCount?: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface ResourceReport {
  id: string;
  resourceId: string;
  resourceTitle: string;
  reason:
    | 'incorrect_subject'
    | 'copyright_concern'
    | 'inappropriate_content'
    | 'corrupted_file'
    | 'duplicate_resource'
    | 'other';
  description?: string;
  reporterUid?: string;
  reporterEmail?: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface ModerationLog {
  id: string;
  resourceId: string;
  resourceTitle: string;
  action: 'approve' | 'reject' | 'archive' | 'restore';
  moderatorUid: string;
  moderatorName: string;
  reason?: string;
  timestamp: string;
}
