import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Subject, SemesterNumber } from '../types';
import { getSubjects } from '../services/resources/resourceService';

export const AllSubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSem, setSelectedSem] = useState<number | 'all'>('all');
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubjects().then((data) => {
      setSubjects(data);
      setLoading(false);
    });
  }, []);

  const filtered = subjects.filter((s) => {
    if (selectedSem !== 'all' && s.semesterNumber !== selectedSem) return false;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-space-xl flex flex-col gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant pb-space-md gap-4">
        <div>
          <span className="font-caption text-caption text-secondary uppercase font-semibold">
            University Archive Catalog
          </span>
          <h1 className="text-headline-xl font-headline-xl text-primary mt-1">
            All Academic Subjects
          </h1>
          <p className="text-body-md text-secondary mt-1">
            Comprehensive directory of 48 curriculum courses indexed across all 8 undergraduate semesters.
          </p>
        </div>

        {/* Search & Semester Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter subject by code or title..."
            className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary w-64"
          />
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Semesters (1–8)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-secondary">
          <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2">progress_activity</span>
          <p>Loading course directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {filtered.map((s) => (
            <Link
              key={s.id}
              to={`/subjects/${s.id}`}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md hover:border-primary hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#EAF0EB] text-primary rounded">
                    {s.code}
                  </span>
                  <span className="text-caption text-secondary font-mono">
                    Year {s.yearNumber} · Sem {s.semesterNumber}
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-base text-on-surface group-hover:text-primary transition-colors">
                  {s.name}
                </h3>
                <p className="text-caption text-secondary mt-1">{s.department}</p>
                <p className="text-body-sm text-secondary mt-2 line-clamp-2">
                  {s.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-caption font-semibold text-primary">
                <span>{s.resourceCount || 34} Resources</span>
                <span className="flex items-center gap-1 group-hover:underline">
                  <span>View Materials</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};
