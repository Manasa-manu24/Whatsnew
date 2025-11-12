import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/lib/types';

/**
 * Get or create a chat with a specific user
 * @param currentUserId - The current user's ID
 * @param otherUserId - The other user's ID
 * @returns The chat ID
 */
export async function getOrCreateChat(currentUserId: string, otherUserId: string): Promise<string> {
  if (currentUserId === otherUserId) {
    throw new Error('Cannot chat with yourself');
  }

  // Check if chat already exists
  const chatsRef = collection(db, 'chats');
  const existingChatsQuery = query(
    chatsRef,
    where('members', 'array-contains', currentUserId)
  );
  const existingChats = await getDocs(existingChatsQuery);
  
  // Find existing 1:1 chat with this user
  let existingChatId: string | null = null;
  existingChats.forEach((doc) => {
    const chatData = doc.data();
    if (
      !chatData.isGroup &&
      chatData.members.includes(otherUserId)
    ) {
      existingChatId = doc.id;
    }
  });

  if (existingChatId) {
    return existingChatId;
  }

  // Create new chat
  const newChatDoc = await addDoc(chatsRef, {
    isGroup: false,
    members: [currentUserId, otherUserId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newChatDoc.id;
}

/**
 * Get user profile by ID
 * @param userId - The user's ID
 * @returns The user profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Get multiple user profiles by IDs
 * @param userIds - Array of user IDs
 * @returns Map of userId to User profile
 */
export async function getUserProfiles(userIds: string[]): Promise<Map<string, User>> {
  const userMap = new Map<string, User>();
  
  if (userIds.length === 0) return userMap;

  const promises = userIds.map(async (userId) => {
    const user = await getUserProfile(userId);
    if (user) {
      userMap.set(userId, user);
    }
  });

  await Promise.all(promises);
  return userMap;
}
