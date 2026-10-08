import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, DEMO_USERS, canManageCreator } from '../lib/auth.js';
import { Creator } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: UserSession | null;
  activeCreator: Creator | null;
  allCreators: Creator[];
  isAuthenticated: boolean;
  switchPersona: (handle: string) => Promise<void>;
  signOut: () => void;
  canEditCurrentCreator: boolean;
  refreshCreator: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(DEMO_USERS.maya);
  const [activeCreator, setActiveCreator] = useState<Creator | null>(null);
  const [allCreators, setAllCreators] = useState<Creator[]>([]);

  const loadCreators = async () => {
    try {
      const creators = await api.getCreators();
      setAllCreators(creators);
      const current = creators.find(c => c.handle === (user?.activeCreatorHandle || 'maya')) || creators[0];
      setActiveCreator(current);
    } catch (err) {
      console.error('Failed to load creators in AuthContext:', err);
    }
  };

  useEffect(() => {
    loadCreators();
  }, []);

  const switchPersona = async (handle: string) => {
    const demoUser = DEMO_USERS[handle] || {
      id: `user_${handle}`,
      name: handle,
      email: `${handle}@atelier.app`,
      role: 'ARTIST' as const,
      activeCreatorHandle: handle,
    };
    setUser(demoUser);

    const targetCreator = allCreators.find(c => c.handle.toLowerCase() === handle.toLowerCase());
    if (targetCreator) {
      setActiveCreator(targetCreator);
    }
  };

  const signOut = () => {
    setUser(DEMO_USERS.visitor);
  };

  const refreshCreator = async () => {
    if (!activeCreator) return;
    try {
      const updated = await api.getCreator(activeCreator.handle);
      setActiveCreator(updated);
      const all = await api.getCreators();
      setAllCreators(all);
    } catch (err) {
      console.error(err);
    }
  };

  const canEditCurrentCreator = activeCreator ? canManageCreator(user, activeCreator.handle) : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        activeCreator,
        allCreators,
        isAuthenticated: Boolean(user && user.role === 'ARTIST'),
        switchPersona,
        signOut,
        canEditCurrentCreator,
        refreshCreator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
