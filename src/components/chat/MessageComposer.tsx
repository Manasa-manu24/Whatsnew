import { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image as ImageIcon, Smile, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageComposerProps {
  chatId: string;
}

export default function MessageComposer({ chatId }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userProfile } = useAuthStore();
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!message.trim() || !userProfile) return;

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        chatId,
        senderId: userProfile.uid,
        content: message.trim(),
        createdAt: serverTimestamp(),
        deliveredTo: [],
        readBy: { [userProfile.uid]: serverTimestamp() },
      });

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
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Failed to send message',
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-background border-t border-border p-3 md:p-4 flex-shrink-0">
      <div className="flex items-end gap-1 md:gap-2">
        <div className="flex items-center gap-0.5 md:gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-9 w-9 min-h-[2.25rem] min-w-[2.25rem]"
          >
            <ImageIcon className="h-5 w-5" />
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
          className="min-h-[40px] max-h-[120px] resize-none text-sm md:text-base"
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
            className="bg-primary hover:bg-primary-dark h-9 w-9 min-h-[2.25rem] min-w-[2.25rem]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
