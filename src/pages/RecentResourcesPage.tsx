import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AcademicResource } from '../types';
import { getPublishedResources } from '../services/resources/resourceService';

export const RecentResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecent();
  }, [categoryFilter]);

  const loadRecent = async () => {
    setLoading(true);
    const data = await getPublishedResources({
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      sortBy: 'newest'
    });
    setResources(data);
    setLoading(false);
  };

  return (
    <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-space-xl flex flex-col gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant pb-space-md gap-4">
        <div>
          <span className="font-caption text-caption text-secondary uppercase font-semibold">
            Institutional Open-Access Repository
          </span>
          <h1 className="text-headline-xl font-headline-xl text-primary mt-1">
            Recently Added Accessions
          </h1>
          <p className="text-body-md text-secondary mt-1">
            Browse the newest peer-moderated lecture slides, midterm solutions, and lab protocols deposited by scholars.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex p-1 bg-surface-container rounded-lg border border-outline-variant">
          {[
            { id: 'all', label: 'All' },
            { id: 'lecture_notes', label: 'Lecture Notes' },
            { id: 'pyq', label: 'PYQ Papers' },
            { id: 'lab_manual', label: 'Lab Manuals' },
            { id: 'reference_guide', label: 'Reference Guides' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1 rounded text-label-sm font-label-sm transition-colors ${
                categoryFilter === tab.id
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-secondary">
          <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2">progress_activity</span>
          <p>Retrieving accessions ledger...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl">
          <p className="text-secondary text-body-md">No resources found in this category.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant">
          {resources.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-surface-bright transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded bg-[#EAF0EB] text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">
                    {item.fileFormat === 'PDF' ? 'picture_as_pdf' : 'description'}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-[#EAF0EB] text-primary rounded">
                      {item.courseCode}
                    </span>
                    <Link
                      to={`/resources/${item.id}`}
                      className="font-semibold text-on-surface hover:text-primary hover:underline line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <span className="text-caption text-secondary px-1.5 py-0.2 bg-surface-container rounded border border-outline-variant/60">
                      {item.categoryLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-caption text-secondary">
                    <span>Year {item.yearNumber} · Sem {item.semesterNumber}</span>
                    <span>•</span>
                    <span className="font-mono">{item.fileSize}</span>
                    <span>•</span>
                    <span>Uploaded by {item.uploaderName}</span>
                    <span>•</span>
                    <span>{item.publishDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Link
                  to={`/resources/${item.id}`}
                  className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface rounded-lg text-label-sm font-label-sm flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Preview</span>
                </Link>
                <Link
                  to={`/resources/${item.id}`}
                  className="px-3 py-1.5 bg-primary-container text-white rounded-lg text-label-sm font-label-sm hover:bg-primary transition-colors flex items-center gap-1 font-medium"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
