import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import ImageLightbox from './ImageLightbox';
import MessageActions from './MessageActions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onCopy?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

export default function MessageBubble({ 
  message, 
  isOwn,
  onReply = () => {},
  onForward = () => {},
  onCopy = () => {},
  onEdit = () => {},
  onDelete = () => {},
}: MessageBubbleProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [repliedMessage, setRepliedMessage] = useState<Message | null>(null);

  // Fetch replied message if exists
  useEffect(() => {
    const fetchRepliedMessage = async () => {
      if (message.replyToMessageId && message.chatId) {
        try {
          const messageRef = doc(db, 'chats', message.chatId, 'messages', message.replyToMessageId);
          const messageDoc = await getDoc(messageRef);
          if (messageDoc.exists()) {
            setRepliedMessage({ id: messageDoc.id, ...messageDoc.data() } as Message);
          }
        } catch (error) {
          console.error('Error fetching replied message:', error);
        }
      }
    };

    fetchRepliedMessage();
  }, [message.replyToMessageId, message.chatId]);

  const getTime = () => {
    try {
      return format(message.createdAt.toDate(), 'HH:mm');
    } catch {
      return '';
    }
  };

  // Check if message has been read by the recipient (not just sender)
  const hasBeenRead = message.readBy && Object.keys(message.readBy).length > 1;
  
  // In WhatsApp: Message shows double ticks immediately after sending (sent to server)
  // Message is considered "delivered" as soon as it exists in the database
  const hasBeenSent = !!message.createdAt;

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <MessageActions
        message={message}
        isOwn={isOwn}
        onReply={onReply}
        onForward={onForward}
        onCopy={onCopy}
        onEdit={onEdit}
        onDelete={onDelete}
      >
        <div
          className={cn(
            'max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-lg px-3 py-2 shadow-message cursor-pointer hover:shadow-lg transition-shadow',
            isOwn
              ? 'bg-chat-outgoing'
              : 'bg-chat-incoming'
          )}
        >
        {/* Replied Message Context */}
        {repliedMessage && (
          <div className="mb-2 p-2 bg-muted/50 rounded border-l-4 border-primary">
            <p className="text-xs font-semibold text-primary mb-1">
              Replied to
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {repliedMessage.content || '📷 Photo'}
            </p>
          </div>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id} className="rounded overflow-hidden">
                {attachment.type === 'image' && (
                  <img
                    src={attachment.url}
                    alt="attachment"
                    className="max-w-full h-auto rounded max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(attachment.url);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        
        {message.content && (
          <p className="text-sm md:text-base text-foreground whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
        
        <div className="flex items-center justify-end gap-1 mt-1">
          {message.editedAt && (
            <span className="text-[10px] text-muted-foreground italic mr-1">
              edited
            </span>
          )}
          <span className="text-[10px] md:text-xs text-chat-timestamp">
            {getTime()}
          </span>
          {isOwn && (
            <span className={cn(
              "transition-colors duration-200",
              hasBeenRead ? "text-blue-500" : "text-chat-timestamp"
            )}>
              {hasBeenRead ? (
                // Blue double ticks - message has been read
                <CheckCheck className="h-3 w-3" />
              ) : hasBeenSent ? (
                // Gray double ticks - message has been sent/delivered
                <CheckCheck className="h-3 w-3" />
              ) : (
                // Single tick - message pending (rarely shown)
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
        </div>
      </MessageActions>

      <ImageLightbox 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
}
