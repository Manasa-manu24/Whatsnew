import { useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/lib/types';

export function useAuth() {
  const { setCurrentUser, setUserProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch or create user profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserProfile(userSnap.data() as User);
        } else {
          // Create new user profile
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
            createdAt: Timestamp.now(),
            lastSeen: Timestamp.now(),
            isOnline: true,
            settings: {
              privacyLastSeen: 'everyone',
              readReceipts: true,
              profilePhotoPrivacy: 'everyone',
            },
          };
          
          await setDoc(userRef, newUser);
          setUserProfile(newUser);
        }
        
        // Update online status
        await setDoc(userRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
        }, { merge: true });
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setCurrentUser, setUserProfile, setLoading]);

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile
    const userRef = doc(db, 'users', result.user.uid);
    const newUser: User = {
      uid: result.user.uid,
      email: email,
      name: name,
      createdAt: Timestamp.now(),
      lastSeen: Timestamp.now(),
      isOnline: true,
      settings: {
        privacyLastSeen: 'everyone',
        readReceipts: true,
        profilePhotoPrivacy: 'everyone',
      },
    };
    
    await setDoc(userRef, newUser);
    return result;
  };

  const logout = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      }, { merge: true });
    }
    return signOut(auth);
  };

  return { signIn, signUp, logout };
}
