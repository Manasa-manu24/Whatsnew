import { useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useChatStore } from '@/stores/chatStore';
import { Message } from '@/lib/types';

export function useMessages(chatId: string | null) {
  const { setMessages } = useChatStore();

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(chatId, messages);
    });

    return () => unsubscribe();
  }, [chatId, setMessages]);
}
