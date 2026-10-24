import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SemesterNumber, Subject } from '../types';
import { getYearForSemester } from '../utils/academicLogic';
import { getSubjects } from '../services/resources/resourceService';

export const SemesterPage: React.FC = () => {
  const { semesterId } = useParams<{ semesterId: string }>();
  const semesterNumber = (parseInt(semesterId || '3') as SemesterNumber) || 3;
  const yearNumber = getYearForSemester(semesterNumber);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, [semesterNumber]);

  const loadSubjects = async () => {
    setLoading(true);
    const subs = await getSubjects({ semesterNumber });
    setSubjects(subs);
    setLoading(false);
  };

  return (
    <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-space-xl flex flex-col gap-space-lg">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-label-sm font-label-sm text-secondary">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/years/${yearNumber}`} className="hover:text-primary transition-colors">
          Year {yearNumber}
        </Link>
        <span>/</span>
        <span className="text-on-surface font-semibold">Semester {semesterNumber}</span>
      </nav>

      {/* Header */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="font-caption text-caption text-secondary uppercase font-semibold">
            Year {yearNumber} · Undergraduate Progression
          </span>
          <h1 className="text-headline-xl font-headline-xl text-primary mt-1">
            Semester {semesterNumber} Course Catalog
          </h1>
          <p className="text-body-md font-body-md text-secondary mt-1">
            Official curriculum modules, lecture handbooks, and past exams for Semester {semesterNumber}.
          </p>
        </div>
        <Link
          to={`/search?q=Semester+${semesterNumber}`}
          className="px-4 py-2 border border-outline-variant hover:border-primary text-primary rounded-lg text-label-md font-semibold transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          <span>Search All Sem {semesterNumber} Files</span>
        </Link>
      </section>

      {/* Subjects Grid */}
      <section className="space-y-space-md">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Enrolled Academic Subjects ({subjects.length})
          </h2>
          <span className="text-caption font-caption text-secondary font-mono">
            Verified Syllabus Records
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-secondary">
            <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2">progress_activity</span>
            <p>Loading course modules...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between hover:border-primary-container transition-all hover:shadow-[0_4px_12px_rgba(32,37,34,0.03)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-[#EAF0EB] text-primary rounded">
                      {sub.code}
                    </span>
                    <span className="text-caption font-caption text-secondary">
                      {sub.credits} Credits
                    </span>
                  </div>

                  <h3 className="font-headline-sm text-headline-sm text-base text-on-surface hover:text-primary transition-colors">
                    <Link to={`/subjects/${sub.id}`}>
                      {sub.name}
                    </Link>
                  </h3>
                  <p className="text-caption font-caption text-secondary mt-0.5">
                    {sub.department}
                  </p>

                  <p className="text-body-sm text-secondary mt-2 line-clamp-2">
                    {sub.description}
                  </p>

                  {/* Units pill tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {sub.units.slice(0, 3).map((u) => (
                      <span
                        key={u.unitNumber}
                        className="text-[10px] px-1.5 py-0.5 bg-surface-container rounded text-secondary truncate max-w-[200px]"
                        title={u.title}
                      >
                        U{u.unitNumber}: {u.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                  <span className="text-caption font-caption text-primary font-semibold">
                    {sub.resourceCount || 34} Resources
                  </span>
                  <Link
                    to={`/subjects/${sub.id}`}
                    className="text-label-sm font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Open Subject Desk</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
