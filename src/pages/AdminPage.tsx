import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AcademicResource, ResourceReport, ModerationLog } from '../types';
import {
  getPendingResources,
  getAllResourcesForAdmin,
  moderateResource,
  getReports,
  resolveReport,
  getModerationLogs
} from '../services/resources/resourceService';

export const AdminPage: React.FC = () => {
  const { currentUser, isAdmin, switchUserRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'catalog' | 'reports' | 'logs'>('pending');

  const [pendingItems, setPendingItems] = useState<AcademicResource[]>([]);
  const [catalogItems, setCatalogItems] = useState<AcademicResource[]>([]);
  const [reports, setReports] = useState<ResourceReport[]>([]);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal state
  const [rejectModalItem, setRejectModalItem] = useState<AcademicResource | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    const [p, c, r, l] = await Promise.all([
      getPendingResources(),
      getAllResourcesForAdmin(),
      getReports(),
      getModerationLogs()
    ]);
    setPendingItems(p);
    setCatalogItems(c);
    setReports(r);
    setLogs(l);
    setLoading(false);
  };

  const handleApprove = async (resourceId: string) => {
    if (!currentUser) return;
    await moderateResource(
      resourceId,
      'approve',
      currentUser.uid,
      currentUser.displayName,
      'Approved for live catalog publication.'
    );
    showToast('Resource approved and published to live catalog.');
    loadData();
  };

  const handleConfirmReject = async () => {
    if (!rejectModalItem || !currentUser) return;
    await moderateResource(
      rejectModalItem.id,
      'reject',
      currentUser.uid,
      currentUser.displayName,
      rejectReason.trim() || 'Submission failed departmental quality check.'
    );
    showToast('Resource rejected and returned with feedback.');
    setRejectModalItem(null);
    setRejectReason('');
    loadData();
  };

  const handleArchive = async (resourceId: string) => {
    if (!currentUser) return;
    await moderateResource(
      resourceId,
      'archive',
      currentUser.uid,
      currentUser.displayName,
      'Archived for departmental audit.'
    );
    showToast('Resource archived from public catalog.');
    loadData();
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    await resolveReport(reportId, status);
    showToast(`Report ${status}.`);
    loadData();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isAdmin) {
    return (
      <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-20 text-center">
        <div className="max-w-md mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <h2 className="text-headline-sm font-headline-sm text-primary">Faculty Moderator Restricted</h2>
          <p className="text-body-sm text-secondary mt-2 mb-6">
            The Academic Moderation Desk is reserved for verified Senate Board Members and Departmental Faculty Reviewers.
          </p>
          <div className="p-3 bg-surface-container-low rounded-lg mb-4 text-left text-caption text-secondary">
            <strong>Active Persona:</strong> {currentUser?.displayName || 'Signed Out'} ({currentUser?.role || 'Guest'})
          </div>
          <button
            onClick={() => switchUserRole('admin')}
            className="w-full py-2.5 bg-primary text-white rounded-lg text-label-md font-semibold hover:bg-primary-container transition-colors"
          >
            Switch to Dr. Allen (Senate Lead / Admin)
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-space-xl flex flex-col gap-space-lg">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-xl text-body-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary-fixed text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant pb-space-md gap-4">
        <div>
          <span className="font-caption text-caption text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold uppercase">
            Confidential Academic Moderation Workspace
          </span>
          <h1 className="text-headline-xl font-headline-xl text-primary mt-1">
            Faculty & Senate Moderation Desk
          </h1>
          <p className="text-body-md text-secondary mt-1">
            Review submitted student deposits, audit catalog integrity, resolve student reports, and enforce university standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-caption text-secondary font-mono">
            Node: CAMPUS-EAST-02
          </span>
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-3 font-label-md text-label-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'pending'
              ? 'text-primary font-semibold border-b-2 border-primary -mb-[1px]'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">pending_actions</span>
          <span>Pending Submissions ({pendingItems.length})</span>
          {pendingItems.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {pendingItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-3 font-label-md text-label-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'reports'
              ? 'text-primary font-semibold border-b-2 border-primary -mb-[1px]'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">report</span>
          <span>Reported Items ({reports.filter((r) => r.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-3 font-label-md text-label-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'text-primary font-semibold border-b-2 border-primary -mb-[1px]'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">library_books</span>
          <span>Master Catalog ({catalogItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-3 font-label-md text-label-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'text-primary font-semibold border-b-2 border-primary -mb-[1px]'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          <span>Audit Log ({logs.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-secondary">
          <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2">progress_activity</span>
          <p>Loading moderation data...</p>
        </div>
      ) : activeTab === 'pending' ? (
        /* PENDING REVIEW QUEUE */
        pendingItems.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-2">task_alt</span>
            <h3 className="font-headline-sm text-base text-primary">Review Queue Clear</h3>
            <p className="text-body-sm text-secondary mt-1">
              All submitted student documents have been moderated or fast-tracked.
            </p>
          </div>
        ) : (
          <div className="space-y-space-md">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-[#EAF0EB] text-primary rounded">
                      {item.courseCode}
                    </span>
                    <span className="text-caption font-caption text-secondary border border-outline-variant px-1.5 py-0.2 rounded">
                      Year {item.yearNumber} · Sem {item.semesterNumber}
                    </span>
                    <span className="bg-[#FEF3C7] text-amber-800 text-caption font-caption font-semibold px-2 py-0.5 rounded">
                      Awaiting Moderation
                    </span>
                  </div>

                  <h3 className="font-headline-sm text-headline-sm text-base text-on-surface font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-body-sm text-secondary line-clamp-2">
                    {item.abstract || 'No abstract provided by uploader.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-caption font-caption text-secondary">
                    <span>File: <strong className="font-mono text-on-surface">{item.fileFormat} ({item.fileSize})</strong></span>
                    <span>•</span>
                    <span>Uploader: <strong className="text-on-surface">{item.uploaderName}</strong> ({item.uploaderRole})</span>
                    <span>•</span>
                    <span>Submitted: {item.publishDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-3.5 py-2 bg-primary-container text-white rounded-lg text-label-sm font-semibold hover:bg-primary transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Approve & Publish</span>
                  </button>
                  <button
                    onClick={() => {
                      setRejectModalItem(item);
                      setRejectReason('');
                    }}
                    className="px-3.5 py-2 border border-red-300 text-error hover:bg-red-50 rounded-lg text-label-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    <span>Reject...</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'reports' ? (
        /* REPORTS QUEUE */
        reports.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-2">thumb_up</span>
            <h3 className="font-headline-sm text-base text-primary">No Reported Inaccuracies</h3>
            <p className="text-body-sm text-secondary mt-1">
              Zero active integrity or copyright reports pending action.
            </p>
          </div>
        ) : (
          <div className="space-y-space-md">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-caption font-semibold px-2 py-0.5 bg-red-100 text-red-800 rounded uppercase">
                      {rep.reason.replace('_', ' ')}
                    </span>
                    <span className="text-caption text-secondary font-mono">
                      Report #{rep.id} · {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                        rep.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-surface-container text-secondary'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <h4 className="font-semibold text-on-surface">
                    Reported Document: {rep.resourceTitle}
                  </h4>
                  <p className="text-body-sm text-secondary bg-surface-container-low p-2 rounded border border-outline-variant/60">
                    "{rep.description || 'No additional explanation provided.'}"
                  </p>
                  <p className="text-caption text-secondary">
                    Reporter: <span className="font-mono">{rep.reporterEmail || 'Anonymous'}</span>
                  </p>
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Link
                      to={`/resources/${rep.resourceId}`}
                      className="px-3 py-1.5 border border-outline-variant hover:bg-surface-container text-on-surface rounded-lg text-label-sm font-label-sm"
                    >
                      Inspect File
                    </Link>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'resolved')}
                      className="px-3 py-1.5 bg-primary-container text-white rounded-lg text-label-sm font-label-sm hover:bg-primary transition-colors"
                    >
                      Resolve & Update
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'dismissed')}
                      className="px-3 py-1.5 text-secondary hover:text-on-surface text-label-sm font-label-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'catalog' ? (
        /* MASTER CATALOG */
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant">
          {catalogItems.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-surface-bright transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded bg-[#EAF0EB] text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">
                    {item.fileFormat === 'PDF' ? 'picture_as_pdf' : 'description'}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#EAF0EB] text-primary rounded">
                      {item.courseCode}
                    </span>
                    <span className="font-semibold text-on-surface">{item.title}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                        item.status === 'published'
                          ? 'bg-[#EAF0EB] text-primary-container'
                          : item.status === 'pending_review'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-caption text-secondary">
                    <span>{item.fileSize}</span>
                    <span>•</span>
                    <span>{item.downloadCount} downloads</span>
                    <span>•</span>
                    <span>Contributor: {item.uploaderName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Link
                  to={`/resources/${item.id}`}
                  className="px-2.5 py-1 text-primary hover:bg-surface-container rounded text-label-sm font-label-sm"
                >
                  Preview
                </Link>
                {item.status === 'published' && (
                  <button
                    onClick={() => handleArchive(item.id)}
                    className="px-2.5 py-1 border border-outline-variant hover:border-amber-600 text-secondary hover:text-amber-800 rounded text-label-sm font-label-sm"
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* AUDIT LOG */
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant">
          {logs.map((log) => (
            <div key={log.id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-surface-container text-secondary rounded uppercase">
                    {log.action}
                  </span>
                  <span className="font-semibold text-on-surface text-body-sm">{log.resourceTitle}</span>
                </div>
                <p className="text-body-sm text-secondary mt-1">
                  Reason: {log.reason}
                </p>
                <div className="text-caption text-outline mt-1 font-mono">
                  Moderator: {log.moderatorName} ({log.moderatorUid}) • {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-1">
                verified
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Reason Modal Dialog */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="font-headline-sm text-headline-sm text-lg text-primary">
              Reject Resource Submission
            </h3>
            <p className="text-body-sm text-secondary">
              Provide constructive feedback for <strong className="text-on-surface">{rejectModalItem.title}</strong> so the scholar can correct and resubmit:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Scans below 300 DPI, missing proof steps for question 3, or unofficial solutions unmarked..."
              className="w-full p-2.5 border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant">
              <button
                onClick={() => setRejectModalItem(null)}
                className="px-3 py-1.5 border border-outline-variant text-secondary rounded-lg text-label-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-error text-white rounded-lg text-label-sm font-semibold hover:bg-red-800 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
