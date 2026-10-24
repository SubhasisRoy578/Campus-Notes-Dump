import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isVerifiedTA: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchUserRole: (role: 'guest' | 'ta' | 'admin' | 'student') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRESET_USERS: Record<string, UserProfile> = {
  ta: {
    uid: 'uid-marcus',
    email: 'marcus.shaw@university.edu',
    displayName: 'Marcus S.',
    role: 'verified_ta',
    standing: 'Tier 1 Scholar',
    publishedCount: 18,
    downloadCount: 1420,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvjlvtnKC4RJGInFGHpWI7mxyv36eV6bq8elCtCGFAMSCQm6u4Ey3DRqvZZUErFdpvff3zJ-dpHhs9MA4ahUKJMd2TALt5tdC4uV18al4Ul5i-JAQHeLLIvoX1s9qL5BiV33Cay8Oo-1G2RbxO4Whe0H87BTfzT5JwZlNeV73E45eFfvmdUr3S77F9YZT_5LJtySwYGGoLSgnh2IvgU_SOgsTT2hrHxEdmIvsfSZ5iBNX3OenQ79D3',
    createdAt: '2024-01-15T00:00:00Z'
  },
  admin: {
    uid: 'uid-admin-allen',
    email: 'senate.lead@university.edu',
    displayName: 'Dr. Allen (Academic Senate)',
    role: 'faculty_admin',
    standing: 'Archival Board Lead',
    publishedCount: 45,
    downloadCount: 5200,
    createdAt: '2023-08-01T00:00:00Z'
  },
  student: {
    uid: 'uid-student-maya',
    email: 'maya.lin@student.edu',
    displayName: 'Maya Lin',
    role: 'student',
    standing: 'Contributing Scholar',
    publishedCount: 3,
    downloadCount: 180,
    createdAt: '2024-09-01T00:00:00Z'
  }
};

const STORAGE_AUTH_KEY = 'campusnotes_current_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_AUTH_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored user', e);
    }
    // Default: guest / signed out so home page is open-access public browsing!
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_AUTH_KEY);
    }
  }, [currentUser]);

  const signIn = async (email: string, _pass: string) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Please enter a valid academic email address.' };
      }

      // Check if matches preset
      if (email.toLowerCase().includes('marcus') || email.toLowerCase().includes('ta')) {
        setCurrentUser(PRESET_USERS.ta);
      } else if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('senate')) {
        setCurrentUser(PRESET_USERS.admin);
      } else {
        const customUser: UserProfile = {
          uid: `uid-${Date.now()}`,
          email,
          displayName: email.split('@')[0],
          role: 'student',
          standing: 'University Scholar',
          publishedCount: 0,
          downloadCount: 0,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(customUser);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication failed' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, _pass: string, displayName: string) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const newUser: UserProfile = {
        uid: `uid-${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
        role: 'student',
        standing: 'Contributing Scholar',
        publishedCount: 0,
        downloadCount: 0,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(newUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setCurrentUser(null);
  };

  const switchUserRole = (role: 'guest' | 'ta' | 'admin' | 'student') => {
    if (role === 'guest') {
      setCurrentUser(null);
    } else if (role === 'ta') {
      setCurrentUser(PRESET_USERS.ta);
    } else if (role === 'admin') {
      setCurrentUser(PRESET_USERS.admin);
    } else {
      setCurrentUser(PRESET_USERS.student);
    }
  };

  const isAdmin = currentUser?.role === 'faculty_admin';
  const isVerifiedTA = currentUser?.role === 'verified_ta' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAdmin,
        isVerifiedTA,
        signIn,
        signUp,
        signOut,
        switchUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
