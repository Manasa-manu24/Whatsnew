import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const getTime = () => {
    try {
      return format(message.createdAt.toDate(), 'HH:mm');
    } catch {
      return '';
    }
  };

  const hasBeenRead = message.readBy && Object.keys(message.readBy).length > 1;
  const hasBeenDelivered = message.deliveredTo && message.deliveredTo.length > 0;

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
                    className="max-w-full h-auto rounded max-h-[300px] object-contain"
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
            <span className="text-chat-timestamp">
              {hasBeenRead ? (
                <CheckCheck className="h-3 w-3 text-primary" />
              ) : hasBeenDelivered ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
