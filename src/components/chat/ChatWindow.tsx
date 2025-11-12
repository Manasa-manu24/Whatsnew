import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useMessages } from '@/hooks/useMessages';
import { useMessageReceipts } from '@/hooks/useMessageReceipts';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import UserProfileView from './UserProfileView';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, Phone, Video, MessageCircle, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getUserProfile } from '@/lib/chatUtils';
import { User } from '@/lib/types';

export default function ChatWindow() {
  const { currentChatId, chats, messages, setCurrentChatId } = useChatStore();
  const { userProfile } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [showProfileView, setShowProfileView] = useState(false);
  
  useMessages(currentChatId);
  useMessageReceipts(currentChatId); // Mark messages as delivered and read

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const currentMessages = currentChatId ? messages[currentChatId] || [] : [];

  // Fetch other user's profile for 1:1 chats
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!currentChat || currentChat.isGroup || !userProfile) {
        setOtherUser(null);
        return;
      }

      const otherUserId = currentChat.members.find((id) => id !== userProfile.uid);
      if (otherUserId) {
        const user = await getUserProfile(otherUserId);
        setOtherUser(user);
      }
    };

    fetchOtherUser();
  }, [currentChat, userProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  if (!currentChatId || !currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-bg">
        <div className="text-center p-8">
          <div className="bg-primary/10 rounded-full p-8 inline-block mb-4">
            <MessageCircle className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Whatsnew</h2>
          <p className="text-muted-foreground">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    );
  }

  const getChatName = () => {
    if (currentChat.isGroup) return currentChat.name || 'Group Chat';
    return otherUser?.name || 'Unknown';
  };

  const getChatAvatar = () => {
    if (currentChat.isGroup) return currentChat.avatarUrl;
    return otherUser?.avatarUrl;
  };

  const getChatStatus = () => {
    if (currentChat.isGroup) {
      return `${currentChat.members.length} members`;
    }
    return otherUser?.isOnline ? 'Online' : 'Offline';
  };

  return (
    <div className="flex-1 flex flex-col bg-chat-bg h-full max-h-screen overflow-hidden">
      {/* Chat Header */}
      <div className="bg-background border-b border-border px-3 md:px-4 py-3 flex items-center gap-2 md:gap-3 flex-shrink-0">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentChatId(null)}
            className="mr-1 min-h-[2.5rem] min-w-[2.5rem]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar 
          className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => !currentChat.isGroup && setShowProfileView(true)}
        >
          <AvatarImage src={getChatAvatar()} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getChatName().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div 
          className="flex-1 min-w-0 cursor-pointer hover:bg-muted/50 rounded-md p-1 -ml-1 transition-colors"
          onClick={() => !currentChat.isGroup && setShowProfileView(true)}
        >
          <h2 className="font-semibold text-sm md:text-base text-foreground truncate">{getChatName()}</h2>
          <p className="text-xs text-muted-foreground truncate">
            {getChatStatus()}
          </p>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 min-h-[2.25rem] min-w-[2.25rem]">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 min-h-[2.25rem] min-w-[2.25rem]">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 min-h-[2.25rem] min-w-[2.25rem]">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 overscroll-contain">
        {currentMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === userProfile?.uid}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <MessageComposer chatId={currentChatId} />

      {/* User Profile View Dialog */}
      <UserProfileView 
        open={showProfileView} 
        onOpenChange={setShowProfileView}
        user={otherUser}
      />
    </div>
  );
}
