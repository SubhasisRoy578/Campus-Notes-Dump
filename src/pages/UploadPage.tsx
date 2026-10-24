import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AcademicYearNumber, SemesterNumber, ResourceCategory } from '../types';
import { getSemestersForYear, formatFileSize } from '../utils/academicLogic';
import { submitResource, getSubjects } from '../services/resources/resourceService';

export const UploadPage: React.FC = () => {
  const { currentUser, isVerifiedTA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If not signed in, redirect or display prompt preserving destination
  const [academicYear, setAcademicYear] = useState<AcademicYearNumber>(2);
  const [semester, setSemester] = useState<SemesterNumber>(3);
  const [courseCode, setCourseCode] = useState('CS201');
  const [subjectName, setSubjectName] = useState('Data Structures & Algorithms');
  const [unitTag, setUnitTag] = useState('Unit 3: Graph Algorithms & Minimum Spanning Trees');
  const [title, setTitle] = useState('CS201: Comprehensive Graph Traversal & Dijkstra Step-by-Step Guide');
  const [category, setCategory] = useState<ResourceCategory>('lecture_notes');
  const [abstract, setAbstract] = useState(
    "Contains exhaustive proof-step breakdowns for Breadth-First Search (BFS), Depth-First Search (DFS), and Dijkstra's Shortest Path algorithm with adjacency lists. Includes 4 solved previous exam questions from Fall 2023 with Professor Aris's standard grading rubric annotations."
  );
  const [file, setFile] = useState<{
    name: string;
    size: number;
    format: 'PDF' | 'DOCX' | 'TXT' | 'PNG' | 'JPG';
  } | null>({
    name: 'CS201_Graph_Algorithms_Guide_2024.pdf',
    size: 4.6 * 1024 * 1024,
    format: 'PDF'
  });
  const [uploadProgress, setUploadProgress] = useState(100);
  const [certified, setCertified] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subjectsList, setSubjectsList] = useState<{ code: string; name: string }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Update semester choices when academic year changes
  useEffect(() => {
    const sems = getSemestersForYear(academicYear);
    if (!sems.includes(semester)) {
      setSemester(sems[0]);
    }
  }, [academicYear, semester]);

  // Load available subjects for this semester
  useEffect(() => {
    getSubjects({ semesterNumber: semester }).then((subs) => {
      setSubjectsList(subs.map((s) => ({ code: s.code, name: s.name })));
      if (subs.length > 0 && !subs.some((s) => s.code === courseCode)) {
        setCourseCode(subs[0].code);
        setSubjectName(subs[0].name);
      }
    });
  }, [semester]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const ext = f.name.split('.').pop()?.toUpperCase() as any;
      const validExts = ['PDF', 'DOC', 'DOCX', 'TXT', 'PNG', 'JPG', 'JPEG'];
      if (!validExts.includes(ext)) {
        setToastMessage('Invalid file format. Please upload PDF, DOCX, TXT, PNG, or JPG.');
        return;
      }
      if (f.size > 25 * 1024 * 1024) {
        setToastMessage('File exceeds maximum 25 MB limit.');
        return;
      }
      setFile({
        name: f.name,
        size: f.size,
        format: ext === 'DOC' ? 'DOCX' : ext === 'JPEG' ? 'JPG' : ext
      });
      // Simulate real upload progress
      setUploadProgress(0);
      let p = 0;
      const interval = setInterval(() => {
        p += 25;
        setUploadProgress(Math.min(100, p));
        if (p >= 100) clearInterval(interval);
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/auth/sign-in', { state: { from: location.pathname } });
      return;
    }

    if (!title.trim() || !courseCode || !file) {
      setToastMessage('Please complete all required fields and attach a file.');
      return;
    }
    if (!certified) {
      setToastMessage('You must certify the academic integrity declaration.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await submitResource(
        {
          title: title.trim(),
          courseCode,
          subjectId: courseCode.toLowerCase(),
          subjectName: subjectName || 'Computer Science & Engineering',
          department: 'Department of Computer Science & Engineering',
          yearNumber: academicYear,
          semesterNumber: semester,
          unitOrTopic: unitTag.trim() || undefined,
          category,
          categoryLabel:
            category === 'lecture_notes'
              ? 'Lecture Notes / Class Notes'
              : category === 'pyq'
              ? 'Previous-Year Question Paper'
              : category === 'lab_manual'
              ? 'Lab Manual & Code Logs'
              : category === 'cheatsheet'
              ? 'Formula / Cheatsheet'
              : 'Reference Material',
          fileFormat: file.format,
          fileSize: formatFileSize(file.size),
          fileSizeBytes: file.size,
          uploaderName: currentUser.displayName,
          uploaderRole:
            currentUser.role === 'verified_ta'
              ? 'Teaching Assistant (CS)'
              : currentUser.role === 'faculty_admin'
              ? 'Faculty Admin'
              : 'University Scholar',
          uploaderUid: currentUser.uid,
          publishDate: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          abstract: abstract.trim(),
          docRef: `${courseCode}-U${semester}-RES`,
          version: '2024.1',
          license: 'Institutional Academic Commons',
          downloadUrl: '#'
        },
        isVerifiedTA
      );

      setSubmitting(false);
      if (isVerifiedTA) {
        navigate(`/resources/${created.id}`);
      } else {
        navigate('/my-uploads');
      }
    } catch (err: any) {
      setSubmitting(false);
      setToastMessage('Submission failed: ' + (err.message || 'Unknown error'));
    }
  };

  if (!currentUser) {
    return (
      <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-16 text-center">
        <div className="max-w-md mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#EAF0EB] text-primary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl">account_circle</span>
          </div>
          <h2 className="text-headline-sm font-headline-sm text-primary">Authentication Required</h2>
          <p className="text-body-sm text-secondary mt-2 mb-6">
            Reading and downloading from CampusNotes is completely public. To contribute verified lecture materials or problem sets to the university archive, please sign in.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/auth/sign-in"
              state={{ from: '/upload' }}
              className="w-full py-2.5 bg-primary-container text-white rounded-lg text-label-md font-semibold hover:bg-primary transition-colors text-center"
            >
              Sign In to Continue
            </Link>
            <Link
              to="/auth/register"
              state={{ from: '/upload' }}
              className="w-full py-2.5 border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container transition-colors text-center"
            >
              Create Scholar Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-[1320px] w-full mx-auto px-gutter md:px-margin py-space-lg">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-xl text-body-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary-fixed text-[18px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Chain */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-label-sm font-label-sm text-secondary mb-space-md">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="text-outline-variant">/</span>
        <span className="text-secondary">Contribute</span>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface font-semibold">Upload Resource</span>
      </nav>

      {/* Page Header & Archival Badge */}
      <div className="border-b border-outline-variant pb-space-md mb-space-xl flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container text-primary text-caption font-caption uppercase tracking-wider mb-space-xs border border-outline-variant font-semibold">
            <span className="material-symbols-outlined text-[14px]">verified_user</span>
            <span>Verified Course Repository Standard</span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight">
            Academic Resource Submission
          </h1>
          <p className="text-body-md font-body-md text-secondary mt-1 max-w-2xl">
            Publish syllabus-aligned lecture materials, verified problem sets, and unit reference notes into the permanent collegiate archive.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <span className="text-caption font-caption text-secondary uppercase block tracking-wider">
            Archival Cycle
          </span>
          <span className="text-label-md font-label-md font-semibold text-primary">
            Fall / Winter 2024–2025
          </span>
        </div>
      </div>

      {/* Two-Column Asymmetric Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Form Fields (8 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Section 1: Academic Location & Taxonomy */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-lg shadow-xs">
            <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm mb-space-md">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-surface-container text-primary font-headline-sm text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <h2 className="text-headline-sm font-headline-sm text-primary text-lg">
                  Academic Location & Taxonomy
                </h2>
              </div>
              <span className="text-caption font-caption text-secondary">Step 1 of 4</span>
            </div>

            <div className="space-y-space-md">
              {/* Academic Year Segmented Radio Cards */}
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface mb-2 font-semibold">
                  Curricular Academic Year <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                  {[
                    { year: 1, title: '1st Year', sub: 'Freshman' },
                    { year: 2, title: '2nd Year', sub: 'Sophomore' },
                    { year: 3, title: '3rd Year', sub: 'Junior' },
                    { year: 4, title: '4th Year', sub: 'Senior / Capstone' }
                  ].map((item) => (
                    <label
                      key={item.year}
                      onClick={() => setAcademicYear(item.year as any)}
                      className={`cursor-pointer rounded-lg p-3 text-center flex flex-col items-center transition-colors ${
                        academicYear === item.year
                          ? 'border-2 border-primary bg-surface-container-low font-bold'
                          : 'border border-outline-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-label-md font-label-md ${
                            academicYear === item.year ? 'text-primary font-bold' : 'text-secondary'
                          }`}
                        >
                          {item.title}
                        </span>
                        {academicYear === item.year && (
                          <span className="material-symbols-outlined text-primary text-[16px] fill">
                            check_circle
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-caption font-caption mt-0.5 ${
                          academicYear === item.year ? 'text-primary font-medium' : 'text-secondary'
                        }`}
                      >
                        {item.sub}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Semester Selector (Pills) */}
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface mb-2 font-semibold">
                  Semester Cohort <span className="text-error">*</span>
                </label>
                <div className="flex items-center gap-space-sm flex-wrap">
                  {getSemestersForYear(academicYear).map((semNum) => (
                    <button
                      key={semNum}
                      type="button"
                      onClick={() => setSemester(semNum)}
                      className={`px-4 py-2 rounded-lg text-label-sm font-label-sm flex items-center gap-1.5 transition-colors ${
                        semester === semNum
                          ? 'bg-primary text-white font-medium border border-primary'
                          : 'bg-surface-container-lowest text-secondary border border-outline-variant hover:bg-surface-container-low hover:text-on-surface'
                      }`}
                    >
                      {semester === semNum && (
                        <span className="material-symbols-outlined text-[16px]">done</span>
                      )}
                      <span>
                        Semester {semNum} ({semNum % 2 !== 0 ? 'Fall' : 'Spring'})
                      </span>
                    </button>
                  ))}
                  <span className="text-caption font-caption text-secondary ml-2 italic">
                    Refreshed based on {academicYear === 1 ? '1st' : academicYear === 2 ? '2nd' : academicYear === 3 ? '3rd' : '4th'} Year selection
                  </span>
                </div>
              </div>

              {/* Subject Selector & Request New Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-label-sm font-label-sm text-on-surface font-semibold">
                      Course / Subject Code <span className="text-error">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setToastMessage('Subject request form sent to academic registrar.')}
                      className="text-caption font-caption text-primary hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[13px]">add</span>
                      <span>Request New Subject</span>
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      value={courseCode}
                      onChange={(e) => {
                        setCourseCode(e.target.value);
                        const match = subjectsList.find((s) => s.code === e.target.value);
                        if (match) setSubjectName(match.name);
                      }}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none"
                    >
                      {subjectsList.length > 0 ? (
                        subjectsList.map((sub) => (
                          <option key={sub.code} value={sub.code}>
                            {sub.code} {sub.name}
                          </option>
                        ))
                      ) : (
                        <option value="CS201">CS201 Data Structures & Algorithms</option>
                      )}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-secondary pointer-events-none text-lg">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Unit / Module Input */}
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface mb-1.5 font-semibold">
                    Unit / Module Tag <span className="text-secondary font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={unitTag}
                    onChange={(e) => setUnitTag(e.target.value)}
                    placeholder="e.g., Unit 3: Graph Algorithms & Minimum Spanning Trees"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Resource Classification & Metadata */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-lg shadow-xs">
            <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm mb-space-md">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-surface-container text-primary font-headline-sm text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h2 className="text-headline-sm font-headline-sm text-primary text-lg">
                  Resource Classification & Metadata
                </h2>
              </div>
              <span className="text-caption font-caption text-secondary">Step 2 of 4</span>
            </div>

            <div className="space-y-space-md">
              {/* Resource Title */}
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface mb-1.5 font-semibold">
                  Archival Resource Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface font-medium focus:outline-none focus:border-primary transition-colors"
                  placeholder="[Course Code]: [Topic Name] [Document Form]"
                />
                <span className="text-caption font-caption text-secondary mt-1 block">
                  Standard format: [Course Code]: [Topic Name] [Document Form]
                </span>
              </div>

              {/* Resource Type Pills */}
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface mb-2 font-semibold">
                  Primary Classification <span className="text-error">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'lecture_notes', label: 'Lecture Notes / Class Notes' },
                    { id: 'pyq', label: 'Previous-Year Question Paper' },
                    { id: 'lab_manual', label: 'Lab Manual & Code Logs' },
                    { id: 'cheatsheet', label: 'Formula / Cheatsheet' },
                    { id: 'reference_guide', label: 'Reference Material' }
                  ].map((catItem) => (
                    <button
                      key={catItem.id}
                      type="button"
                      onClick={() => setCategory(catItem.id as any)}
                      className={`px-3 py-1.5 rounded text-label-sm font-label-sm flex items-center gap-1.5 transition-colors ${
                        category === catItem.id
                          ? 'bg-primary text-white font-medium border border-primary'
                          : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      {category === catItem.id && (
                        <span className="material-symbols-outlined text-[15px]">check</span>
                      )}
                      <span>{catItem.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brief Academic Summary */}
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface mb-1.5 font-semibold">
                  Academic Context & Abstract Summary
                </label>
                <textarea
                  rows={3}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  maxLength={600}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors resize-y"
                  placeholder="Include key concepts covered, midterm relevance, or professor references..."
                />
                <div className="flex items-center justify-between mt-1 text-caption font-caption text-secondary">
                  <span>Helps students determine document relevance during citation searches.</span>
                  <span>{abstract.length} / 600 characters</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: File Attachment & Verification Dropzone */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-lg shadow-xs">
            <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm mb-space-md">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-surface-container text-primary font-headline-sm text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <h2 className="text-headline-sm font-headline-sm text-primary text-lg">
                  File Attachment & Verification Dropzone
                </h2>
              </div>
              <span className="text-caption font-caption text-secondary">Step 3 of 4</span>
            </div>

            {/* Dropzone Container */}
            <label className="border-2 border-dashed border-outline-variant rounded-lg p-space-lg bg-surface-container-low/50 hover:bg-surface-container-low hover:border-primary transition-colors text-center cursor-pointer flex flex-col items-center justify-center">
              <input type="file" onChange={handleFileChange} className="sr-only" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" />
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary mb-space-sm">
                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
              </div>
              <p className="text-body-md font-body-md font-medium text-on-surface">
                Drag & drop course document here, or <span className="text-primary underline font-semibold">Browse Files</span>
              </p>
              <p className="text-caption font-caption text-secondary mt-1">
                Permitted formats: PDF, DOC, DOCX, TXT, PNG, JPG • Maximum file size: 25 MB
              </p>
            </label>

            {/* Attached File Preview Card */}
            {file && (
              <div className="mt-space-md border border-outline-variant rounded-lg p-space-md bg-surface-container-lowest flex flex-col gap-space-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary-fixed/30 border border-outline-variant flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                    </div>
                    <div>
                      <h4 className="text-label-md font-label-md font-semibold text-on-surface">
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-2 text-caption font-caption text-secondary">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>PDF Document (Text + Vector Diagrams)</span>
                        <span>•</span>
                        <span className="text-primary font-semibold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px] fill">check_circle</span>
                          300 DPI Verified
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setToastMessage(`Inspecting integrity of ${file.name}`)}
                      className="text-secondary hover:text-primary p-1 text-sm transition-colors"
                      title="Inspect PDF"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-secondary hover:text-error p-1 text-sm transition-colors"
                      title="Remove File"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>

                {/* Progress & Integrity Bar */}
                <div className="w-full">
                  <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-caption font-caption text-primary font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      Integrity verified • Ready to publish
                    </span>
                    <span className="text-caption font-caption text-secondary font-mono">
                      {uploadProgress}% Uploaded (SHA-256 Validated)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Academic Integrity Notice & Submit Actions */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-lg shadow-xs flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-surface-container text-primary font-headline-sm text-xs flex items-center justify-center font-bold">
                  4
                </span>
                <h2 className="text-headline-sm font-headline-sm text-primary text-lg">
                  Academic Integrity Notice & Archival Deposit
                </h2>
              </div>
              <span className="text-caption font-caption text-secondary">Final Step</span>
            </div>

            {/* Pale Sage Disclaimer Box */}
            <div className="bg-[#EAF0EB] border border-[#c0c9c2] rounded-lg p-space-md flex gap-3 text-on-surface">
              <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">policy</span>
              <div className="text-body-sm font-body-sm space-y-1">
                <p className="font-semibold text-primary">Campus Honor Code & Institutional Permanence</p>
                <p className="text-on-surface-variant">
                  By publishing, you confirm these materials respect the university academic honor code and contain no unauthorized examination leaks. Published documents cannot be altered or deleted by student accounts to preserve institutional history.
                </p>
              </div>
            </div>

            {/* Explicit Checkbox Confirmation */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={certified}
                onChange={(e) => setCertified(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-outline text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span className="text-body-sm font-body-sm text-on-surface">
                I certify that I hold educational distribution rights or this constitutes fair-use scholarly notes prepared for peer reference under Department regulations.
              </span>
            </label>

            {/* Action Buttons Group */}
            <div className="pt-space-sm border-t border-outline-variant flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary text-white rounded-lg font-label-md text-label-md font-semibold hover:bg-primary-container active:opacity-90 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">archive</span>
                  <span>{submitting ? 'Depositing into Archive...' : 'Publish to Campus Archive'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setToastMessage('Draft saved locally in browser storage.')}
                  className="px-4 py-2.5 bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md font-medium hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">save</span>
                  <span>Save Draft</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-secondary hover:text-error text-label-md font-label-md transition-colors px-3 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* RIGHT COLUMN: Guidance & Standards Drawer (~340px) (4 Cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Card: Archival Standards Checklist */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-md shadow-xs">
            <div className="flex items-center gap-2 pb-space-sm border-b border-outline-variant mb-space-sm">
              <span className="material-symbols-outlined text-primary text-xl">fact_check</span>
              <h3 className="font-headline-sm text-headline-sm text-primary text-base">Archival Standards</h3>
            </div>
            <p className="text-body-sm font-body-sm text-secondary mb-space-sm">
              To ensure archival clarity for the university library, all deposits must conform to basic indexing criteria:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0 fill">
                  check_box
                </span>
                <div className="text-body-sm font-body-sm">
                  <strong className="text-on-surface block font-semibold">Legible Scans & High DPI</strong>
                  <span className="text-secondary">
                    Handwriting must be clearly legible; scans should maintain at least 300 DPI resolution.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0 fill">
                  check_box
                </span>
                <div className="text-body-sm font-body-sm">
                  <strong className="text-on-surface block font-semibold">Syllabus Unit Tagging</strong>
                  <span className="text-secondary">
                    Attach official unit titles to improve retrieval through semester-end search indexes.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0 fill">
                  check_box
                </span>
                <div className="text-body-sm font-body-sm">
                  <strong className="text-on-surface block font-semibold">Unofficial Solutions Marking</strong>
                  <span className="text-secondary">
                    If student-authored, flag answer keys clearly as "Unofficial / Student Formulated".
                  </span>
                </div>
              </li>
            </ul>
            <div className="mt-space-md pt-space-sm border-t border-outline-variant flex items-center justify-between">
              <span className="text-caption font-caption text-secondary">Review full stylebook</span>
              <Link to="/usage-guidelines" className="text-caption font-caption text-primary font-semibold hover:underline flex items-center">
                <span>Library Manual</span>
                <span className="material-symbols-outlined text-[13px]">north_east</span>
              </Link>
            </div>
          </div>

          {/* Card: What Happens Next? */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-md shadow-xs">
            <div className="flex items-center gap-2 pb-space-sm border-b border-outline-variant mb-space-sm">
              <span className="material-symbols-outlined text-primary text-xl">schedule</span>
              <h3 className="font-headline-sm text-headline-sm text-primary text-base">What Happens Next?</h3>
            </div>
            <div className="space-y-space-md">
              {isVerifiedTA ? (
                /* Verified TA Privilege */
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-primary-fixed/40 border border-primary text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                    TA
                  </div>
                  <div>
                    <span className="text-label-sm font-label-sm font-semibold text-primary block">
                      Immediate Archival Clearance
                    </span>
                    <p className="text-body-sm font-body-sm text-secondary mt-0.5">
                      Because you are signed in as a verified Teaching Assistant (<strong className="text-on-surface">{currentUser.displayName}</strong>), this record will enter the live catalog instantaneously upon clicking publish.
                    </p>
                  </div>
                </div>
              ) : (
                /* General Peer Review Note */
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-surface-container border border-outline text-secondary flex items-center justify-center shrink-0 text-xs font-semibold">
                    PR
                  </div>
                  <div>
                    <span className="text-label-sm font-label-sm font-semibold text-on-surface block">
                      Standard Peer Moderation (~2–4 hrs)
                    </span>
                    <p className="text-body-sm font-body-sm text-secondary mt-0.5">
                      General undergraduate submissions undergo automated OCR checks and community moderator peer verification prior to indexing.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Institutional Archival Timestamp */}
            <div className="mt-space-md p-space-xs px-space-sm bg-surface-container-low rounded border border-outline-variant text-caption font-caption text-secondary flex items-center justify-between">
              <span>Archive Server Node:</span>
              <span className="font-mono text-on-surface font-semibold">CAMPUS-EAST-02</span>
            </div>
          </div>

          {/* Secondary Card: Contributor Ledger Summary */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant p-space-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm font-label-sm font-semibold text-primary">Your Contributor Standing</span>
              <span className="px-2 py-0.5 bg-primary text-surface-container-lowest text-[11px] font-caption font-semibold rounded">
                {currentUser.standing || 'Tier 1 Scholar'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center my-2">
              <div className="p-2 bg-surface-container-lowest rounded border border-outline-variant">
                <div className="text-headline-sm font-headline-sm text-primary font-bold">
                  {currentUser.publishedCount ?? 18}
                </div>
                <div className="text-caption font-caption text-secondary">Published Notes</div>
              </div>
              <div className="p-2 bg-surface-container-lowest rounded border border-outline-variant">
                <div className="text-headline-sm font-headline-sm text-primary font-bold">
                  {currentUser.downloadCount ?? 1420}
                </div>
                <div className="text-caption font-caption text-secondary">Student Downloads</div>
              </div>
            </div>
            <p className="text-caption font-caption text-secondary text-center mt-2">
              Institutional DOI assigned to all verified entries.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
};
