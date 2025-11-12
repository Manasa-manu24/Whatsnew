import { useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook to automatically mark messages as delivered and read
 * when user opens a chat
 */
export function useMessageReceipts(chatId: string | null) {
  const { userProfile } = useAuthStore();

  useEffect(() => {
    if (!chatId || !userProfile) return;

    const markMessagesAsDeliveredAndRead = async () => {
      try {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        
        // Get all messages that are not sent by current user and not yet delivered/read
        const q = query(
          messagesRef,
          where('senderId', '!=', userProfile.uid)
        );

        const snapshot = await getDocs(q);
        
        const updates: Promise<void>[] = [];

        snapshot.forEach((messageDoc) => {
          const messageData = messageDoc.data();
          const messageRef = doc(db, 'chats', chatId, 'messages', messageDoc.id);
          
          const isDelivered = messageData.deliveredTo?.includes(userProfile.uid);
          const isRead = messageData.readBy?.[userProfile.uid];

          // Mark as delivered if not already
          if (!isDelivered) {
            updates.push(
              updateDoc(messageRef, {
                deliveredTo: arrayUnion(userProfile.uid)
              })
            );
          }

          // Mark as read if not already (user is actively viewing the chat)
          if (!isRead) {
            updates.push(
              updateDoc(messageRef, {
                [`readBy.${userProfile.uid}`]: serverTimestamp()
              })
            );
          }
        });

        // Execute all updates
        await Promise.all(updates);

        // Reset unread count for this chat
        if (updates.length > 0) {
          const chatRef = doc(db, 'chats', chatId);
          await updateDoc(chatRef, {
            [`unreadCounts.${userProfile.uid}`]: 0
          });
        }
      } catch (error) {
        console.error('Error marking messages as delivered/read:', error);
      }
    };

    // Mark messages when chat is opened
    markMessagesAsDeliveredAndRead();

    // Optional: Set up an interval to check for new messages periodically
    const interval = setInterval(markMessagesAsDeliveredAndRead, 3000);

    return () => clearInterval(interval);
  }, [chatId, userProfile]);
}
