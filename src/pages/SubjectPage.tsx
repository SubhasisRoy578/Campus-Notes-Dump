import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Subject, AcademicResource } from '../types';
import { getSubjectById, getPublishedResources } from '../services/resources/resourceService';
import { CitationModal } from '../components/common/CitationModal';

export const SubjectPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [emptyDemoVisible, setEmptyDemoVisible] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeCitationResource, setActiveCitationResource] = useState<AcademicResource | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSubjectData();
  }, [subjectId]);

  const loadSubjectData = async () => {
    const sId = subjectId || 'cs201';
    const s = await getSubjectById(sId);
    setSubject(s);
    const res = await getPublishedResources({ subjectId: sId });
    setResources(res);
  };

  const handleDownloadSyllabus = () => {
    if (!subject) return;
    const content = `OFFICIAL UNIVERSITY SYLLABUS\n\nCourse: ${subject.code} ${subject.name}\nDepartment: ${subject.department}\nCredits: ${subject.credits} (3 Lectures + 1 Practical)\n\nUNITS:\n${subject.units
      .map((u) => `Unit ${u.unitNumber}: ${u.title}`)
      .join('\n')}\n\nRecommended Texts:\n1. Cormen, Leiserson, Rivest, Stein - Introduction to Algorithms\n2. Robert Sedgewick - Algorithms in C++\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subject.code}_Syllabus_2024.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Official syllabus PDF downloaded.');
  };

  const handleDownloadResource = (res: AcademicResource, e: React.MouseEvent) => {
    e.stopPropagation();
    const content = `CampusNotes Academic Repository\nTitle: ${res.title}\nCourse: ${res.courseCode}\n\n${res.abstract || ''}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${res.courseCode}_${res.title.replace(/[^a-zA-Z0-9]/g, '_')}.${res.fileFormat.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Download started.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!subject) {
    return (
      <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-20 text-center">
        <span className="material-symbols-outlined text-4xl text-secondary mb-3">auto_stories</span>
        <h2 className="font-headline-md text-primary text-xl">Subject Not Found</h2>
        <p className="text-secondary text-body-md mt-2">
          The requested subject code was not located in the university course catalog.
        </p>
        <Link to="/subjects" className="mt-4 inline-block px-4 py-2 bg-primary-container text-white rounded-lg text-label-md">
          Browse All Subjects
        </Link>
      </main>
    );
  }

  // Filter resources
  let filtered = resources.filter((r) => {
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'lecture_notes' && r.category !== 'lecture_notes') return false;
      if (selectedCategory === 'pyq' && r.category !== 'pyq') return false;
      if (selectedCategory === 'lab_manual' && r.category !== 'lab_manual') return false;
      if (selectedCategory === 'reference_guide' && r.category !== 'reference_guide' && r.category !== 'cheatsheet') return false;
    }
    if (selectedUnit !== 'all') {
      const uNumber = parseInt(selectedUnit);
      if (uNumber && !r.unitOrTopic?.toLowerCase().includes(`unit ${uNumber}`)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.courseCode.toLowerCase().includes(q) ||
        (r.unitOrTopic && r.unitOrTopic.toLowerCase().includes(q)) ||
        (r.abstract && r.abstract.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Sort
  if (selectedSort === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (selectedSort === 'alpha') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (selectedSort === 'downloads') {
    filtered.sort((a, b) => b.downloadCount - a.downloadCount);
  }

  // Group by Units
  const unit1Items = filtered.filter((r) => r.unitOrTopic?.toLowerCase().includes('unit 1'));
  const unit2Items = filtered.filter((r) => r.unitOrTopic?.toLowerCase().includes('unit 2'));
  const unit3Items = filtered.filter((r) => r.unitOrTopic?.toLowerCase().includes('unit 3'));
  const otherItems = filtered.filter(
    (r) =>
      !r.unitOrTopic?.toLowerCase().includes('unit 1') &&
      !r.unitOrTopic?.toLowerCase().includes('unit 2') &&
      !r.unitOrTopic?.toLowerCase().includes('unit 3')
  );

  return (
    <main className="flex-1 w-full max-w-[1320px] mx-auto px-gutter-mobile md:px-margin py-space-lg flex flex-col gap-space-lg">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-xl text-body-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary-fixed text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Chain */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-label-sm font-label-sm text-secondary overflow-x-auto whitespace-nowrap py-0.5">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">home</span>
          Home
        </Link>
        <span className="text-outline-variant">/</span>
        <Link to={`/years/${subject.yearNumber}`} className="hover:text-primary transition-colors">
          {subject.yearNumber === 1 ? '1st Year' : subject.yearNumber === 2 ? '2nd Year' : subject.yearNumber === 3 ? '3rd Year' : '4th Year'}
        </Link>
        <span className="text-outline-variant">/</span>
        <Link to={`/semesters/${subject.semesterNumber}`} className="hover:text-primary transition-colors">
          Semester {subject.semesterNumber}
        </Link>
        <span className="text-outline-variant">/</span>
        <span aria-current="page" className="text-on-surface font-semibold truncate">
          {subject.code}: {subject.name}
        </span>
      </nav>

      {/* Subject Header Section */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg md:p-space-xl flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg relative overflow-hidden">
        <div className="flex flex-col gap-space-sm max-w-3xl">
          {/* Badge taxonomy */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#EAF0EB] text-primary-container px-2 py-0.5 rounded text-caption font-caption tracking-wider border border-outline-variant/60 font-semibold uppercase">
              {subject.department}
            </span>
            <span className="bg-surface-container text-secondary px-2 py-0.5 rounded text-caption font-caption border border-outline-variant/60">
              CORE CURRICULUM
            </span>
          </div>

          {/* Subject Title */}
          <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight">
            {subject.code}: {subject.name}
          </h1>

          {/* Academic Metadata Line */}
          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-space-md text-body-sm font-body-sm text-secondary">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-primary">school</span>
              <span>{subject.credits} Credits</span>
            </div>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span>Course Code:</span>
              <strong className="text-on-surface">{subject.code}</strong>
            </div>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-primary-container fill">verified</span>
              <span className="font-medium text-on-surface">{resources.length || 34} Verified Resources</span>
            </div>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <div className="text-secondary text-body-sm">
              Curated by Academic Senate & Faculty Board
            </div>
          </div>
        </div>

        {/* Quick Subject Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-space-sm shrink-0">
          <button
            onClick={() => {
              setIsSubscribed(!isSubscribed);
              showToast(isSubscribed ? 'Unsubscribed from course updates.' : 'Subscribed to CS201 updates.');
            }}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-label-md font-label-md transition-colors duration-150 ${
              isSubscribed
                ? 'bg-[#EAF0EB] text-primary border-primary/40 font-semibold'
                : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-primary text-base">
              {isSubscribed ? 'notifications_active' : 'notifications'}
            </span>
            <span>{isSubscribed ? 'Subscribed' : 'Subscribe to Updates'}</span>
          </button>
          <button
            onClick={handleDownloadSyllabus}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-container text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary transition-colors duration-150 font-medium"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Download Syllabus PDF</span>
          </button>
        </div>
      </section>

      {/* Faceted Resource Filtering Bar */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col gap-space-md shadow-none">
        {/* Top Row: Scoped Search & Dropdown Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center">
          {/* Scoped Search within Subject */}
          <div className="md:col-span-6 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary-container transition-colors"
              placeholder={`Search within ${subject.code} (e.g. Binary Search Trees, Graph Traversal)...`}
            />
          </div>

          {/* Unit / Module Selector */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-3 pr-8 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary-container cursor-pointer transition-colors"
              >
                <option value="all">All Units (Units 1 to 5)</option>
                <option value="1">Unit 1: Asymptotic Analysis & Linear</option>
                <option value="2">Unit 2: Trees & Balanced Search Trees</option>
                <option value="3">Unit 3: Graph Algorithms & Dynamic Prog</option>
                <option value="4">Unit 4: Greedy Strategies & Branch-Bound</option>
                <option value="5">Unit 5: NP-Completeness & Approximation</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-base">
                expand_more
              </span>
            </div>
          </div>

          {/* Sort Criteria Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-3 pr-8 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary-container cursor-pointer transition-colors"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="alpha">Sort: Alphabetical (A-Z)</option>
                <option value="downloads">Sort: Most Downloaded</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-base">
                swap_vert
              </span>
            </div>
          </div>
        </div>

        {/* Hairline internal rule */}
        <div className="h-[1px] bg-outline-variant/60 w-full"></div>

        {/* Bottom Row: Filter Tabs / Pills */}
        <div className="flex items-center justify-between gap-space-md overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded text-label-sm font-label-sm transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-container text-on-primary font-medium'
                  : 'bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container border border-outline-variant/60'
              }`}
            >
              All ({resources.length || 34})
            </button>
            <button
              onClick={() => setSelectedCategory('lecture_notes')}
              className={`px-3 py-1 rounded text-label-sm font-label-sm transition-colors ${
                selectedCategory === 'lecture_notes'
                  ? 'bg-primary-container text-on-primary font-medium'
                  : 'bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container border border-outline-variant/60'
              }`}
            >
              Lecture Notes (16)
            </button>
            <button
              onClick={() => setSelectedCategory('pyq')}
              className={`px-3 py-1 rounded text-label-sm font-label-sm transition-colors ${
                selectedCategory === 'pyq'
                  ? 'bg-primary-container text-on-primary font-medium'
                  : 'bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container border border-outline-variant/60'
              }`}
            >
              Previous Year Papers (8)
            </button>
            <button
              onClick={() => setSelectedCategory('lab_manual')}
              className={`px-3 py-1 rounded text-label-sm font-label-sm transition-colors ${
                selectedCategory === 'lab_manual'
                  ? 'bg-primary-container text-on-primary font-medium'
                  : 'bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container border border-outline-variant/60'
              }`}
            >
              Lab Manuals (4)
            </button>
            <button
              onClick={() => setSelectedCategory('reference_guide')}
              className={`px-3 py-1 rounded text-label-sm font-label-sm transition-colors ${
                selectedCategory === 'reference_guide'
                  ? 'bg-primary-container text-on-primary font-medium'
                  : 'bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container border border-outline-variant/60'
              }`}
            >
              Reference Guides (6)
            </button>
          </div>

          {/* View Display Mode & Filter Reset */}
          <div className="hidden sm:flex items-center gap-3 text-caption font-caption text-secondary shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              Showing {filtered.length} entries
            </span>
            <button
              onClick={() => setEmptyDemoVisible(!emptyDemoVisible)}
              className="text-primary hover:underline transition-colors flex items-center gap-0.5 font-medium"
              id="toggle-empty-demo"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              {emptyDemoVisible ? 'Hide Empty Demo' : 'Toggle Empty Demo'}
            </button>
          </div>
        </div>
      </section>

      {/* Empty State Representation Container (Interactive trigger per Stitch mockup) */}
      {emptyDemoVisible ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-xl text-center flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-space-md text-secondary">
            <span className="material-symbols-outlined text-3xl">filter_alt_off</span>
          </div>
          <h3 className="text-headline-sm font-headline-sm text-primary mb-1">
            No Academic Resources Match Your Filter
          </h3>
          <p className="text-body-sm font-body-sm text-secondary max-w-md mx-auto mb-space-lg">
            We couldn't locate documents for this specific selection in Unit 5. Try broadening your keywords or clearing the category pills.
          </p>
          <button
            onClick={() => {
              setEmptyDemoVisible(false);
              setSelectedCategory('all');
              setSelectedUnit('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container transition-colors font-medium"
          >
            Reset Applied Filters
          </button>
        </div>
      ) : (
        /* RESOURCE CATALOG (HIGH-DENSITY ACADEMIC LEDGER) */
        <div className="flex flex-col gap-space-lg" id="catalog-content">
          {/* UNIT 1 SECTION */}
          {(selectedUnit === 'all' || selectedUnit === '1') && unit1Items.length > 0 && (
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-none">
              <div className="bg-surface-container-low border-b border-outline-variant px-space-md md:px-space-lg py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-primary px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/80">
                    UNIT 01
                  </span>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface text-base md:text-lg">
                    Asymptotic Analysis & Linear Structures
                  </h2>
                </div>
                <span className="text-caption font-caption text-secondary hidden sm:inline font-mono">
                  {unit1Items.length} Verified Documents
                </span>
              </div>
              <div className="divide-y divide-outline-variant">
                {unit1Items.map((item) => (
                  <ResourceLedgerRow
                    key={item.id}
                    resource={item}
                    onDownload={(e) => handleDownloadResource(item, e)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* UNIT 2 SECTION */}
          {(selectedUnit === 'all' || selectedUnit === '2') && unit2Items.length > 0 && (
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-none">
              <div className="bg-surface-container-low border-b border-outline-variant px-space-md md:px-space-lg py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-primary px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/80">
                    UNIT 02
                  </span>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface text-base md:text-lg">
                    Trees & Balanced Search Trees
                  </h2>
                </div>
                <span className="text-caption font-caption text-secondary hidden sm:inline font-mono">
                  {unit2Items.length} Verified Documents
                </span>
              </div>
              <div className="divide-y divide-outline-variant">
                {unit2Items.map((item) => (
                  <ResourceLedgerRow
                    key={item.id}
                    resource={item}
                    onDownload={(e) => handleDownloadResource(item, e)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* UNIT 3 SECTION */}
          {(selectedUnit === 'all' || selectedUnit === '3') && unit3Items.length > 0 && (
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-none">
              <div className="bg-surface-container-low border-b border-outline-variant px-space-md md:px-space-lg py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-primary px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/80">
                    UNIT 03
                  </span>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface text-base md:text-lg">
                    Graph Algorithms & Dynamic Programming
                  </h2>
                </div>
                <span className="text-caption font-caption text-secondary hidden sm:inline font-mono">
                  {unit3Items.length} Verified Documents
                </span>
              </div>
              <div className="divide-y divide-outline-variant">
                {unit3Items.map((item) => (
                  <ResourceLedgerRow
                    key={item.id}
                    resource={item}
                    onDownload={(e) => handleDownloadResource(item, e)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* OTHER ITEMS (IF ANY) */}
          {otherItems.length > 0 && (
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-none">
              <div className="bg-surface-container-low border-b border-outline-variant px-space-md md:px-space-lg py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-primary px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/80">
                    MODULES
                  </span>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface text-base md:text-lg">
                    Additional Subject Materials & Labs
                  </h2>
                </div>
                <span className="text-caption font-caption text-secondary hidden sm:inline font-mono">
                  {otherItems.length} Verified Documents
                </span>
              </div>
              <div className="divide-y divide-outline-variant">
                {otherItems.map((item) => (
                  <ResourceLedgerRow
                    key={item.id}
                    resource={item}
                    onDownload={(e) => handleDownloadResource(item, e)}
                  />
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-xl text-center">
              <span className="material-symbols-outlined text-4xl text-secondary mb-2">search_off</span>
              <h3 className="font-headline-sm text-base text-primary">No resources match your search criteria</h3>
              <p className="text-body-sm text-secondary mt-1">
                Try modifying your search terms or selecting "All Units".
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedUnit('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-primary-container text-white rounded-lg text-label-md"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Supplementary Academic Carrel / Quick Reference Bento Card */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-space-sm">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined text-lg">menu_book</span>
              <h4 className="font-headline-sm text-headline-sm text-sm font-semibold">
                Recommended Textbooks
              </h4>
            </div>
            <p className="text-body-sm font-body-sm text-secondary mb-3">
              Cormen, Leiserson, Rivest & Stein (CLRS) 3rd Ed; Robert Sedgewick "Algorithms in C++".
            </p>
          </div>
          <button
            onClick={() => showToast('Opening syllabus reading bibliography...')}
            className="text-caption font-caption text-primary font-semibold hover:underline flex items-center gap-1 text-left"
          >
            <span>View Reading List</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined text-lg">terminal</span>
              <h4 className="font-headline-sm text-headline-sm text-sm font-semibold">
                Online Lab Bench
              </h4>
            </div>
            <p className="text-body-sm font-body-sm text-secondary mb-3">
              GCC compiler guidelines, automated test runner configurations, and sample test suite files for Lab 1-8.
            </p>
          </div>
          <button
            onClick={() => showToast('Accessing GCC automated lab bench...')}
            className="text-caption font-caption text-primary font-semibold hover:underline flex items-center gap-1 text-left"
          >
            <span>Open Lab Manuals</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined text-lg">history_edu</span>
              <h4 className="font-headline-sm text-headline-sm text-sm font-semibold">
                Citation & Honor Code
              </h4>
            </div>
            <p className="text-body-sm font-body-sm text-secondary mb-3">
              Code reproduction policies and bibliography formats (BibTeX, APA, IEEE) for course submissions.
            </p>
          </div>
          <button
            onClick={() => {
              if (resources[0]) setActiveCitationResource(resources[0]);
            }}
            className="text-caption font-caption text-primary font-semibold hover:underline flex items-center gap-1 text-left"
          >
            <span>Generate Citations</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Citation Modal */}
      {activeCitationResource && (
        <CitationModal
          resource={activeCitationResource}
          isOpen={Boolean(activeCitationResource)}
          onClose={() => setActiveCitationResource(null)}
        />
      )}
    </main>
  );
};

const ResourceLedgerRow: React.FC<{
  resource: AcademicResource;
  onDownload: (e: React.MouseEvent) => void;
}> = ({ resource, onDownload }) => {
  return (
    <article className="p-space-md md:px-space-lg hover:bg-surface-bright transition-colors duration-150 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="w-10 h-10 rounded bg-[#EAF0EB] text-primary-container border border-outline-variant flex items-center justify-center shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-xl">
            {resource.fileFormat === 'PDF'
              ? 'picture_as_pdf'
              : resource.category === 'lab_manual'
              ? 'code'
              : 'description'}
          </span>
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/resources/${resource.id}`}
              className="text-body-md font-body-md font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer"
            >
              {resource.title}
            </Link>
            <span className="px-1.5 py-0.2 bg-surface-container text-secondary text-caption font-caption rounded border border-outline-variant/60">
              {resource.fileFormat}
            </span>
            {resource.verifiedBadge && (
              <span className="px-1.5 py-0.2 bg-[#EAF0EB] text-primary-container text-caption font-caption font-semibold rounded border border-outline-variant/60 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-xs">verified</span>
                {resource.verifiedBadge}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-body-sm font-body-sm text-secondary">
            <span className="font-mono">{resource.fileSize}</span>
            <span className="text-outline-variant">•</span>
            <span>{resource.publishDate}</span>
            <span className="text-outline-variant">•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">person</span>
              <span>Uploader: </span>
              <strong className="text-on-surface font-medium">{resource.uploaderName}</strong>
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-caption font-caption font-mono text-secondary">
              ID: {resource.docRef || resource.id}
            </span>
          </div>
        </div>
      </div>

      {/* Trailing Action Buttons */}
      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
        <Link
          to={`/resources/${resource.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-low transition-colors duration-150"
        >
          <span className="material-symbols-outlined text-base text-secondary">visibility</span>
          <span>Preview</span>
        </Link>
        <button
          onClick={onDownload}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-container text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary transition-colors duration-150 font-medium"
        >
          <span className="material-symbols-outlined text-base">file_download</span>
          <span>Download</span>
        </button>
      </div>
    </article>
  );
};
