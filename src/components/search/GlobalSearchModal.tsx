import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicResource } from '../../types';
import { getPublishedResources } from '../../services/resources/resourceService';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AcademicResource[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const matched = await getPublishedResources({ query: query.trim() });
      setResults(matched.slice(0, 6));
      setLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (resourceId: string) => {
    onClose();
    navigate(`/resources/${resourceId}`);
  };

  const handleViewAll = () => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-outline-variant flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-2xl">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleViewAll();
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Search academic repository (e.g. CS201, AVL Trees, Signals)..."
            className="w-full text-body-md font-body-md text-on-surface bg-transparent focus:outline-none placeholder:text-secondary"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono bg-surface-container text-secondary rounded border border-outline-variant">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-1 rounded"
            title="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Quick query suggestion chips */}
        <div className="px-4 py-2 bg-surface-container-low border-b border-outline-variant flex items-center gap-2 overflow-x-auto text-caption font-caption text-secondary">
          <span className="shrink-0">Suggestions:</span>
          {['CS201 Data Structures', 'AVL Trees', 'Signals & Systems', 'Lab Manuals', 'Past Papers'].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary hover:text-primary transition-colors shrink-0"
              >
                {tag}
              </button>
            )
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-outline-variant/60 custom-scroll">
          {loading ? (
            <div className="p-8 text-center text-secondary text-body-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              <span>Searching repository records...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((res) => (
              <div
                key={res.id}
                onClick={() => handleSelect(res.id)}
                className="p-3 hover:bg-surface-container-low rounded-lg cursor-pointer transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded bg-[#EAF0EB] text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">
                      {res.fileFormat === 'PDF' ? 'picture_as_pdf' : 'description'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-mono px-1.5 py-0.2 bg-[#EAF0EB] text-primary font-semibold rounded">
                        {res.courseCode}
                      </span>
                      <span className="text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                        {res.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-caption text-secondary">
                      <span>{res.fileSize}</span>
                      <span>•</span>
                      <span>{res.categoryLabel}</span>
                      <span>•</span>
                      <span>{res.uploaderName}</span>
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-secondary group-hover:text-primary text-[18px] shrink-0 mt-2">
                  arrow_forward
                </span>
              </div>
            ))
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <p className="text-body-sm text-secondary">No catalog records matched "{query}".</p>
              <button
                onClick={handleViewAll}
                className="mt-2 text-label-sm font-semibold text-primary hover:underline"
              >
                Open Advanced Search & Filters →
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-secondary text-body-sm">
              Type keywords, course code (e.g. CS201), topic, or instructor name...
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="p-3 bg-surface-container-low border-t border-outline-variant flex items-center justify-between text-caption font-caption text-secondary">
            <span>Showing top {results.length} results</span>
            <button
              onClick={handleViewAll}
              className="font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View all matching results</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
