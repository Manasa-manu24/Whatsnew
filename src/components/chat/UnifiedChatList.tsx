import { useState, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Loader2 } from 'lucide-react';
import { getUserProfiles, getOrCreateChat } from '@/lib/chatUtils';
import { User } from '@/lib/types';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface ChatEntry {
  id: string;
  type: 'chat' | 'user';
  name: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount?: number;
  isOnline?: boolean;
  userId?: string;
}

export default function UnifiedChatList() {
  const { chats, currentChatId, setCurrentChatId } = useChatStore();
  const { userProfile } = useAuthStore();
  const [userProfiles, setUserProfiles] = useState<Map<string, User>>(new Map());
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState<string | null>(null);
  const [entries, setEntries] = useState<ChatEntry[]>([]);

  // Fetch all users
  useEffect(() => {
    if (!userProfile) return;

    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: User[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data() as User;
        if (userData.uid !== userProfile.uid) {
          users.push(userData);
        }
      });
      setAllUsers(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  // Fetch user profiles for chat members
  useEffect(() => {
    const fetchUserProfiles = async () => {
      const allUserIds = new Set<string>();
      
      chats.forEach((chat) => {
        chat.members.forEach((memberId) => {
          if (memberId !== userProfile?.uid) {
            allUserIds.add(memberId);
          }
        });
      });

      if (allUserIds.size > 0) {
        const profiles = await getUserProfiles(Array.from(allUserIds));
        setUserProfiles(profiles);
      }
    };

    if (chats.length > 0 && userProfile) {
      fetchUserProfiles();
    }
  }, [chats, userProfile]);

  // Create unified list of chat entries
  useEffect(() => {
    if (!userProfile) return;

    const chatEntries: ChatEntry[] = [];
    const usersWithChats = new Set<string>();

    // Add existing chats
    chats.forEach((chat) => {
      if (!chat.isGroup) {
        const otherUserId = chat.members.find((id) => id !== userProfile.uid);
        if (otherUserId) {
          usersWithChats.add(otherUserId);
          const otherUser = userProfiles.get(otherUserId);
          
          chatEntries.push({
            id: chat.id,
            type: 'chat',
            name: otherUser?.name || otherUserId,
            avatarUrl: otherUser?.avatarUrl,
            lastMessage: chat.lastMessagePreview?.text || 'No messages yet',
            lastMessageTime: chat.lastMessagePreview?.createdAt,
            unreadCount: chat.unreadCounts?.[userProfile.uid] || 0,
            isOnline: otherUser?.isOnline,
            userId: otherUserId,
          });
        }
      } else {
        // Group chats
        chatEntries.push({
          id: chat.id,
          type: 'chat',
          name: chat.name || 'Group Chat',
          avatarUrl: chat.avatarUrl,
          lastMessage: chat.lastMessagePreview?.text || 'No messages yet',
          lastMessageTime: chat.lastMessagePreview?.createdAt,
          unreadCount: chat.unreadCounts?.[userProfile.uid] || 0,
        });
      }
    });

    // Add users without chats
    allUsers.forEach((user) => {
      if (!usersWithChats.has(user.uid)) {
        chatEntries.push({
          id: user.uid,
          type: 'user',
          name: user.name,
          avatarUrl: user.avatarUrl,
          lastMessage: user.about || 'Click to start chatting',
          isOnline: user.isOnline,
          userId: user.uid,
        });
      }
    });

    // Sort: chats with recent messages first, then users without chats
    chatEntries.sort((a, b) => {
      if (a.type === 'chat' && b.type === 'user') return -1;
      if (a.type === 'user' && b.type === 'chat') return 1;
      
      if (a.type === 'chat' && b.type === 'chat') {
        if (!a.lastMessageTime && !b.lastMessageTime) return 0;
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return b.lastMessageTime.toMillis() - a.lastMessageTime.toMillis();
      }
      
      return a.name.localeCompare(b.name);
    });

    setEntries(chatEntries);
  }, [chats, allUsers, userProfiles, userProfile]);

  const handleEntryClick = async (entry: ChatEntry) => {
    if (entry.type === 'chat') {
      setCurrentChatId(entry.id);
    } else {
      // User without chat - create chat
      if (!userProfile || creatingChat || !entry.userId) return;

      setCreatingChat(entry.userId);

      try {
        const chatId = await getOrCreateChat(userProfile.uid, entry.userId);
        setCurrentChatId(chatId);
      } catch (error: any) {
        console.error('Error creating chat:', error);
        toast.error(error.message || 'Failed to create chat');
      } finally {
        setCreatingChat(null);
      }
    }
  };

  const getLastMessageTime = (entry: ChatEntry) => {
    if (!entry.lastMessageTime) return '';
    
    try {
      return formatDistanceToNow(entry.lastMessageTime.toDate(), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-primary/10 rounded-full p-6 mb-4">
          <MessageCircle className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No users yet</h3>
        <p className="text-muted-foreground text-sm">
          Be the first to invite your friends
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full overscroll-contain">
      {entries.map((entry) => {
        const isCreating = creatingChat === entry.userId;
        const isActive = currentChatId === entry.id;
        
        return (
          <button
            key={entry.id}
            onClick={() => handleEntryClick(entry)}
            disabled={isCreating}
            className={cn(
              'w-full flex items-center gap-2 md:gap-3 p-3 md:p-4 hover:bg-secondary/50 transition-colors border-b border-border active:bg-secondary/70 disabled:opacity-50 disabled:cursor-not-allowed',
              isActive && 'bg-secondary'
            )}
          >
            <Avatar className="h-11 w-11 md:h-12 md:w-12 flex-shrink-0 relative">
              <AvatarImage src={entry.avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {entry.name.charAt(0).toUpperCase()}
              </AvatarFallback>
              {entry.isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-0.5 md:mb-1">
                <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
                  {entry.name}
                </h3>
                {entry.type === 'chat' && entry.lastMessageTime && (
                  <span className="text-[10px] md:text-xs text-chat-timestamp flex-shrink-0 ml-2">
                    {getLastMessageTime(entry)}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {entry.lastMessage}
              </p>
            </div>
            
            {isCreating && (
              <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
