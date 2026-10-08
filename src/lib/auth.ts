/**
 * Authentication Foundation
 * Provides type contracts, session abstractions, and permission guards.
 */

export type UserRole = 'ARTIST' | 'PATRON' | 'ADMIN';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  activeCreatorHandle?: string;
  avatarUrl?: string;
}

export const DEMO_USERS: Record<string, UserSession> = {
  maya: {
    id: 'user_maya',
    name: 'Maya Lin',
    email: 'studio@mayalin.atelier',
    role: 'ARTIST',
    activeCreatorHandle: 'maya',
    avatarUrl: '/src/assets/images/atelier_artist_maya_1791384078475.jpg',
  },
  elena: {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena@rostovastudio.com',
    role: 'ARTIST',
    activeCreatorHandle: 'elena',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  kai: {
    id: 'user_kai',
    name: 'Kai Takahashi',
    email: 'kai@takahashitextiles.co',
    role: 'ARTIST',
    activeCreatorHandle: 'kai',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  visitor: {
    id: 'user_visitor',
    name: 'Julian Vance',
    email: 'julian@vancedesign.com',
    role: 'PATRON',
  },
};

/**
 * Permission guard to verify whether the session has edit authority over a given handle.
 */
export function canManageCreator(session: UserSession | null, handle: string): boolean {
  if (!session) return false;
  if (session.role === 'ADMIN') return true;
  return session.activeCreatorHandle?.toLowerCase() === handle.toLowerCase();
}
