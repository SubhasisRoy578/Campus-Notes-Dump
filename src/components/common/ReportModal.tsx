import React, { useState } from 'react';
import { AcademicResource, ResourceReport } from '../../types';
import { submitReport } from '../../services/resources/resourceService';
import { useAuth } from '../../context/AuthContext';

interface ReportModalProps {
  resource: AcademicResource;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ resource, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState<ResourceReport['reason']>('incorrect_subject');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await submitReport({
      resourceId: resource.id,
      resourceTitle: resource.title,
      reason,
      description: description.trim(),
      reporterUid: currentUser?.uid,
      reporterEmail: currentUser?.email || 'anonymous.scholar@university.edu'
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl p-space-md md:p-space-lg flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2 text-error">
            <span className="material-symbols-outlined text-[22px]">flag</span>
            <h3 className="font-headline-sm text-headline-sm text-lg font-semibold text-on-surface">
              Report Inaccuracy or Violation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-1 rounded"
            title="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF0EB] text-primary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <h4 className="font-headline-sm text-base font-semibold text-primary">
              Report Submitted for Academic Review
            </h4>
            <p className="text-body-sm text-secondary max-w-md mx-auto">
              Thank you for upholding repository integrity. The Academic Senate and Department Moderators have been notified.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-primary-container text-white rounded-lg text-label-md font-label-md hover:bg-primary transition-colors"
            >
              Return to Document
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-surface-container-low rounded-lg text-caption font-caption text-secondary border border-outline-variant/60">
              Reporting: <strong className="text-on-surface">{resource.title}</strong>
              <div className="font-mono text-outline mt-0.5">ID: {resource.id}</div>
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-2">
                Primary Issue Category <span className="text-error">*</span>
              </label>
              <div className="space-y-2 text-body-sm">
                {[
                  { id: 'incorrect_subject', label: 'Incorrect Course, Unit, or Metadata' },
                  { id: 'corrupted_file', label: 'Corrupted, Unreadable, or Low-Resolution File' },
                  { id: 'copyright_concern', label: 'Copyright or Distribution Rights Concern' },
                  { id: 'inappropriate_content', label: 'Contains Unauthorized Exam Leaks or Inappropriate Content' },
                  { id: 'duplicate_resource', label: 'Duplicate Entry of an Existing Resource' },
                  { id: 'other', label: 'Other Scholarly Concern' }
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-surface-container-low cursor-pointer border border-transparent hover:border-outline-variant/60 transition-colors"
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      checked={reason === item.id}
                      onChange={() => setReason(item.id as any)}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-on-surface text-body-sm">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Specific Details & Citations (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention specific page numbers, errors in proofs, or duplicate links..."
                rows={3}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors resize-y"
              />
            </div>

            <div className="pt-2 border-t border-outline-variant flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-outline-variant text-secondary hover:text-on-surface rounded-lg text-label-sm font-label-sm hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-error text-white rounded-lg text-label-sm font-label-sm font-semibold hover:bg-red-800 transition-colors flex items-center gap-1.5"
              >
                {submitting && (
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                )}
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
