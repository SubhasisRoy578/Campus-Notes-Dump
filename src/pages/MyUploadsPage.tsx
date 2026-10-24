import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSavedResources } from '../context/SavedResourcesContext';
import { AcademicResource } from '../types';
import { getUserUploads, getResourceById } from '../services/resources/resourceService';

export const MyUploadsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { savedIds, toggleSave } = useSavedResources();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'stacks' ? 'stacks' : 'uploads';

  const [uploads, setUploads] = useState<AcademicResource[]>([]);
  const [savedResources, setSavedResources] = useState<AcademicResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser, savedIds]);

  const loadUserData = async () => {
    if (!currentUser) return;
    setLoading(true);
    const userItems = await getUserUploads(currentUser.uid);
    setUploads(userItems);

    const savedItems: AcademicResource[] = [];
    for (const id of savedIds) {
      const res = await getResourceById(id);
      if (res) savedItems.push(res);
    }
    setSavedResources(savedItems);
    setLoading(false);
  };

  if (!currentUser) {
    return (
      <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-20 text-center">
        <span className="material-symbols-outlined text-4xl text-secondary mb-3">lock</span>
        <h2 className="font-headline-md text-primary text-xl">Sign In Required</h2>
        <p className="text-secondary text-body-md mt-2 max-w-md mx-auto">
          Please sign in to access your personal contribution ledger and saved stacks.
        </p>
        <Link
          to="/auth/sign-in"
          state={{ from: '/my-uploads' }}
          className="mt-4 inline-block px-4 py-2 bg-primary-container text-white rounded-lg text-label-md font-medium"
        >
          Sign In
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-space-xl flex flex-col gap-space-lg">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant pb-space-md gap-4">
        <div>
          <span className="font-caption text-caption text-secondary uppercase font-semibold">
            Scholar Workspace
          </span>
          <h1 className="text-headline-xl font-headline-xl text-primary mt-1">
            My Academic Contributions & Stacks
          </h1>
          <p className="text-body-md text-secondary mt-1">
            Archival records submitted by <strong className="text-on-surface">{currentUser.displayName}</strong> ({currentUser.standing || 'University Scholar'}).
          </p>
        </div>

        <Link
          to="/upload"
          className="px-4 py-2 bg-primary-container hover:bg-primary text-white rounded-lg text-label-md font-medium flex items-center gap-1.5 transition-colors self-start md:self-end"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Submit New Resource</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant">
        <button
          onClick={() => setSearchParams({ tab: 'uploads' })}
          className={`pb-3 px-2 font-label-md text-label-md transition-colors flex items-center gap-1.5 ${
            activeTab === 'uploads'
              ? 'text-primary font-semibold border-b-2 border-primary -mb-[1px]'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
          <span>My Submissions ({uploads.length})</span>
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'stacks' })}
          className={`pb-3 px-2 font-label-md text-label-md transition-colors flex items-center gap-1.5 ${
            activeTab === 'stacks'
              ? 'text-primary font-semibold border-b-2 border-primary -mb-[1px]'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">bookmark</span>
          <span>Saved to Stacks ({savedResources.length})</span>
        </button>
      </div>

      {/* Institutional Permanence Notice */}
      {activeTab === 'uploads' && (
        <div className="p-3.5 bg-surface-container-low border border-outline-variant rounded-lg flex items-start gap-3 text-caption font-caption text-secondary">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">policy</span>
          <div>
            <strong className="text-on-surface block font-semibold mb-0.5">
              Institutional Permanence Policy
            </strong>
            Once approved and published, academic resources become part of the university open-access archive and cannot be edited or deleted by student accounts. If you wish to submit an errata or improved edition, use the "Submit Revision / New Edition" action.
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-secondary">
          <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2">progress_activity</span>
          <p>Loading records...</p>
        </div>
      ) : activeTab === 'uploads' ? (
        uploads.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-secondary mb-2">upload_file</span>
            <h3 className="font-headline-sm text-base text-primary">No submissions yet</h3>
            <p className="text-body-sm text-secondary mt-1 max-w-md mx-auto">
              You haven't deposited any course documents yet. Share your verified lecture notes or solved past papers.
            </p>
            <Link
              to="/upload"
              className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-primary-container text-white rounded-lg text-label-md font-medium"
            >
              <span>Submit First Resource</span>
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant">
            {uploads.map((item) => (
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
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#EAF0EB] text-primary rounded">
                        {item.courseCode}
                      </span>
                      <span className="font-semibold text-on-surface line-clamp-1">{item.title}</span>
                      {/* Status Badge */}
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                          item.status === 'published'
                            ? 'bg-[#EAF0EB] text-primary-container border border-outline-variant/60'
                            : item.status === 'pending_review'
                            ? 'bg-[#FEF3C7] text-amber-800 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {item.status === 'published'
                          ? 'Published'
                          : item.status === 'pending_review'
                          ? 'Pending Review'
                          : 'Rejected'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-caption text-secondary">
                      <span>Year {item.yearNumber} · Sem {item.semesterNumber}</span>
                      <span>•</span>
                      <span>{item.categoryLabel}</span>
                      <span>•</span>
                      <span className="font-mono">{item.fileSize}</span>
                      <span>•</span>
                      <span>Submitted on {item.publishDate}</span>
                    </div>

                    {item.moderationReason && item.status === 'rejected' && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-caption text-red-800">
                        <strong>Rejection Reason:</strong> {item.moderationReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {item.status === 'published' ? (
                    <Link
                      to={`/resources/${item.id}`}
                      className="px-3 py-1.5 bg-primary-container text-white rounded-lg text-label-sm font-label-sm flex items-center gap-1 font-medium hover:bg-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>View in Catalog</span>
                    </Link>
                  ) : (
                    <span className="text-caption text-secondary font-mono italic">
                      Under moderation queue
                    </span>
                  )}
                  <Link
                    to="/upload"
                    className="px-3 py-1.5 border border-outline-variant text-on-surface hover:bg-surface-container rounded-lg text-label-sm font-label-sm transition-colors"
                    title="Submit a revision or update"
                  >
                    Submit Revision
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Saved Stacks */
        savedResources.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-secondary mb-2">bookmark_border</span>
            <h3 className="font-headline-sm text-base text-primary">No resources saved to your Stacks</h3>
            <p className="text-body-sm text-secondary mt-1">
              Click "Save to Stacks" on any document to bookmark key study materials here.
            </p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant">
            {savedResources.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-surface-bright transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded bg-[#EAF0EB] text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">bookmark</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#EAF0EB] text-primary rounded">
                        {item.courseCode}
                      </span>
                      <Link
                        to={`/resources/${item.id}`}
                        className="font-semibold text-on-surface hover:text-primary hover:underline line-clamp-1"
                      >
                        {item.title}
                      </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-caption text-secondary">
                      <span>{item.categoryLabel}</span>
                      <span>•</span>
                      <span className="font-mono">{item.fileSize}</span>
                      <span>•</span>
                      <span>{item.downloadCount} downloads</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Link
                    to={`/resources/${item.id}`}
                    className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container rounded-lg text-label-sm font-label-sm flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>View</span>
                  </Link>
                  <button
                    onClick={() => toggleSave(item.id)}
                    className="px-3 py-1.5 text-secondary hover:text-error text-label-sm font-label-sm flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </main>
  );
};
