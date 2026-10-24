import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSavedResources } from '../../context/SavedResourcesContext';

interface TopNavBarProps {
  onOpenSearch?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ onOpenSearch }) => {
  const { currentUser, signOut, switchUserRole, isAdmin } = useAuth();
  const { saveCount } = useSavedResources();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onOpenSearch) {
          onOpenSearch();
        } else {
          navigate('/search');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch, navigate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="w-full border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-40">
      <div className="max-w-[1320px] mx-auto px-gutter md:px-margin h-16 flex items-center justify-between gap-space-md">
        {/* Brand & Search Bar on Left */}
        <div className="flex items-center gap-space-lg flex-1">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-space-xs text-headline-md font-headline-md font-semibold text-primary tracking-tight"
          >
            <span className="material-symbols-outlined text-primary text-[24px]">menu_book</span>
            <span>CampusNotes</span>
          </Link>

          {/* Global Search Field with Cmd+K */}
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => onOpenSearch && onOpenSearch()}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-14 py-2 font-body-sm text-body-sm placeholder:text-secondary focus:outline-none focus:border-primary-container transition-colors duration-150"
              placeholder="Search notes, subjects, exam papers (e.g., CS201, AVL)..."
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 font-label-sm text-caption bg-surface-container text-secondary border border-outline-variant rounded">
                ⌘K
              </kbd>
            </div>
          </form>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-space-lg font-label-md text-label-md">
          <Link
            to="/"
            className={`pb-1 transition-colors duration-150 ${
              isActive('/')
                ? 'text-primary font-semibold border-b-2 border-primary'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Browse Resources
          </Link>
          <Link
            to="/subjects"
            className={`pb-1 transition-colors duration-150 ${
              isActive('/subjects')
                ? 'text-primary font-semibold border-b-2 border-primary'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            All Subjects
          </Link>
          <Link
            to="/recent"
            className={`pb-1 transition-colors duration-150 ${
              isActive('/recent')
                ? 'text-primary font-semibold border-b-2 border-primary'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Recently Added
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`pb-1 transition-colors duration-150 flex items-center gap-1 ${
                isActive('/admin')
                  ? 'text-primary font-semibold border-b-2 border-primary'
                  : 'text-amber-800 hover:text-amber-900'
              }`}
            >
              <span>Admin Desk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            </Link>
          )}
        </nav>

        <div className="h-4 w-[1px] bg-outline-variant hidden md:block"></div>

        {/* Trailing Actions */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          {/* Mobile search trigger */}
          <button
            onClick={() => (onOpenSearch ? onOpenSearch() : navigate('/search'))}
            className="lg:hidden text-secondary hover:text-on-surface p-1.5 rounded transition-colors"
            title="Search catalog"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Stacks / Saved bookmarks */}
          <Link
            to="/my-uploads?tab=stacks"
            className="relative text-secondary hover:text-primary transition-colors p-1"
            title="Saved Stacks"
          >
            <span className="material-symbols-outlined text-[20px]">bookmark</span>
            {saveCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                {saveCount}
              </span>
            )}
          </Link>

          {/* Upload Resource Primary Button */}
          <Link
            to="/upload"
            className="bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors duration-150 shadow-none font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span className="hidden sm:inline">Upload Resource</span>
          </Link>

          {/* Authentication State */}
          {!currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/sign-in"
                className="font-label-md text-label-md text-secondary hover:text-on-surface transition-colors duration-150 hidden sm:inline-block"
              >
                Sign In
              </Link>
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="text-secondary hover:text-on-surface transition-colors p-1 rounded"
                  title="Demo Account Switcher"
                >
                  <span className="material-symbols-outlined text-[22px]">account_circle</span>
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg p-2 z-50 text-body-sm">
                    <div className="px-2 py-1 text-caption font-semibold text-secondary uppercase tracking-wider border-b border-outline-variant">
                      Quick Role Switcher
                    </div>
                    <button
                      onClick={() => {
                        switchUserRole('ta');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-surface-container-low rounded text-on-surface flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                      <span>Marcus S. (Verified TA)</span>
                    </button>
                    <button
                      onClick={() => {
                        switchUserRole('admin');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-surface-container-low rounded text-on-surface flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px] text-amber-700">shield_person</span>
                      <span>Dr. Allen (Admin)</span>
                    </button>
                    <button
                      onClick={() => {
                        switchUserRole('student');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-surface-container-low rounded text-on-surface flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px] text-secondary">school</span>
                      <span>Maya Lin (Student)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 text-left p-1 rounded hover:bg-surface-container-low transition-colors"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.displayName}
                    className="w-8 h-8 rounded-full object-cover border border-outline-variant"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col">
                  <span className="text-label-sm font-semibold text-on-surface leading-tight">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[11px] text-secondary font-caption leading-tight">
                    {currentUser.role === 'verified_ta'
                      ? 'Teaching Assistant (CS)'
                      : currentUser.role === 'faculty_admin'
                      ? 'Faculty Admin'
                      : 'University Scholar'}
                  </span>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-2 z-50 text-body-sm divide-y divide-outline-variant/60">
                  <div className="p-2">
                    <p className="font-semibold text-primary">{currentUser.displayName}</p>
                    <p className="text-caption text-secondary font-mono">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#EAF0EB] text-primary text-[10px] font-semibold rounded uppercase">
                      {currentUser.standing || 'Tier 1 Scholar'}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/my-uploads"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full text-left px-2 py-1.5 hover:bg-surface-container-low rounded text-on-surface flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                      <span>My Uploads & Contributions</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full text-left px-2 py-1.5 hover:bg-surface-container-low rounded text-on-surface flex items-center gap-2 text-amber-800"
                      >
                        <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                        <span>Moderator Workspace</span>
                      </Link>
                    )}
                  </div>
                  <div className="py-1">
                    <div className="px-2 py-1 text-[11px] text-secondary font-semibold uppercase">
                      Switch Active Persona
                    </div>
                    <button
                      onClick={() => {
                        switchUserRole('ta');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 hover:bg-surface-container-low rounded text-xs flex items-center gap-1.5 text-secondary"
                    >
                      <span>• Marcus (TA)</span>
                    </button>
                    <button
                      onClick={() => {
                        switchUserRole('admin');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 hover:bg-surface-container-low rounded text-xs flex items-center gap-1.5 text-secondary"
                    >
                      <span>• Dr. Allen (Admin)</span>
                    </button>
                    <button
                      onClick={() => {
                        switchUserRole('guest');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 hover:bg-surface-container-low rounded text-xs flex items-center gap-1.5 text-secondary"
                    >
                      <span>• Guest (Signed Out)</span>
                    </button>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        signOut();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-red-50 text-error rounded flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
