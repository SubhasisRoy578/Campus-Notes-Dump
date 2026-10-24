import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-outline-variant bg-surface-container-low mt-auto">
      <div className="max-w-[1320px] mx-auto px-gutter md:px-margin py-space-xl flex flex-col md:flex-row justify-between items-center gap-space-md">
        {/* Brand & Copyright Text verbatim from specification */}
        <div className="flex flex-col sm:flex-row items-center gap-space-sm md:gap-space-md text-center md:text-left">
          <Link to="/" className="text-headline-sm font-headline-sm font-semibold text-primary">
            CampusNotes
          </Link>
          <span className="hidden sm:inline text-outline-variant">|</span>
          <p className="text-body-sm font-body-sm text-secondary">
            © 2025 CampusNotes Academic Repository. All rights reserved.
          </p>
        </div>

        {/* Links adhering strictly to JSON anchor and labels */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-label-sm font-label-sm text-secondary">
          <Link to="/honor-code" className="hover:text-primary underline transition-colors duration-150">
            Honor Code
          </Link>
          <Link to="/usage-guidelines" className="hover:text-primary underline transition-colors duration-150">
            Usage Guidelines
          </Link>
          <Link to="/report-policy" className="hover:text-primary underline transition-colors duration-150">
            Report Policy
          </Link>
          <Link to="/directory" className="hover:text-primary underline transition-colors duration-150">
            Institutional Directory
          </Link>
          <Link to="/contact" className="hover:text-primary underline transition-colors duration-150">
            Contact Archiving Staff
          </Link>
        </nav>
      </div>
    </footer>
  );
};
