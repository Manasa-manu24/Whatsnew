import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image as ImageIcon, Smile, Paperclip, X, Video as VideoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/lib/types';

interface MessageComposerProps {
  chatId: string;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
}

export default function MessageComposer({ 
  chatId, 
  replyToMessage = null,
  onCancelReply = () => {},
  editingMessage = null,
  onCancelEdit = () => {},
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { userProfile } = useAuthStore();
  const { toast } = useToast();

  // Set message content when editing
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content || '');
    }
  }, [editingMessage]);

  const handleSendMessage = async () => {
    if (!message.trim() || !userProfile) return;

    try {
      if (editingMessage) {
        // Update existing message
        const messageRef = doc(db, 'chats', chatId, 'messages', editingMessage.id);
        await updateDoc(messageRef, {
          content: message.trim(),
          editedAt: serverTimestamp(),
        });

        toast({
          title: 'Message updated',
        });
        setMessage('');
        onCancelEdit();
      } else {
        // Send new message
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const messageData: any = {
          chatId,
          senderId: userProfile.uid,
          content: message.trim(),
          createdAt: serverTimestamp(),
          deliveredTo: [],
          readBy: { [userProfile.uid]: serverTimestamp() },
        };

        // Add reply reference if replying
        if (replyToMessage) {
          messageData.replyToMessageId = replyToMessage.id;
        }

        await addDoc(messagesRef, messageData);

        // Update chat's last message
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
          lastMessagePreview: {
            text: message.trim(),
            senderId: userProfile.uid,
            createdAt: serverTimestamp(),
          },
          updatedAt: serverTimestamp(),
        });

        setMessage('');
        if (replyToMessage) {
          onCancelReply();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: editingMessage ? 'Failed to update message' : 'Failed to send message',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    setUploading(true);
    try {
      const result = await uploadToCloudinary(file);

      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        chatId,
        senderId: userProfile.uid,
        attachments: [{
          id: result.public_id,
          url: result.secure_url,
          type: 'image',
          size: result.bytes,
        }],
        createdAt: serverTimestamp(),
        deliveredTo: [],
        readBy: { [userProfile.uid]: serverTimestamp() },
      });

      // Update chat's last message
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessagePreview: {
          text: '📷 Photo',
          senderId: userProfile.uid,
          createdAt: serverTimestamp(),
          attachmentType: 'image',
        },
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Image sent!',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Failed to upload image',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    // Validate file size (max 50MB for video)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'Video too large',
        description: 'Please select a video under 50MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadToCloudinary(file);

      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        chatId,
        senderId: userProfile.uid,
        attachments: [{
          id: result.public_id,
          url: result.secure_url,
          type: 'video',
          size: result.bytes,
        }],
        createdAt: serverTimestamp(),
        deliveredTo: [],
        readBy: { [userProfile.uid]: serverTimestamp() },
      });

      // Update chat's last message
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessagePreview: {
          text: '🎥 Video',
          senderId: userProfile.uid,
          createdAt: serverTimestamp(),
          attachmentType: 'video',
        },
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Video sent!',
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Failed to upload video',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="sticky bottom-0 z-10 bg-background border-t border-border flex-shrink-0">
      {/* Reply/Edit Indicator */}
      {(replyToMessage || editingMessage) && (
        <div className="px-3 md:px-4 pt-3 pb-1">
          <div className="bg-muted rounded-lg p-2 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary mb-1">
                {editingMessage ? 'Editing message' : 'Replying to'}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {editingMessage?.content || replyToMessage?.content || ''}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={editingMessage ? onCancelEdit : onCancelReply}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="p-2 sm:p-3 md:p-4 flex items-end gap-1 sm:gap-1.5 md:gap-2">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted"
            title="Send image"
          >
            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading}
            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted"
            title="Send video"
          >
            <VideoIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoUpload}
          />
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 min-h-[2.25rem] min-w-[2.25rem] hidden md:flex"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
          className="min-h-[36px] sm:min-h-[40px] max-h-[100px] sm:max-h-[120px] resize-none text-sm sm:text-base py-2 px-3 rounded-2xl"
          rows={1}
        />

        <div className="flex items-center gap-0.5 md:gap-1">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 min-h-[2.25rem] min-w-[2.25rem] hidden md:flex"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || uploading}
            size="icon"
            className="bg-primary hover:bg-primary/90 h-8 w-8 sm:h-9 sm:w-9 rounded-full shadow-md transition-all"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
