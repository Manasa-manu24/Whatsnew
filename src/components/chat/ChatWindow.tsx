import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useMessages } from '@/hooks/useMessages';
import { useMessageReceipts } from '@/hooks/useMessageReceipts';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import UserProfileView from './UserProfileView';
import MediaGallery from './MediaGallery';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Phone, Video, MessageCircle, ArrowLeft, BellOff, User, Ban, Trash2, Image, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getUserProfile } from '@/lib/chatUtils';
import { User as UserType, Message } from '@/lib/types';
import { doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ChatWindow() {
  const { currentChatId, chats, messages, setCurrentChatId } = useChatStore();
  const { userProfile } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [otherUser, setOtherUser] = useState<UserType | null>(null);
  const [showProfileView, setShowProfileView] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  
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

  const handleReply = (message: Message) => {
    setReplyToMessage(message);
    toast.success('Reply mode activated');
  };

  const handleForward = (message: Message) => {
    // TODO: Implement forward dialog to select chat
    toast.info('Forward feature coming soon');
  };

  const handleCopy = async (message: Message) => {
    if (message.content) {
      try {
        await navigator.clipboard.writeText(message.content);
        toast.success('Message copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy message');
      }
    }
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    toast.info('Edit mode activated');
  };

  const handleDelete = async (message: Message) => {
    if (!userProfile || message.senderId !== userProfile.uid) {
      toast.error('You can only delete your own messages');
      return;
    }

    try {
      const messageRef = doc(db, 'chats', currentChatId!, 'messages', message.id);
      await deleteDoc(messageRef);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleMuteNotifications = async () => {
    try {
      const chatRef = doc(db, 'chats', currentChatId!);
      await updateDoc(chatRef, {
        muted: true,
        mutedAt: serverTimestamp()
      });
      toast.success('Notifications muted');
    } catch (error) {
      console.error('Error muting notifications:', error);
      toast.error('Failed to mute notifications');
    }
  };

  const handleViewProfile = () => {
    if (!currentChat.isGroup && otherUser) {
      setShowProfileView(true);
    }
  };

  const handleBlockUser = async () => {
    if (currentChat.isGroup) {
      toast.error('Cannot block group chats');
      return;
    }

    try {
      // TODO: Implement block functionality in your backend
      toast.info('Block feature coming soon');
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleDeleteChat = async () => {
    if (!currentChatId) return;

    try {
      const chatRef = doc(db, 'chats', currentChatId);
      await deleteDoc(chatRef);
      setCurrentChatId(null);
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleViewMedia = () => {
    setShowMediaGallery(true);
  };

  const handleNewGroup = () => {
    toast.info('New group feature coming soon');
    // TODO: Navigate to group creation page or open dialog
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
          
          {/* 3-Dot Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 min-h-[2.25rem] min-w-[2.25rem]">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleMuteNotifications}>
                <BellOff className="mr-2 h-4 w-4" />
                <span>Mute Notifications</span>
              </DropdownMenuItem>
              
              {!currentChat.isGroup && (
                <DropdownMenuItem onClick={handleViewProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={handleViewMedia}>
                <Image className="mr-2 h-4 w-4" />
                <span>Media</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleNewGroup}>
                <Users className="mr-2 h-4 w-4" />
                <span>New Group</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {!currentChat.isGroup && (
                <DropdownMenuItem onClick={handleBlockUser}>
                  <Ban className="mr-2 h-4 w-4" />
                  <span>Block</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem 
                onClick={handleDeleteChat}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Chat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 overscroll-contain">
        {currentMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === userProfile?.uid}
            onReply={handleReply}
            onForward={handleForward}
            onCopy={handleCopy}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <MessageComposer 
        chatId={currentChatId} 
        replyToMessage={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
      />

      {/* User Profile View Dialog */}
      <UserProfileView 
        open={showProfileView} 
        onOpenChange={setShowProfileView}
        user={otherUser}
      />

      {/* Media Gallery Dialog */}
      <MediaGallery
        open={showMediaGallery}
        onOpenChange={setShowMediaGallery}
        messages={currentMessages}
      />
    </div>
  );
}
