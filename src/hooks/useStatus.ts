import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';

export interface StatusItem {
  id: string;
  userId: string;
  mediaUrl: string;
  publicId: string;
  thumbnailUrl: string;
  caption: string;
  visibility: 'everyone' | 'contacts' | 'close_contacts';
  createdAt: Timestamp;
  expiresAt: Timestamp;
  viewers: string[];
}

export interface UserStatus {
  userId: string;
  userName: string;
  userAvatar?: string;
  items: StatusItem[];
}

export function useStatus() {
  const [statuses, setStatuses] = useState<UserStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuthStore();

  useEffect(() => {
    if (!userProfile) {
      setStatuses([]);
      setLoading(false);
      return;
    }

    // For now, we'll just fetch the current user's status
    // In production, you'd fetch from contacts and aggregate by user
    const statusRef = collection(db, 'status', userProfile.uid, 'items');
    const now = Timestamp.now();
    
    const q = query(
      statusRef,
      where('expiresAt', '>', now),
      orderBy('expiresAt', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: StatusItem[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as StatusItem);
        });

        if (items.length > 0) {
          setStatuses([
            {
              userId: userProfile.uid,
              userName: userProfile.name,
              userAvatar: userProfile.avatarUrl,
              items,
            },
          ]);
        } else {
          setStatuses([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching status:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userProfile]);

  return { statuses, loading };
}
