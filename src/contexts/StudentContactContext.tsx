import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ActiveContact {
  id: string;
  student_name: string;
  mobile: string;
  email: string;
  educational_qualification?: string;
  graduated_year?: number;
  ielts_score?: number;
  work_experience?: number;
  preferred_countries?: string[];
  preferred_domains?: string[];
}

interface StudentContactContextType {
  activeContact: ActiveContact | null;
  setActiveContact: (contact: ActiveContact | null) => void;
  clearContact: () => void;
}

const StudentContactContext = createContext<StudentContactContextType | undefined>(undefined);

export function StudentContactProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeContact, setActiveContact] = useState<ActiveContact | null>(null);

  // Clear on logout
  useEffect(() => {
    if (!user) setActiveContact(null);
  }, [user]);

  return (
    <StudentContactContext.Provider value={{ activeContact, setActiveContact, clearContact: () => setActiveContact(null) }}>
      {children}
    </StudentContactContext.Provider>
  );
}

export function useStudentContact() {
  const ctx = useContext(StudentContactContext);
  if (!ctx) throw new Error('useStudentContact must be used within StudentContactProvider');
  return ctx;
}
