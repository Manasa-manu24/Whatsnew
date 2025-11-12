import { useState, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { getUserProfiles } from '@/lib/chatUtils';
import { User } from '@/lib/types';

export default function ChatList() {
  const { chats, currentChatId, setCurrentChatId } = useChatStore();
  const { userProfile } = useAuthStore();
  const [userProfiles, setUserProfiles] = useState<Map<string, User>>(new Map());

  // Fetch user profiles for all chat members
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

  const getChatName = (chat: any) => {
    if (chat.isGroup) return chat.name || 'Group Chat';
    
    // For 1:1 chats, show the other person's name
    const otherUserId = chat.members.find((id: string) => id !== userProfile?.uid);
    if (!otherUserId) return 'Unknown';
    
    const otherUser = userProfiles.get(otherUserId);
    return otherUser?.name || otherUserId;
  };

  const getChatAvatar = (chat: any) => {
    if (chat.isGroup) return chat.avatarUrl;
    
    // For 1:1 chats, show the other person's avatar
    const otherUserId = chat.members.find((id: string) => id !== userProfile?.uid);
    if (!otherUserId) return undefined;
    
    const otherUser = userProfiles.get(otherUserId);
    return otherUser?.avatarUrl;
  };

  const getLastMessageTime = (chat: any) => {
    if (!chat.lastMessagePreview?.createdAt) return '';
    
    try {
      return formatDistanceToNow(chat.lastMessagePreview.createdAt.toDate(), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-primary/10 rounded-full p-6 mb-4">
          <MessageCircle className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No chats yet</h3>
        <p className="text-muted-foreground text-sm">
          Start a conversation by clicking the new chat button
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full overscroll-contain">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => setCurrentChatId(chat.id)}
          className={cn(
            'w-full flex items-center gap-2 md:gap-3 p-3 md:p-4 hover:bg-secondary/50 transition-colors border-b border-border active:bg-secondary/70',
            currentChatId === chat.id && 'bg-secondary'
          )}
        >
          <Avatar className="h-11 w-11 md:h-12 md:w-12 flex-shrink-0">
            <AvatarImage src={getChatAvatar(chat)} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getChatName(chat).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between mb-0.5 md:mb-1">
              <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
                {getChatName(chat)}
              </h3>
              <span className="text-[10px] md:text-xs text-chat-timestamp flex-shrink-0 ml-2">
                {getLastMessageTime(chat)}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {chat.lastMessagePreview?.text || 'No messages yet'}
            </p>
          </div>
          
          {chat.unreadCounts?.[userProfile?.uid || ''] > 0 && (
            <div className="bg-primary text-primary-foreground rounded-full h-5 min-w-[1.25rem] flex items-center justify-center text-xs px-1.5 font-semibold flex-shrink-0">
              {chat.unreadCounts[userProfile?.uid || '']}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
