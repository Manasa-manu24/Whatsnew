import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/lib/types';

interface AuthState {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  setCurrentUser: (user: FirebaseUser | null) => void;
  setUserProfile: (profile: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  userProfile: null,
  loading: true,
  setCurrentUser: (user) => set({ currentUser: user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setLoading: (loading) => set({ loading }),
}));
