import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AcademicResource } from '../types';
import { getPublishedResources } from '../services/resources/resourceService';
import { CitationModal } from '../components/common/CitationModal';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || 'Data Structures';
  const [query, setQuery] = useState(initialQuery);

  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['Computer Science']);
  const [selectedYears, setSelectedYears] = useState<number[]>([2]);
  const [selectedSemesters, setSelectedSemesters] = useState<number[]>([3]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['lecture_notes', 'pyq']);
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [activeCitationResource, setActiveCitationResource] = useState<AcademicResource | null>(null);
  const [bulkExportActive, setBulkExportActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    loadResults();
  }, [query, sortBy]);

  const loadResults = async () => {
    setLoading(true);
    const data = await getPublishedResources({
      query: query.trim(),
      sortBy: sortBy === 'downloads' ? 'downloads' : 'newest'
    });
    setResources(data);
    setLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query.trim() ? { q: query.trim() } : {});
  };

  const resetAllFilters = () => {
    setSelectedDepts([]);
    setSelectedYears([]);
    setSelectedSemesters([]);
    setSelectedCategories([]);
    setSelectedFormat('all');
    setQuery('');
    setSearchParams({});
  };

  const handleDownload = (res: AcademicResource, e: React.MouseEvent) => {
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

  // Filter logic
  const filtered = resources.filter((r) => {
    if (selectedYears.length > 0 && !selectedYears.includes(r.yearNumber)) {
      return false;
    }
    if (selectedSemesters.length > 0 && !selectedSemesters.includes(r.semesterNumber)) {
      return false;
    }
    if (selectedCategories.length > 0 && !selectedCategories.includes(r.category)) {
      return false;
    }
    if (selectedFormat !== 'all' && r.fileFormat.toLowerCase() !== selectedFormat.toLowerCase()) {
      return false;
    }
    return true;
  });

  const totalResults = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const displayed = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-full flex flex-col bg-[#F8F8F5]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-xl text-body-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary-fixed text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BREADCRUMBS & CONTEXT PATH */}
      <div className="w-full border-b border-outline-variant/60 bg-surface-container-low/40">
        <div className="max-w-[1320px] mx-auto px-gutter md:px-margin py-2 text-label-sm font-label-sm text-secondary flex items-center gap-1.5 overflow-x-auto">
          <Link to="/" className="hover:text-primary transition-colors">
            Repository Catalog
          </Link>
          <span>/</span>
          <Link to="/subjects" className="hover:text-primary transition-colors">
            Engineering & Computer Science
          </Link>
          <span>/</span>
          <span className="text-on-surface font-medium">Search Results</span>
        </div>
      </div>

      {/* SEARCH META BAR */}
      <section className="border-b border-outline-variant bg-surface-container-lowest">
        <div className="max-w-[1320px] mx-auto px-gutter md:px-margin py-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Summary Text & Active Filter Badges */}
            <div>
              <h1 className="text-headline-sm font-headline-sm text-on-surface flex items-baseline gap-2 flex-wrap">
                <span>Search results for</span>
                <span className="italic text-primary font-serif font-semibold">
                  “{query || 'All Resources'}”
                </span>
              </h1>
              <p className="text-body-sm font-body-sm text-secondary mt-0.5">
                {totalResults} verified academic records found across 3 departments
              </p>

              {/* Active Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-caption font-caption">
                <span className="text-secondary uppercase tracking-wider text-[10px] font-semibold">
                  Active filters:
                </span>
                {selectedDepts.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EAF0EB] text-primary border border-outline-variant/60 rounded font-medium"
                  >
                    <span>{d}</span>
                    <button
                      onClick={() => setSelectedDepts(selectedDepts.filter((item) => item !== d))}
                      className="hover:text-error transition-colors text-[14px] leading-none"
                      title="Remove filter"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selectedSemesters.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low text-secondary border border-outline-variant/60 rounded">
                    <span>Semesters ({selectedSemesters.join(', ')})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low text-secondary border border-outline-variant/60 rounded">
                    <span>All Semesters</span>
                  </span>
                )}
                {selectedCategories.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low text-secondary border border-outline-variant/60 rounded">
                    <span>Notes & Papers</span>
                  </span>
                )}
                <button
                  onClick={resetAllFilters}
                  className="text-primary hover:underline ml-1 font-semibold text-[11px] transition-colors"
                >
                  Reset Query
                </button>
              </div>
            </div>

            {/* Catalog Sorting & View Controls */}
            <div className="flex items-center gap-3 self-start lg:self-center">
              <label className="text-label-sm font-label-sm text-secondary whitespace-nowrap" htmlFor="sort-select">
                Sort by:
              </label>
              <div className="relative">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg pl-3 pr-8 py-1.5 text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest First</option>
                  <option value="downloads">Most Downloaded</option>
                  <option value="verified">Faculty Verified First</option>
                </select>
                <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>
              <div className="hidden sm:flex border border-outline-variant rounded-lg overflow-hidden bg-surface-container-lowest">
                <button
                  className="p-1.5 bg-secondary-container/50 text-primary border-r border-outline-variant"
                  title="List View"
                >
                  <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                </button>
                <button
                  onClick={() => showToast('Switched to tabular catalog view.')}
                  className="p-1.5 text-secondary hover:text-on-surface"
                  title="Compact Catalog Ledger"
                >
                  <span className="material-symbols-outlined text-[18px]">table_rows</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CANVAS: TWO-COLUMN ASYMMETRIC CATALOG LAYOUT */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-gutter md:px-margin py-space-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: FACETED SEARCH FILTERS (~280px / 3 cols) */}
          <aside className="lg:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md divide-y divide-outline-variant/70 shadow-xs">
            {/* Filter Header */}
            <div className="pb-space-sm flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
                <span className="text-label-md font-label-md font-semibold text-on-surface uppercase tracking-wider text-[12px]">
                  Filter Archives
                </span>
              </div>
              <button
                onClick={resetAllFilters}
                className="text-caption font-caption text-secondary hover:text-primary transition-colors underline"
              >
                Clear all filters
              </button>
            </div>

            {/* Facet: Department */}
            <div className="py-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-label-sm font-label-sm font-semibold text-on-surface">Department</span>
                <span className="material-symbols-outlined text-[16px] text-secondary">unfold_less</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {[
                  { name: 'Computer Science', count: 15 },
                  { name: 'Information Science', count: 3 }
                ].map((dept) => {
                  const checked = selectedDepts.includes(dept.name);
                  return (
                    <label
                      key={dept.name}
                      className="flex items-center justify-between text-body-sm font-body-sm text-on-surface hover:text-primary cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedDepts((prev) =>
                              checked ? prev.filter((d) => d !== dept.name) : [...prev, dept.name]
                            )
                          }
                          className="w-4 h-4 rounded border-outline text-primary-container focus:ring-primary-container"
                        />
                        <span className="group-hover:text-primary">{dept.name}</span>
                      </div>
                      <span className="text-caption font-caption text-secondary font-mono">{dept.count}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Facet: Academic Year */}
            <div className="py-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-label-sm font-label-sm font-semibold text-on-surface">Academic Year</span>
                <span className="material-symbols-outlined text-[16px] text-secondary">unfold_less</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {[
                  { yr: 1, label: '1st Year', count: 2 },
                  { yr: 2, label: '2nd Year', count: 12 },
                  { yr: 3, label: '3rd Year', count: 4 },
                  { yr: 4, label: '4th Year', count: 0 }
                ].map((item) => {
                  const checked = selectedYears.includes(item.yr);
                  return (
                    <label
                      key={item.yr}
                      className={`flex items-center justify-between text-body-sm font-body-sm text-on-surface group ${
                        item.count === 0 ? 'text-outline cursor-not-allowed opacity-60' : 'cursor-pointer hover:text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={item.count === 0}
                          onChange={() =>
                            setSelectedYears((prev) =>
                              checked ? prev.filter((y) => y !== item.yr) : [...prev, item.yr]
                            )
                          }
                          className="w-4 h-4 rounded border-outline text-primary-container focus:ring-primary-container"
                        />
                        <span className={checked ? 'font-medium group-hover:text-primary' : 'group-hover:text-primary'}>
                          {item.label}
                        </span>
                      </div>
                      <span className="text-caption font-caption text-secondary font-mono">{item.count}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Facet: Semester */}
            <div className="py-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-label-sm font-label-sm font-semibold text-on-surface">Semester</span>
                <span className="material-symbols-outlined text-[16px] text-secondary">unfold_less</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { sem: 1, count: 1 },
                  { sem: 2, count: 1 },
                  { sem: 3, count: 10 },
                  { sem: 4, count: 2 },
                  { sem: 5, count: 4 },
                  { sem: 6, count: 0 }
                ].map((item) => {
                  const checked = selectedSemesters.includes(item.sem);
                  return (
                    <label
                      key={item.sem}
                      className={`flex items-center justify-between text-body-sm font-body-sm p-1 rounded transition-colors ${
                        item.count === 0
                          ? 'text-outline cursor-not-allowed opacity-60'
                          : checked
                          ? 'bg-[#EAF0EB]/50 text-primary font-medium cursor-pointer'
                          : 'text-on-surface cursor-pointer hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={item.count === 0}
                          onChange={() =>
                            setSelectedSemesters((prev) =>
                              checked ? prev.filter((s) => s !== item.sem) : [...prev, item.sem]
                            )
                          }
                          className="w-3.5 h-3.5 rounded border-outline text-primary-container"
                        />
                        <span>Sem {item.sem}</span>
                      </div>
                      <span className="text-caption font-caption font-mono font-semibold">{item.count}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Facet: Resource Type */}
            <div className="py-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-label-sm font-label-sm font-semibold text-on-surface">Resource Type</span>
                <span className="material-symbols-outlined text-[16px] text-secondary">unfold_less</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {[
                  { id: 'lecture_notes', label: 'Lecture Notes', count: 9 },
                  { id: 'pyq', label: 'Question Papers', count: 5 },
                  { id: 'lab_manual', label: 'Lab Manuals', count: 2 },
                  { id: 'reference_guide', label: 'Reference Sheets', count: 2 }
                ].map((item) => {
                  const checked = selectedCategories.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className="flex items-center justify-between text-body-sm font-body-sm text-on-surface hover:text-primary cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedCategories((prev) =>
                              checked ? prev.filter((c) => c !== item.id) : [...prev, item.id]
                            )
                          }
                          className="w-4 h-4 rounded border-outline text-primary-container focus:ring-primary-container"
                        />
                        <span className="group-hover:text-primary">{item.label}</span>
                      </div>
                      <span className="text-caption font-caption text-secondary font-mono">{item.count}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Facet: File Format */}
            <div className="pt-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-label-sm font-label-sm font-semibold text-on-surface">File Format</span>
                <span className="material-symbols-outlined text-[16px] text-secondary">unfold_less</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center justify-between text-body-sm font-body-sm text-on-surface hover:text-primary cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format_filter"
                      checked={selectedFormat === 'all'}
                      onChange={() => setSelectedFormat('all')}
                      className="w-4 h-4 text-primary-container"
                    />
                    <span className="group-hover:text-primary">All Formats</span>
                  </div>
                  <span className="text-caption font-caption text-secondary font-mono">18</span>
                </label>
                <label className="flex items-center justify-between text-body-sm font-body-sm text-on-surface hover:text-primary cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format_filter"
                      checked={selectedFormat === 'pdf'}
                      onChange={() => setSelectedFormat('pdf')}
                      className="w-4 h-4 text-primary-container"
                    />
                    <span className="group-hover:text-primary font-mono text-[13px]">PDF Document</span>
                  </div>
                  <span className="text-caption font-caption text-secondary font-mono">16</span>
                </label>
                <label className="flex items-center justify-between text-body-sm font-body-sm text-on-surface hover:text-primary cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format_filter"
                      checked={selectedFormat === 'docx'}
                      onChange={() => setSelectedFormat('docx')}
                      className="w-4 h-4 text-primary-container"
                    />
                    <span className="group-hover:text-primary font-mono text-[13px]">DOCX Editable</span>
                  </div>
                  <span className="text-caption font-caption text-secondary font-mono">2</span>
                </label>
              </div>
            </div>

            {/* Archival Verification Notice */}
            <div className="pt-4 mt-2">
              <div className="p-3 bg-[#EAF0EB]/60 rounded-lg border border-outline-variant/60 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified</span>
                <p className="text-caption font-caption text-on-surface-variant leading-relaxed">
                  All indexed records conform to institutional archiving standards and academic honor code integrity.
                </p>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN COLUMN: SEARCH RESULTS STREAM (9 cols) */}
          <section className="lg:col-span-9 space-y-space-md">
            {loading ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-12 text-center text-secondary">
                <span className="material-symbols-outlined text-3xl animate-spin text-primary mb-2">
                  progress_activity
                </span>
                <p>Retrieving catalog records...</p>
              </div>
            ) : displayed.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-secondary mb-2">filter_alt_off</span>
                <h3 className="font-headline-sm text-base text-primary">No academic resources match your filter criteria</h3>
                <p className="text-body-sm text-secondary mt-1 max-w-md mx-auto">
                  Try clearing some category checkmarks, resetting semester constraints, or searching by a broader keyword.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="mt-4 px-4 py-2 bg-primary-container text-white rounded-lg text-label-md"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              displayed.map((item) => (
                <article
                  key={item.id}
                  className="bg-surface-container-lowest border border-outline-variant hover:border-[#C8CCC5] rounded-lg transition-all duration-150 p-space-md hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(32,37,34,0.04)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#EAF0EB] text-primary text-[11px] font-semibold px-2 py-0.5 rounded font-mono">
                          {item.courseCode}
                        </span>
                        <span className="text-caption font-caption text-secondary border border-outline-variant px-1.5 py-0.25 rounded">
                          Sem {item.semesterNumber}
                        </span>
                        <span className="text-caption font-caption text-secondary font-mono">
                          Updated {item.publishDate}
                        </span>
                        {item.verifiedBadge && (
                          <span className="inline-flex items-center gap-1 text-caption font-caption text-primary font-medium">
                            <span className="material-symbols-outlined text-[14px] fill">verified</span>
                            <span>{item.verifiedBadge}</span>
                          </span>
                        )}
                      </div>

                      <h2 className="text-headline-sm font-headline-sm text-on-surface hover:text-primary transition-colors cursor-pointer pt-0.5">
                        <Link to={`/resources/${item.id}`} className="hover:underline">
                          <span className="font-semibold text-primary">{item.courseCode}:</span>{' '}
                          {item.title.replace(/^[^:]+:\s*/, '')}
                        </Link>
                      </h2>

                      <p className="text-body-sm font-body-sm text-secondary line-clamp-2">
                        {item.abstract ||
                          'Rigorous algorithmic reference covering tree rotations, balance factors, multi-way branching heuristics, and amortized complexity bounds with full proof sketches.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-caption font-caption text-secondary pt-2">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-error">
                            picture_as_pdf
                          </span>
                          <span>
                            {item.fileFormat} ({item.fileSize})
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          <span>{item.downloadCount} downloads</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">account_balance</span>
                          <span>{item.department}</span>
                        </span>
                        <span className="text-outline font-mono">
                          BibTeX: {item.docRef?.toLowerCase() || item.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0 sm:min-w-[110px] pt-2 sm:pt-0">
                      <button
                        onClick={(e) => handleDownload(item, e)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary-container text-on-secondary rounded-lg text-label-md font-label-md hover:bg-primary transition-colors text-white font-medium"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        <span>Download</span>
                      </button>
                      <Link
                        to={`/resources/${item.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg text-label-md font-label-md hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-secondary">visibility</span>
                        <span>Preview</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}

            {/* PAGINATION BAR */}
            <div className="pt-space-sm border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-body-sm font-body-sm text-secondary">
                Showing{' '}
                <span className="font-medium text-on-surface font-mono">
                  {totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1} –{' '}
                  {Math.min(currentPage * pageSize, totalResults)}
                </span>{' '}
                of <span className="font-medium text-on-surface font-mono">{totalResults}</span> results
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 text-label-sm font-label-sm rounded flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed text-secondary hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  <span>Previous</span>
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded font-mono font-medium text-body-sm transition-colors ${
                      currentPage === idx + 1
                        ? 'bg-primary-container text-white'
                        : 'text-secondary hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 text-primary hover:bg-surface-container text-label-sm font-label-sm font-semibold rounded flex items-center gap-1 transition-colors disabled:opacity-40"
                >
                  <span>Next</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Citation & Export Floating Banner */}
            <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-primary">format_quote</span>
                <div>
                  <p className="text-label-md font-label-md font-semibold text-on-surface">
                    Exporting Search Citations
                  </p>
                  <p className="text-caption font-caption text-secondary">
                    Generate bulk bibliography entries in APA, MLA, or BibTeX for all {totalResults} records.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (displayed[0]) {
                    setActiveCitationResource(displayed[0]);
                  } else {
                    showToast('No records available to export.');
                  }
                }}
                className="px-3 py-1.5 bg-surface-container text-primary border border-outline-variant rounded text-label-md font-label-md hover:bg-surface-container-high transition-colors whitespace-nowrap font-medium self-start sm:self-center"
              >
                Export Results
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Citation Modal */}
      {activeCitationResource && (
        <CitationModal
          resource={activeCitationResource}
          isOpen={Boolean(activeCitationResource)}
          onClose={() => setActiveCitationResource(null)}
        />
      )}
    </div>
  );
};
