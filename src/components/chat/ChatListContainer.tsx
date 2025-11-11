import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import ChatList from './ChatList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, LogOut, Search, MoreVertical } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ChatListContainer() {
  const { userProfile } = useAuthStore();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [newChatEmail, setNewChatEmail] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);

  const handleNewChat = async () => {
    if (!newChatEmail.trim() || !userProfile) return;

    setCreatingChat(true);
    try {
      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', newChatEmail.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        toast({
          title: 'User not found',
          description: 'No user exists with that email',
          variant: 'destructive',
        });
        return;
      }

      const otherUser = snapshot.docs[0];
      const otherUserId = otherUser.id;

      if (otherUserId === userProfile.uid) {
        toast({
          title: 'Invalid action',
          description: 'You cannot chat with yourself',
          variant: 'destructive',
        });
        return;
      }

      // Check if chat already exists
      const chatsRef = collection(db, 'chats');
      const existingChatsQuery = query(
        chatsRef,
        where('members', 'array-contains', userProfile.uid)
      );
      const existingChats = await getDocs(existingChatsQuery);
      
      let chatExists = false;
      existingChats.forEach((doc) => {
        const chatData = doc.data();
        if (
          !chatData.isGroup &&
          chatData.members.includes(otherUserId)
        ) {
          chatExists = true;
        }
      });

      if (chatExists) {
        toast({
          title: 'Chat exists',
          description: 'A chat with this user already exists',
        });
        setNewChatEmail('');
        return;
      }

      // Create new chat
      await addDoc(chatsRef, {
        isGroup: false,
        members: [userProfile.uid, otherUserId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Chat created!',
        description: `Started a new chat with ${otherUser.data().name}`,
      });
      setNewChatEmail('');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: 'Failed to create chat',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setCreatingChat(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search Bar */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search or start new chat"
            className="pl-9 bg-muted/50 text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <ChatList />
    </div>
  );
}
