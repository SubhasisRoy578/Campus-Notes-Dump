import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AcademicYearNumber } from '../types';
import { YEAR_SEMESTER_MAP } from '../utils/academicLogic';

export const YearPage: React.FC = () => {
  const { yearId } = useParams<{ yearId: string }>();
  const yearNumber = (parseInt(yearId || '1') as AcademicYearNumber) || 1;
  const yearData = YEAR_SEMESTER_MAP[yearNumber] || YEAR_SEMESTER_MAP[1];

  return (
    <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-space-xl flex flex-col gap-space-lg">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-label-sm font-label-sm text-secondary">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span className="text-on-surface font-semibold">{yearData.name} Overview</span>
      </nav>

      {/* Header */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg">
        <span className="font-caption text-caption text-secondary uppercase font-semibold">
          {yearData.stage}
        </span>
        <h1 className="text-headline-xl font-headline-xl text-primary mt-1">
          {yearData.name} Academic Curriculum
        </h1>
        <p className="text-body-lg font-body-lg text-secondary mt-1 max-w-2xl">
          {yearData.subtitle}. Explore semester course sequences, laboratory logs, and faculty-moderated reference dossiers.
        </p>
      </section>

      {/* Semesters Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {yearData.semesters.map((sem) => (
          <div
            key={sem.number}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg flex flex-col justify-between hover:border-primary transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-headline-sm font-headline-sm text-primary">
                  {sem.name}
                </h2>
                <span className="text-caption font-caption bg-surface-container text-secondary px-2 py-0.5 rounded font-mono">
                  Semester {sem.number}
                </span>
              </div>
              <p className="text-body-sm text-secondary mb-4">
                Core subjects: {sem.subjectsSummary}
              </p>
            </div>
            <Link
              to={`/semesters/${sem.number}`}
              className="inline-flex items-center justify-between w-full p-2.5 bg-surface-container-low hover:bg-[#EAF0EB] text-primary rounded-lg text-label-md font-semibold transition-colors"
            >
              <span>Explore Semester {sem.number} Catalog</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
};
