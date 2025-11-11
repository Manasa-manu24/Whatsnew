import { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useMessages } from '@/hooks/useMessages';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, Phone, Video, MessageCircle, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ChatWindow() {
  const { currentChatId, chats, messages, setCurrentChatId } = useChatStore();
  const { userProfile } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  useMessages(currentChatId);

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const currentMessages = currentChatId ? messages[currentChatId] || [] : [];

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
    const otherUserId = currentChat.members.find((id) => id !== userProfile?.uid);
    return otherUserId || 'Unknown';
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
        
        <Avatar className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0">
          <AvatarImage src={currentChat.avatarUrl} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getChatName().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm md:text-base text-foreground truncate">{getChatName()}</h2>
          <p className="text-xs text-muted-foreground truncate">
            {currentChat.isGroup ? `${currentChat.members.length} members` : 'Online'}
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
    </div>
  );
}
