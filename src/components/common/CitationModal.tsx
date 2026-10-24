import React, { useState } from 'react';
import { AcademicResource } from '../../types';
import { generateCitations } from '../../utils/academicLogic';

interface CitationModalProps {
  resource: AcademicResource;
  isOpen: boolean;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ resource, isOpen, onClose }) => {
  const [format, setFormat] = useState<'apa' | 'mla' | 'chicago' | 'bibtex'>('apa');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const citations = generateCitations(resource);
  const currentText = citations[format];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl p-space-md md:p-space-lg flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[22px]">format_quote</span>
            <h3 className="font-headline-sm text-headline-sm text-lg font-semibold text-on-surface">
              Cite Academic Record
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

        <p className="text-body-sm text-secondary">
          Export citation for <span className="font-semibold text-on-surface">{resource.title}</span> in accordance with academic standards.
        </p>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-lg border border-outline-variant text-label-sm font-label-sm">
          {(['apa', 'mla', 'chicago', 'bibtex'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => {
                setFormat(fmt);
                setCopied(false);
              }}
              className={`flex-1 py-1 px-3 rounded uppercase font-semibold text-xs transition-colors ${
                format === fmt
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Citation Box */}
        <div className="relative p-3.5 bg-surface-container-low border border-outline-variant rounded-lg font-mono text-xs leading-relaxed text-on-surface whitespace-pre-wrap break-words min-h-[90px]">
          {currentText}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
          <span className="text-caption text-secondary">
            DOI: {resource.docRef || 'ARCH-2024-9982'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-outline-variant rounded-lg text-label-sm font-label-sm text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              Done
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 bg-primary-container hover:bg-primary text-white rounded-lg text-label-sm font-label-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied!' : 'Copy Citation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
