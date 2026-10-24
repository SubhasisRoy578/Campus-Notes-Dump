import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AcademicResource } from '../types';
import { getResourceById, getPublishedResources, incrementDownloadCount } from '../services/resources/resourceService';
import { useSavedResources } from '../context/SavedResourcesContext';
import { CitationModal } from '../components/common/CitationModal';
import { ReportModal } from '../components/common/ReportModal';

export const ResourceDetailPage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const [resource, setResource] = useState<AcademicResource | null>(null);
  const [relatedResources, setRelatedResources] = useState<AcademicResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const totalPages = 12;
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCitationOpen, setIsCitationOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { isSaved, toggleSave } = useSavedResources();

  useEffect(() => {
    loadResource();
  }, [resourceId]);

  const loadResource = async () => {
    if (!resourceId) return;
    setLoading(true);
    const data = await getResourceById(resourceId);
    setResource(data);

    if (data) {
      const related = await getPublishedResources({ subjectId: data.subjectId });
      setRelatedResources(related.filter((r) => r.id !== data.id).slice(0, 3));
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!resource) return;
    await incrementDownloadCount(resource.id);
    setResource((prev) => (prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : prev));

    const content = `CampusNotes Academic Repository
========================================
Document: ${resource.title}
Course: ${resource.courseCode} - ${resource.subjectName}
Unit: ${resource.unitOrTopic || 'General Unit'}
Format: ${resource.fileFormat} | Size: ${resource.fileSize}
Contributor: ${resource.uploaderName} (${resource.uploaderRole})
Publication Date: ${resource.publishDate}
MD5 Checksum: ${resource.md5Checksum || 'e8b39c59a0f4a81df5914620d43ac7b2'}
License: ${resource.license || 'Public Domain Academic Commons'}

Abstract & Summary:
${resource.abstract || 'Peer-reviewed academic study guide.'}

Verification Stamp:
Archived under Institutional Open-Access Repository standard.
Integrity verified via SHA-256 standard cryptographic ledger.
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.courseCode}_${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.${resource.fileFormat.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Download started successfully.');
  };

  const handleSaveToggle = () => {
    if (!resource) return;
    toggleSave(resource.id);
    showToast(isSaved(resource.id) ? 'Removed from your Stacks.' : 'Saved to your Stacks.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-20 text-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary mb-3">progress_activity</span>
        <p className="text-secondary text-body-md">Loading archived document record...</p>
      </main>
    );
  }

  if (!resource) {
    return (
      <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-20 text-center">
        <span className="material-symbols-outlined text-4xl text-secondary mb-3">find_in_page</span>
        <h2 className="font-headline-md text-primary text-xl">Document Record Not Found</h2>
        <p className="text-secondary text-body-md mt-2 max-w-md mx-auto">
          The requested document may have been archived, moderated, or does not exist in the public ledger.
        </p>
        <Link to="/" className="mt-4 inline-block px-4 py-2 bg-primary-container text-white rounded-lg text-label-md font-medium">
          Return to Browse
        </Link>
      </main>
    );
  }

  const saved = isSaved(resource.id);

  return (
    <div className={`min-h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-[#F8F8F5] overflow-auto' : ''}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-xl text-body-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary-fixed text-[18px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation Bar */}
      <section className="w-full bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-[1320px] mx-auto px-gutter md:px-margin py-2 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-label-sm font-label-sm text-secondary overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-primary transition-colors duration-150">
              Home
            </Link>
            <span className="text-outline-variant">/</span>
            <Link to={`/semesters/${resource.semesterNumber}`} className="hover:text-primary transition-colors duration-150">
              Semester {resource.semesterNumber}
            </Link>
            <span className="text-outline-variant">/</span>
            <Link to={`/subjects/${resource.subjectId}`} className="hover:text-primary transition-colors duration-150 font-mono text-[11px]">
              {resource.courseCode}
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-medium truncate max-w-[240px] sm:max-w-md">
              {resource.title}
            </span>
          </nav>
          <div className="hidden sm:flex items-center gap-2 text-caption font-caption text-secondary shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-container"></span>
            <span>Archived Document Record #{resource.docRef || 'ARCH-2024-9982'}</span>
          </div>
        </div>
      </section>

      {/* Main Viewer Content Canvas */}
      <main className="flex-grow w-full max-w-[1320px] mx-auto px-gutter md:px-margin py-space-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT / MAIN COLUMN: Document Viewer Frame (approx 8 of 12 cols desktop) */}
          <section className="lg:col-span-8 flex flex-col gap-0 border border-outline-variant rounded-xl bg-surface-container-lowest overflow-hidden shadow-[0_4px_12px_rgba(32,37,34,0.03)]">
            {/* Document Viewer Toolbar */}
            <div className="bg-surface-container-low border-b border-outline-variant px-space-md py-2.5 flex flex-wrap items-center justify-between gap-3">
              {/* File identification & page counter */}
              <div className="flex items-center gap-space-md min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-primary text-[20px] shrink-0">description</span>
                  <span
                    className="font-mono text-body-sm text-on-surface font-medium truncate max-w-[210px] md:max-w-[280px]"
                    title={`${resource.courseCode}_Unit2_AVLTrees_Rotations.pdf`}
                  >
                    {resource.courseCode}_Unit2_AVLTrees_Rotations.pdf
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1 bg-surface-container-lowest px-2 py-0.5 border border-outline-variant rounded text-label-sm font-label-sm text-secondary">
                  <button
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber === 1}
                    className="hover:text-primary disabled:opacity-40"
                    title="Previous Page"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <span className="font-mono px-1">
                    Page {pageNumber} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                    disabled={pageNumber === totalPages}
                    className="hover:text-primary disabled:opacity-40"
                    title="Next Page"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Tools: Zoom, View Modes, Download & Print Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
                {/* Zoom group */}
                <div className="flex items-center border border-outline-variant rounded bg-surface-container-lowest overflow-hidden">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                    className="px-2 py-1 text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
                    title="Zoom Out"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="font-mono text-label-sm text-on-surface px-2 border-x border-outline-variant bg-surface-container-lowest">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                    className="px-2 py-1 text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
                    title="Zoom In"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>

                {/* View sizing icons */}
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1.5 text-secondary hover:text-primary border border-outline-variant rounded bg-surface-container-lowest transition-colors"
                  title="Fit to width (100%)"
                >
                  <span className="material-symbols-outlined text-[18px]">fit_screen</span>
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 text-secondary hover:text-primary border border-outline-variant rounded bg-surface-container-lowest transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                  </span>
                </button>
                <button
                  onClick={handlePrint}
                  className="p-1.5 text-secondary hover:text-primary border border-outline-variant rounded bg-surface-container-lowest transition-colors"
                  title="Print document"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                </button>

                {/* Primary Direct Action */}
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary text-label-sm font-label-sm px-3 py-1.5 rounded hover:bg-primary transition-colors duration-150 active:opacity-90 font-medium"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span className="hidden md:inline">Download PDF</span>
                  <span className="font-mono text-[11px] opacity-90">({resource.fileSize})</span>
                </button>
              </div>
            </div>

            {/* Embedded Document Canvas: Physical Paper Aesthetic */}
            <div
              className="p-space-md sm:p-space-lg bg-[#EFEFEA] overflow-y-auto max-h-[820px] custom-scroll flex justify-center transition-all duration-150"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {/* Physical Paper Page Sheet (Tier 1 Surface) */}
              <article className="w-full max-w-[760px] bg-white border border-[#D8DCD5] rounded-xs p-6 sm:p-10 shadow-[0_2px_10px_rgba(32,37,34,0.06)] relative text-on-surface">
                {/* Ledger header line */}
                <div className="border-b border-[#E5E7E2] pb-4 mb-6 flex flex-wrap justify-between items-end gap-2 text-label-sm font-label-sm text-secondary">
                  <div>
                    <span className="text-caption font-caption tracking-widest uppercase text-primary font-bold">
                      {resource.department}
                    </span>
                    <p className="font-mono text-[12px] text-tertiary">
                      {resource.courseCode}: {resource.subjectName} · Fall Semester
                    </p>
                  </div>
                  <div className="text-right font-mono text-[11px] text-secondary">
                    <span>DOC REF: {resource.docRef || 'CS201-U02-AVL'}</span>
                    <br />
                    <span>VER: {resource.version || '2024.1.4'}</span>
                  </div>
                </div>

                {/* Paper Title Block */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#EAF0EB] text-[#285744] text-caption font-caption font-semibold mb-2">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    PEER-REVIEWED STUDY NOTES
                  </div>
                  <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight">
                    {resource.title}
                  </h1>
                  <p className="text-body-sm font-body-sm text-secondary mt-1">
                    Author: {resource.uploaderName} · Compiled for Midterm Examination Mastery
                  </p>
                </div>

                {/* Mathematical Definition Section */}
                <section className="mb-6 p-4 bg-[#F8F8F5] border-l-2 border-primary-container rounded-r text-body-sm font-body-sm">
                  <h2 className="font-headline-sm text-headline-sm text-primary mb-1">
                    1. The AVL Balance Invariant
                  </h2>
                  <p className="text-on-surface-variant leading-relaxed">
                    An AVL tree is a self-balancing binary search tree in which the heights of the two child subtrees of any node differ by at most one.
                    For every node <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5E7E2] text-primary">v</code> in tree <code className="font-mono">T</code>:
                  </p>
                  <div className="my-3 py-2 text-center bg-white border border-[#E5E7E2] rounded font-mono text-[13px] text-primary font-semibold">
                    BalanceFactor(v) = height(v.left) - height(v.right) ∈ &#123;-1, 0, +1&#125;
                  </div>
                  <p className="text-caption font-caption text-secondary italic">
                    * Note: If at any time |BF(v)| ≥ 2, tree rebalancing is triggered along the insertion/deletion path via constant-time O(1) rotation operators.
                  </p>
                </section>

                {/* Vector Schematic of the 4 Rotation Cases */}
                <section className="mb-8">
                  <h2 className="font-headline-sm text-headline-sm text-primary mb-3">
                    2. Canonical Rotation Case Taxonomy
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rotation Case 1: Left-Left */}
                    <div className="border border-[#E5E7E2] rounded p-3 bg-white hover:border-[#C8CCC5] transition-colors">
                      <div className="flex items-center justify-between border-b border-[#E5E7E2] pb-1.5 mb-2">
                        <span className="font-mono text-label-sm font-label-sm font-semibold text-primary">
                          Case 1: Left-Left (LL)
                        </span>
                        <span className="text-caption font-caption bg-[#EAF0EB] text-[#285744] px-1.5 py-0.5 rounded">
                          Single Right Rotation
                        </span>
                      </div>
                      <p className="text-[12px] text-secondary leading-snug mb-3">
                        Insertion into the left subtree of the left child of node <code className="font-mono">z</code>.
                      </p>
                      {/* Vector Graphic Diagram */}
                      <div className="w-full bg-[#FBFBFA] border border-[#EBECE8] rounded p-2 flex items-center justify-center">
                        <svg className="w-full max-w-[210px] h-auto" viewBox="0 0 240 100">
                          {/* Before */}
                          <circle cx="50" cy="20" r="11" fill="#FFFFFF" stroke="#0D402E" strokeWidth="1.5" />
                          <text x="50" y="24" textAnchor="middle" fill="#0D402E" fontFamily="JetBrains Mono" fontSize="10">Z</text>
                          <line x1="42" y1="28" x2="28" y2="48" stroke="#717974" strokeWidth="1.2" />
                          <circle cx="25" cy="56" r="10" fill="#EAF0EB" stroke="#285744" strokeWidth="1.5" />
                          <text x="25" y="60" textAnchor="middle" fill="#285744" fontFamily="JetBrains Mono" fontSize="9">Y</text>
                          <line x1="18" y1="63" x2="10" y2="78" stroke="#717974" strokeWidth="1.2" />
                          <circle cx="8" cy="85" r="7" fill="#FFFFFF" stroke="#717974" strokeWidth="1.2" />
                          <text x="8" y="88" textAnchor="middle" fill="#717974" fontFamily="JetBrains Mono" fontSize="7">X</text>
                          {/* Arrow */}
                          <path d="M 85 50 L 115 50" stroke="#0D402E" strokeWidth="1.5" />
                          <text x="100" y="42" textAnchor="middle" fill="#5A605C" fontFamily="Inter" fontSize="8">Right(Z)</text>
                          {/* After */}
                          <circle cx="160" cy="25" r="11" fill="#EAF0EB" stroke="#285744" strokeWidth="1.5" />
                          <text x="160" y="29" textAnchor="middle" fill="#285744" fontFamily="JetBrains Mono" fontSize="10">Y</text>
                          <line x1="152" y1="33" x2="138" y2="52" stroke="#717974" strokeWidth="1.2" />
                          <circle cx="135" cy="60" r="9" fill="#FFFFFF" stroke="#717974" strokeWidth="1.2" />
                          <text x="135" y="63" textAnchor="middle" fill="#717974" fontFamily="JetBrains Mono" fontSize="8">X</text>
                          <line x1="168" y1="33" x2="182" y2="52" stroke="#717974" strokeWidth="1.2" />
                          <circle cx="185" cy="60" r="9" fill="#FFFFFF" stroke="#0D402E" strokeWidth="1.2" />
                          <text x="185" y="63" textAnchor="middle" fill="#0D402E" fontFamily="JetBrains Mono" fontSize="8">Z</text>
                        </svg>
                      </div>
                    </div>

                    {/* Rotation Case 2: Right-Right */}
                    <div className="border border-[#E5E7E2] rounded p-3 bg-white hover:border-[#C8CCC5] transition-colors">
                      <div className="flex items-center justify-between border-b border-[#E5E7E2] pb-1.5 mb-2">
                        <span className="font-mono text-label-sm font-label-sm font-semibold text-primary">
                          Case 2: Right-Right (RR)
                        </span>
                        <span className="text-caption font-caption bg-[#EAF0EB] text-[#285744] px-1.5 py-0.5 rounded">
                          Single Left Rotation
                        </span>
                      </div>
                      <p className="text-[12px] text-secondary leading-snug mb-3">
                        Insertion into the right subtree of the right child of node <code className="font-mono">z</code>.
                      </p>
                      {/* Vector Graphic Diagram */}
                      <div className="w-full bg-[#FBFBFA] border border-[#EBECE8] rounded p-2 flex items-center justify-center">
                        <svg className="w-full max-w-[210px] h-auto" viewBox="0 0 240 100">
                          {/* Before */}
                          <circle cx="20" cy="20" r="11" fill="#FFFFFF" stroke="#0D402E" strokeWidth="1.5" />
                          <text x="20" y="24" textAnchor="middle" fill="#0D402E" fontFamily="JetBrains Mono" fontSize="10">Z</text>
                          <line x1="28" y1="28" x2="42" y2="48" stroke="#717974" strokeWidth="1.2" />
                          <circle cx="45" cy="56" r="10" fill="#EAF0EB" stroke="#285744" strokeWidth="1.5" />
                          <text x="45" y="60" textAnchor="middle" fill="#285744" fontFamily="JetBrains Mono" fontSize="9">Y</text>
                          <line x1="52" y1="63" x2="60" y2="78" stroke="#717974" strokeWidth="1.2" />
                          <circle cx="63" cy="85" r="7" fill="#FFFFFF" stroke="#717974" strokeWidth="1.2" />
                          <text x="63" y="88" textAnchor="middle" fill="#717974" fontFamily="JetBrains Mono" fontSize="7">X</text>
                          {/* Arrow */}
                          <path d="M 85 50 L 115 50" stroke="#0D402E" strokeWidth="1.5" />
                          <text x="100" y="42" textAnchor="middle" fill="#5A605C" fontFamily="Inter" fontSize="8">Left(Z)</text>
                          {/* After */}
                          <circle cx="160" cy="25" r="11" fill="#EAF0EB" stroke="#285744" strokeWidth="1.5" />
                          <text x="160" y="29" textAnchor="middle" fill="#285744" fontFamily="JetBrains Mono" fontSize="10">Y</text>
                          <line x1="152" y1="33" x2="138" y2="52" stroke="#717974" strokeWidth="1.2" />
                          <circle cx="135" cy="60" r="9" fill="#FFFFFF" stroke="#0D402E" strokeWidth="1.2" />
                          <text x="135" y="63" textAnchor="middle" fill="#0D402E" fontFamily="JetBrains Mono" fontSize="8">Z</text>
                          <line x1="168" y1="33" x2="182" y2="52" stroke="#717974" strokeWidth="1.2" />
                          <circle cx="185" cy="60" r="9" fill="#FFFFFF" stroke="#717974" strokeWidth="1.2" />
                          <text x="185" y="63" textAnchor="middle" fill="#717974" fontFamily="JetBrains Mono" fontSize="8">X</text>
                        </svg>
                      </div>
                    </div>

                    {/* Rotation Case 3: Left-Right */}
                    <div className="border border-[#E5E7E2] rounded p-3 bg-white hover:border-[#C8CCC5] transition-colors">
                      <div className="flex items-center justify-between border-b border-[#E5E7E2] pb-1.5 mb-2">
                        <span className="font-mono text-label-sm font-label-sm font-semibold text-primary">
                          Case 3: Left-Right (LR)
                        </span>
                        <span className="text-caption font-caption bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded font-medium">
                          Double Rotation
                        </span>
                      </div>
                      <p className="text-[12px] text-secondary leading-snug mb-1">
                        Left on child <code className="font-mono">Y</code>, followed by Right on root <code className="font-mono">Z</code>.
                      </p>
                      <p className="font-mono text-[11px] text-tertiary">Sequence: Left(Y) → Right(Z)</p>
                    </div>

                    {/* Rotation Case 4: Right-Left */}
                    <div className="border border-[#E5E7E2] rounded p-3 bg-white hover:border-[#C8CCC5] transition-colors">
                      <div className="flex items-center justify-between border-b border-[#E5E7E2] pb-1.5 mb-2">
                        <span className="font-mono text-label-sm font-label-sm font-semibold text-primary">
                          Case 4: Right-Left (RL)
                        </span>
                        <span className="text-caption font-caption bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded font-medium">
                          Double Rotation
                        </span>
                      </div>
                      <p className="text-[12px] text-secondary leading-snug mb-1">
                        Right on child <code className="font-mono">Y</code>, followed by Left on root <code className="font-mono">Z</code>.
                      </p>
                      <p className="font-mono text-[11px] text-tertiary">Sequence: Right(Y) → Left(Z)</p>
                    </div>
                  </div>
                </section>

                {/* Complexity Proof Table */}
                <section className="border-t border-[#E5E7E2] pt-4">
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
                    3. Time & Space Complexity Bounds
                  </h3>
                  <table className="w-full text-left text-body-sm font-body-sm border border-[#E5E7E2]">
                    <thead>
                      <tr className="bg-[#F8F8F5] border-b border-[#E5E7E2] text-label-sm font-label-sm text-tertiary font-semibold">
                        <th className="p-2 border-r border-[#E5E7E2]">Operation</th>
                        <th className="p-2 border-r border-[#E5E7E2]">Average Time</th>
                        <th className="p-2 border-r border-[#E5E7E2]">Worst Case</th>
                        <th className="p-2">Space Complexity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7E2] font-mono text-[13px]">
                      <tr className="hover:bg-[#F8F8F5]">
                        <td className="p-2 border-r border-[#E5E7E2] font-sans font-medium text-on-surface">Search / Lookup</td>
                        <td className="p-2 border-r border-[#E5E7E2] text-primary">O(log n)</td>
                        <td className="p-2 border-r border-[#E5E7E2] text-primary">O(log n)</td>
                        <td className="p-2 text-secondary">O(1) aux</td>
                      </tr>
                      <tr className="hover:bg-[#F8F8F5]">
                        <td className="p-2 border-r border-[#E5E7E2] font-sans font-medium text-on-surface">Insertion (inc. rebalance)</td>
                        <td className="p-2 border-r border-[#E5E7E2] text-primary">O(log n)</td>
                        <td className="p-2 border-r border-[#E5E7E2] text-primary">O(log n)</td>
                        <td className="p-2 text-secondary">O(1) aux</td>
                      </tr>
                      <tr className="hover:bg-[#F8F8F5]">
                        <td className="p-2 border-r border-[#E5E7E2] font-sans font-medium text-on-surface">Deletion (inc. cascades)</td>
                        <td className="p-2 border-r border-[#E5E7E2] text-primary">O(log n)</td>
                        <td className="p-2 border-r border-[#E5E7E2] text-primary">O(log n)</td>
                        <td className="p-2 text-secondary">O(1) aux</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                {/* Document Sheet Watermark Footer */}
                <div className="mt-8 pt-4 border-t border-[#E5E7E2] flex items-center justify-between text-caption font-caption text-secondary">
                  <span>CampusNotes Academic Commons Repository • Non-Commercial Educational Distribution</span>
                  <span className="font-mono">Sheet {pageNumber} of {totalPages}</span>
                </div>
              </article>
            </div>

            {/* Document Viewer Pagination Footer Bar */}
            <div className="bg-surface-container-low border-t border-outline-variant px-space-md py-2 flex items-center justify-between text-body-sm font-body-sm">
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                <span className="text-caption font-caption">Use arrow keys (← / →) to flip pages</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className="px-2.5 py-1 text-label-sm font-label-sm text-secondary bg-surface-container-lowest border border-outline-variant rounded hover:text-primary transition-colors disabled:opacity-40"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1 font-mono text-label-sm font-label-sm">
                  <input
                    type="text"
                    value={pageNumber}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      if (!isNaN(v) && v >= 1 && v <= totalPages) setPageNumber(v);
                    }}
                    className="w-8 text-center py-0.5 border border-outline-variant rounded bg-surface-container-lowest font-mono text-on-surface text-label-sm"
                  />
                  <span className="text-secondary">/ {totalPages}</span>
                </div>
                <button
                  onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                  disabled={pageNumber === totalPages}
                  className="px-2.5 py-1 text-label-sm font-label-sm text-secondary bg-surface-container-lowest border border-outline-variant rounded hover:text-primary transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Document Metadata & Context Drawer (~340px / 4 of 12 cols desktop) */}
          <aside className="lg:col-span-4 flex flex-col gap-space-md">
            {/* Card 1: Resource Details Ledger Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-[0_4px_12px_rgba(32,37,34,0.03)]">
              <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant mb-space-sm">
                <h2 className="font-headline-sm text-headline-sm text-primary">Resource Details</h2>
                <span className="bg-[#EAF0EB] text-[#285744] text-[11px] font-semibold px-2 py-0.5 rounded tracking-wide uppercase">
                  Verified
                </span>
              </div>

              {/* Structured Metadata Ledger Rows */}
              <dl className="divide-y divide-outline-variant text-body-sm font-body-sm">
                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-secondary font-medium">Course</dt>
                  <dd className="text-on-surface text-right font-medium">
                    <Link to={`/subjects/${resource.subjectId}`} className="hover:text-primary hover:underline">
                      {resource.courseCode} {resource.subjectName}
                    </Link>
                    <span className="block text-caption font-caption text-secondary">
                      Year {resource.yearNumber}, Sem {resource.semesterNumber}
                    </span>
                  </dd>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-secondary font-medium">Topic</dt>
                  <dd className="text-on-surface text-right">{resource.unitOrTopic || 'General Study Material'}</dd>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-secondary font-medium">Document Type</dt>
                  <dd className="text-on-surface text-right">{resource.categoryLabel}</dd>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-secondary font-medium">Format</dt>
                  <dd className="text-on-surface text-right font-mono text-[12px]">
                    {resource.fileFormat} (Vector, Searchable)
                  </dd>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-secondary font-medium">File Size</dt>
                  <dd className="text-on-surface text-right font-mono text-[12px]">{resource.fileSize}</dd>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-secondary font-medium">Published</dt>
                  <dd className="text-on-surface text-right">{resource.publishDate}</dd>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-secondary font-medium">Contributor</dt>
                  <dd className="text-on-surface text-right">
                    <span className="font-medium">{resource.uploaderName}</span>
                    <span className="block text-[11px] text-[#285744] font-medium flex items-center justify-end gap-1">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      {resource.uploaderRole}
                    </span>
                  </dd>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <dt className="text-secondary font-medium">License / Honor</dt>
                  <dd className="text-on-surface text-right text-caption font-caption text-secondary">
                    {resource.license || 'Public Domain Academic Commons'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Card 2: Actions Section */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-[0_4px_12px_rgba(32,37,34,0.03)] flex flex-col gap-3">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Actions</h3>

              {/* Primary Download Action */}
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-primary-container text-on-primary py-2.5 px-4 rounded font-label-md text-label-md hover:bg-primary transition-colors text-center font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Download File ({resource.fileSize})</span>
              </button>

              {/* Integrity Checksum Note */}
              <div className="p-2 bg-surface-container-low border border-outline-variant rounded text-caption font-caption text-secondary flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">verified_user</span>
                <div>
                  <span className="font-medium text-on-surface">MD5 Checksum:</span>
                  <p className="font-mono text-[10px] break-all text-tertiary">
                    {resource.md5Checksum || 'e8b39c59a0f4a81df5914620d43ac7b2'}
                  </p>
                </div>
              </div>

              {/* Secondary Actions: Citation & Save to Stacks */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => setIsCitationOpen(true)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 border border-outline-variant rounded bg-white text-body-sm font-body-sm hover:bg-surface-container transition-colors text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">format_quote</span>
                  <span>Cite Record</span>
                </button>
                <button
                  onClick={handleSaveToggle}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 border border-outline-variant rounded text-body-sm font-body-sm transition-colors ${
                    saved
                      ? 'bg-[#EAF0EB] text-primary font-semibold border-primary/40'
                      : 'bg-white hover:bg-surface-container text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {saved ? 'bookmark_added' : 'bookmark_add'}
                  </span>
                  <span>{saved ? 'In Stacks' : 'Save to Stacks'}</span>
                </button>
              </div>

              {/* Report Violation Button */}
              <button
                onClick={() => setIsReportOpen(true)}
                className="w-full mt-1 flex items-center justify-center gap-1.5 text-error hover:bg-error-container/20 py-1.5 rounded transition-colors text-label-sm font-label-sm border border-transparent hover:border-error-container"
              >
                <span className="material-symbols-outlined text-[16px]">flag</span>
                <span>Report Inaccuracy or Violation</span>
              </button>
            </div>

            {/* Card 3: Related Subject Materials */}
            {relatedResources.length > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-[0_4px_12px_rgba(32,37,34,0.03)]">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant mb-2">
                  <h3 className="font-headline-sm text-headline-sm text-primary">Related Subject Materials</h3>
                  <Link to={`/subjects/${resource.subjectId}`} className="text-caption font-caption text-primary hover:underline">
                    View All {resource.courseCode}
                  </Link>
                </div>
                <div className="divide-y divide-outline-variant">
                  {relatedResources.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/resources/${rel.id}`}
                      className="py-2.5 block hover:bg-surface-container-low -mx-2 px-2 rounded transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-body-sm font-body-sm font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                          {rel.title}
                        </span>
                        <span className="font-mono text-caption font-caption text-secondary shrink-0 mt-0.5">
                          {rel.fileSize}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-caption font-caption text-secondary">
                        <span className="inline-flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px]">
                            {rel.fileFormat === 'PDF' ? 'picture_as_pdf' : 'code'}
                          </span>
                          {rel.fileFormat}
                        </span>
                        <span>•</span>
                        <span>{rel.unitOrTopic || rel.categoryLabel}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Citation Modal */}
      {isCitationOpen && (
        <CitationModal
          resource={resource}
          isOpen={isCitationOpen}
          onClose={() => setIsCitationOpen(false)}
        />
      )}

      {/* Report Modal */}
      {isReportOpen && (
        <ReportModal
          resource={resource}
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
};
