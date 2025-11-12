import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import ImageLightbox from './ImageLightbox';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-lg px-3 py-2 shadow-message',
          isOwn
            ? 'bg-chat-outgoing'
            : 'bg-chat-incoming'
        )}
      >
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id} className="rounded overflow-hidden">
                {attachment.type === 'image' && (
                  <img
                    src={attachment.url}
                    alt="attachment"
                    className="max-w-full h-auto rounded max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(attachment.url)}
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

      <ImageLightbox 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
}
