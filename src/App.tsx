import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SavedResourcesProvider } from './context/SavedResourcesContext';
import { TopNavBar } from './components/layout/TopNavBar';
import { Footer } from './components/layout/Footer';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';

// Pages
import { HomePage } from './pages/HomePage';
import { YearPage } from './pages/YearPage';
import { SemesterPage } from './pages/SemesterPage';
import { SubjectPage } from './pages/SubjectPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { SearchPage } from './pages/SearchPage';
import { RecentResourcesPage } from './pages/RecentResourcesPage';
import { AllSubjectsPage } from './pages/AllSubjectsPage';
import { UploadPage } from './pages/UploadPage';
import { MyUploadsPage } from './pages/MyUploadsPage';
import { AdminPage } from './pages/AdminPage';
import { SignInPage } from './pages/SignInPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HonorCodePage } from './pages/HonorCodePage';

export default function App() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <SavedResourcesProvider>
          <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased font-body-md selection:bg-secondary-container selection:text-primary">
            {/* Top Navigation */}
            <TopNavBar onOpenSearch={() => setIsSearchModalOpen(true)} />

            {/* Page Routes */}
            <div className="flex-1 flex flex-col">
              <Routes>
                {/* Public Browsing Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/years/:yearId" element={<YearPage />} />
                <Route path="/semesters/:semesterId" element={<SemesterPage />} />
                <Route path="/subjects/:subjectId" element={<SubjectPage />} />
                <Route path="/subjects" element={<AllSubjectsPage />} />
                <Route path="/resources/:resourceId" element={<ResourceDetailPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/recent" element={<RecentResourcesPage />} />

                {/* Authentication Routes */}
                <Route path="/auth/sign-in" element={<SignInPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

                {/* Protected & Scholar Routes */}
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/my-uploads" element={<MyUploadsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/report/:resourceId" element={<ResourceDetailPage />} />

                {/* Institutional & Honor Code Routes */}
                <Route path="/honor-code" element={<HonorCodePage />} />
                <Route path="/usage-guidelines" element={<HonorCodePage />} />
                <Route path="/report-policy" element={<HonorCodePage />} />
                <Route path="/directory" element={<HonorCodePage />} />
                <Route path="/contact" element={<HonorCodePage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            {/* Global Footer */}
            <Footer />

            {/* ⌘K Global Search Dialog */}
            <GlobalSearchModal
              isOpen={isSearchModalOpen}
              onClose={() => setIsSearchModalOpen(false)}
            />
          </div>
        </SavedResourcesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
