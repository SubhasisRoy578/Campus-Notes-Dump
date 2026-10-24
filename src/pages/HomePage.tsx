import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AcademicResource } from '../types';
import { getRecentResources } from '../services/resources/resourceService';
import { YEAR_SEMESTER_MAP } from '../utils/academicLogic';
import { CitationModal } from '../components/common/CitationModal';

export const HomePage: React.FC = () => {
  const [recentResources, setRecentResources] = useState<AcademicResource[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeCitationResource, setActiveCitationResource] = useState<AcademicResource | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    const resources = await getRecentResources(8);
    setRecentResources(resources);
    setLoading(false);
  };

  const filteredResources = recentResources.filter((r) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'lecture_notes') return r.category === 'lecture_notes';
    if (selectedFilter === 'pyq') return r.category === 'pyq';
    if (selectedFilter === 'lab_manual') return r.category === 'lab_manual';
    if (selectedFilter === 'reference_guide') return r.category === 'reference_guide' || r.category === 'cheatsheet';
    return true;
  });

  const handleDownload = (resource: AcademicResource, e: React.MouseEvent) => {
    e.stopPropagation();
    // Create an academic file download blob simulation
    const content = `CampusNotes Academic Repository\n\nTitle: ${resource.title}\nCourse: ${resource.courseCode} - ${resource.subjectName}\nUnit: ${resource.unitOrTopic || 'General'}\nContributor: ${resource.uploaderName} (${resource.uploaderRole})\nPublished: ${resource.publishDate}\nMD5 Checksum: ${resource.md5Checksum || 'Verified'}\n\nAbstract:\n${resource.abstract || 'Academic study material.'}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.courseCode}_${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.${resource.fileFormat.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex-grow max-w-[1320px] w-full mx-auto px-gutter md:px-margin py-space-xl flex flex-col gap-space-xl">
      {/* ACADEMIC HERO / MISSION BANNER */}
      <section className="border-b border-outline-variant pb-space-xl">
        <div className="max-w-3xl space-y-space-md">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-container rounded-lg border border-outline-variant">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-container"></span>
            <span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">
              Institutional Open Access Archive
            </span>
          </div>

          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight text-balance">
            The Shared Academic Library for University Scholars
          </h1>

          <p className="font-body-lg text-body-lg text-secondary leading-relaxed text-balance">
            Open-access lecture notes, previous-year question papers, lab manuals, and verified course materials organized systematically across all 8 undergraduate semesters.
          </p>

          {/* Quick Institutional Value Signals */}
          <div className="pt-space-xs flex flex-wrap items-center gap-y-2 gap-x-6 text-label-sm font-label-sm text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">lock_open</span>
              <span>Public archive • No sign-up required to browse or download</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">verified</span>
              <span>Faculty and peer-moderated materials</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">account_balance</span>
              <span>Adheres to university curriculum standard</span>
            </div>
          </div>
        </div>
      </section>

      {/* ACADEMIC HIERARCHY BROWSER (4 Years & 8 Semesters) */}
      <section className="space-y-space-lg">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-outline-variant pb-space-sm gap-2">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Curricular Taxonomy</h2>
            <p className="font-body-sm text-body-sm text-secondary">
              Navigate curriculum records indexed by academic progression and course level.
            </p>
          </div>
          <span className="font-label-sm text-label-sm text-secondary font-mono">
            8 Semesters • 48 Disciplines
          </span>
        </div>

        {/* 4 Years Grid: 4 Pillars of Progression */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {([1, 2, 3, 4] as const).map((yearNum) => {
            const yr = YEAR_SEMESTER_MAP[yearNum];
            return (
              <div
                key={yearNum}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col justify-between hover:border-primary-container transition-colors duration-150"
              >
                <div className="p-4 border-b border-outline-variant bg-surface-container-low rounded-t-lg">
                  <span className="font-caption text-caption text-secondary uppercase font-semibold">
                    {yr.stage}
                  </span>
                  <Link
                    to={`/years/${yearNum}`}
                    className="font-headline-sm text-headline-sm text-on-surface hover:text-primary transition-colors block"
                  >
                    {yr.name}
                  </Link>
                  <p className="font-body-sm text-body-sm text-secondary">{yr.subtitle}</p>
                </div>
                <div className="p-4 divide-y divide-outline-variant flex-1 flex flex-col justify-between">
                  {yr.semesters.map((sem) => (
                    <Link
                      key={sem.number}
                      to={`/semesters/${sem.number}`}
                      className="py-3 group block hover:bg-surface-container-low transition-colors -mx-4 px-4"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-label-md text-label-md font-semibold text-primary group-hover:underline">
                          {sem.name}
                        </span>
                        <span className="font-caption text-caption px-2 py-0.5 bg-surface-container rounded text-secondary font-mono">
                          {sem.number === 1
                            ? '142 Files'
                            : sem.number === 2
                            ? '168 Files'
                            : sem.number === 3
                            ? '215 Files'
                            : sem.number === 4
                            ? '194 Files'
                            : sem.number === 5
                            ? '310 Files'
                            : sem.number === 6
                            ? '278 Files'
                            : sem.number === 7
                            ? '182 Files'
                            : '95 Files'}
                        </span>
                      </div>
                      <p className="font-caption text-caption text-secondary line-clamp-1">
                        {sem.subjectsSummary}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENTLY PUBLISHED RESOURCES SECTION (Clean Table-Like Ledger) */}
      <section className="space-y-space-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md border-b border-outline-variant pb-space-sm">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Recently Published Resources</h2>
            <p className="font-body-sm text-body-sm text-secondary">
              Latest accessions reviewed for syllabus fidelity and institutional standards.
            </p>
          </div>

          {/* Filter Pills & Archive Link */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 bg-surface-container rounded-lg border border-outline-variant">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 text-label-sm font-label-sm rounded transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-none'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter('lecture_notes')}
                className={`px-3 py-1 text-label-sm font-label-sm rounded transition-colors ${
                  selectedFilter === 'lecture_notes'
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-none'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Lecture Notes
              </button>
              <button
                onClick={() => setSelectedFilter('pyq')}
                className={`px-3 py-1 text-label-sm font-label-sm rounded transition-colors ${
                  selectedFilter === 'pyq'
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-none'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Previous Year Papers
              </button>
              <button
                onClick={() => setSelectedFilter('lab_manual')}
                className={`px-3 py-1 text-label-sm font-label-sm rounded transition-colors ${
                  selectedFilter === 'lab_manual'
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-none'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Lab Manuals
              </button>
              <button
                onClick={() => setSelectedFilter('reference_guide')}
                className={`px-3 py-1 text-label-sm font-label-sm rounded transition-colors hidden sm:inline-block ${
                  selectedFilter === 'reference_guide'
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-none'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Reference Guides
              </button>
            </div>

            <Link
              to="/recent"
              className="text-primary hover:underline font-label-sm text-label-sm flex items-center gap-1 pl-2 font-medium"
            >
              <span>View all archive</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Ledger Rows */}
        <div className="border border-outline-variant rounded-xl bg-surface-container-lowest overflow-hidden">
          {/* Table Column Headers */}
          <div className="hidden md:grid grid-cols-12 px-4 py-2.5 bg-surface-container-low border-b border-outline-variant font-label-sm text-label-sm text-secondary">
            <div className="col-span-6">DOCUMENT TITLE & COURSE CODE</div>
            <div className="col-span-2">CLASSIFICATION</div>
            <div className="col-span-2">CONTRIBUTOR & DATE</div>
            <div className="col-span-2 text-right">ACTIONS</div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-secondary text-body-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              <span>Loading recently published accessions...</span>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-secondary text-4xl mb-2">library_books</span>
              <h3 className="font-headline-sm text-base text-primary">No resources have been published yet</h3>
              <p className="text-body-sm text-secondary mt-1">
                Be the first university scholar to contribute verified course notes to this semester.
              </p>
              <Link
                to="/upload"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container text-white rounded-lg text-label-md hover:bg-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Submit Notes</span>
              </Link>
            </div>
          ) : (
            filteredResources.map((item, idx) => (
              <div
                key={item.id}
                className={`p-4 md:py-3.5 ${
                  idx < filteredResources.length - 1 ? 'border-b border-outline-variant' : ''
                } hover:bg-surface-bright transition-colors flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-3`}
              >
                <div className="md:col-span-6 flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[20px]">
                      {item.fileFormat === 'PDF' ? 'picture_as_pdf' : 'description'}
                    </span>
                  </div>
                  <div>
                    <Link
                      to={`/resources/${item.id}`}
                      className="font-label-md text-label-md font-semibold text-on-surface hover:text-primary hover:underline line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 font-caption text-caption text-secondary">
                      <span className="font-mono">{item.fileSize} {item.fileFormat}</span>
                      <span>•</span>
                      <span>{item.downloadCount} Downloads</span>
                      {item.verifiedBadge && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">{item.verifiedBadge}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-fixed text-caption font-caption rounded font-semibold">
                    Year {item.yearNumber} · Sem {item.semesterNumber}
                  </span>
                  <span className="px-2 py-0.5 bg-surface-container text-secondary text-caption font-caption rounded">
                    {item.categoryLabel}
                  </span>
                </div>

                <div className="md:col-span-2 font-body-sm text-body-sm text-secondary">
                  <div className="text-on-surface font-medium">{item.uploaderName}</div>
                  <div className="font-caption text-caption text-outline">{item.publishDate}</div>
                </div>

                <div className="md:col-span-2 w-full md:w-auto flex items-center justify-start md:justify-end gap-2 pt-2 md:pt-0">
                  <Link
                    to={`/resources/${item.id}`}
                    className="px-2.5 py-1 text-primary hover:bg-surface-container rounded font-label-sm text-label-sm flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Preview</span>
                  </Link>
                  <button
                    onClick={(e) => handleDownload(item, e)}
                    className="px-2.5 py-1 border border-outline-variant hover:border-primary-container text-on-surface hover:text-primary rounded font-label-sm text-label-sm flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* PUBLIC REPOSITORY EDITORIAL CALLOUT CARD */}
      <section className="border border-outline-variant rounded-xl bg-surface-container-low p-space-lg md:p-space-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg">
          <div className="max-w-2xl space-y-space-xs">
            <div className="inline-flex items-center gap-1.5 text-primary font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[18px]">history_edu</span>
              <span>Community Preservation Mission</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Contribute to the Campus Archive
            </h3>
            <p className="font-body-md text-body-md text-secondary">
              Sharing your verified notes, midterm guides, and lab observations helps hundreds of peers conquer foundational courses. Sign-in is only required when publishing new resources; reading and downloading remains permanently unrestricted.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-md shrink-0">
            <Link
              to="/usage-guidelines"
              className="px-4 py-2 border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-on-surface rounded-lg font-label-md text-label-md transition-colors duration-150"
            >
              Browse Submission Guidelines
            </Link>
            <Link
              to="/upload"
              className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-colors duration-150 font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Submit Notes</span>
            </Link>
          </div>
        </div>
      </section>

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
