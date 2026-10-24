import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const HonorCodePage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-space-xl flex flex-col gap-space-lg">
      <nav className="flex items-center gap-2 text-label-sm font-label-sm text-secondary">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span className="text-on-surface font-semibold">Institutional Policies</span>
      </nav>

      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg md:p-space-xl max-w-4xl space-y-space-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-container rounded-lg border border-outline-variant mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-container"></span>
            <span className="font-caption text-caption text-secondary uppercase font-semibold">
              Archival Standards & Institutional Governance
            </span>
          </div>
          <h1 className="text-headline-xl font-headline-xl text-primary">
            {path === '/usage-guidelines'
              ? 'Repository Usage Guidelines'
              : path === '/report-policy'
              ? 'Content Moderation & Report Policy'
              : path === '/directory'
              ? 'Institutional Directory & Departmental Chairs'
              : path === '/contact'
              ? 'Contact Archiving Staff & Senate Board'
              : 'Campus Honor Code & Archival Permanence'}
          </h1>
          <p className="text-body-lg text-secondary mt-1">
            Governing the open-access preservation, verification, and scholarly distribution of university coursework.
          </p>
        </div>

        <div className="space-y-6 text-body-md text-on-surface leading-relaxed border-t border-outline-variant pt-6">
          <section className="space-y-2">
            <h2 className="font-headline-sm text-headline-sm text-primary text-lg">
              1. Institutional Open Access Principle
            </h2>
            <p className="text-secondary">
              CampusNotes exists to ensure equitable access to foundational higher-education materials. Reading and downloading published lecture summaries, past question papers, and laboratory checklists is completely public and permanently free of financial or sign-up barriers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline-sm text-headline-sm text-primary text-lg">
              2. Permanence of Published Records
            </h2>
            <p className="text-secondary">
              Once an academic resource is reviewed, verified, and published to the live repository catalog, it becomes part of the permanent university archive. To safeguard academic integrity and citation stability, published materials cannot be modified, overwritten, or deleted by student accounts. Revisions or errata may be submitted as new distinct editions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline-sm text-headline-sm text-primary text-lg">
              3. Prohibition on Unauthorized Examination Leaks
            </h2>
            <p className="text-secondary">
              Contributors are strictly forbidden from uploading ongoing, unreleased, or proprietary proctored examination questions before the examinations board releases them to the departmental archives. Violators face immediate referral to the Academic Senate.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline-sm text-headline-sm text-primary text-lg">
              4. Departmental Contacts & Archival Staff
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                <strong className="text-on-surface block font-semibold">Academic Senate Archive Board</strong>
                <span className="text-caption text-secondary">Dr. Allen (Archival Chair)</span>
                <p className="font-mono text-xs text-primary mt-1">senate.archive@university.edu</p>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                <strong className="text-on-surface block font-semibold">Student Academic Council (SAC)</strong>
                <span className="text-caption text-secondary">Teaching Assistant Lead (Marcus S.)</span>
                <p className="font-mono text-xs text-primary mt-1">sac.moderation@university.edu</p>
              </div>
            </div>
          </section>
        </div>

        <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
          <Link to="/" className="text-primary font-semibold hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Return to Repository Homepage</span>
          </Link>
          <Link
            to="/upload"
            className="px-4 py-2 bg-primary-container text-white rounded-lg text-label-md font-medium hover:bg-primary transition-colors"
          >
            Contribute Notes
          </Link>
        </div>
      </section>
    </main>
  );
};
