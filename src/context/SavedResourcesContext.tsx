import React, { createContext, useContext, useState, useEffect } from 'react';

interface SavedResourcesContextType {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
  saveCount: number;
}

const SavedResourcesContext = createContext<SavedResourcesContextType | undefined>(undefined);

const STORAGE_SAVED_KEY = 'campusnotes_saved_stacks_v1';

export const SavedResourcesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_KEY);
      return stored ? JSON.parse(stored) : ['cs201-avl-trees'];
    } catch {
      return ['cs201-avl-trees'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedIds));
    } catch (e) {
      console.warn('Failed to save stacks', e);
    }
  }, [savedIds]);

  const isSaved = (id: string) => savedIds.includes(id);

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <SavedResourcesContext.Provider
      value={{
        savedIds,
        isSaved,
        toggleSave,
        saveCount: savedIds.length
      }}
    >
      {children}
    </SavedResourcesContext.Provider>
  );
};

export function useSavedResources() {
  const context = useContext(SavedResourcesContext);
  if (!context) {
    throw new Error('useSavedResources must be used within a SavedResourcesProvider');
  }
  return context;
}
