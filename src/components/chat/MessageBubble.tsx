import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import MessageActions from './MessageActions';
import MediaActions from './MediaActions';
import ImageLightbox from './ImageLightbox';
import VideoLightbox from './VideoLightbox';
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
  const [repliedMessage, setRepliedMessage] = useState<Message | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

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

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasTextOrMetadata = message.content || repliedMessage;

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
        {/* Media attachments - NO MessageActions wrapper */}
        {hasAttachments && (
          <div className={cn(
            'rounded-lg overflow-hidden shadow-message',
            hasTextOrMetadata ? 'mb-1' : ''
          )}>
            {message.attachments!.map((attachment) => (
              <div key={attachment.id} className="rounded overflow-hidden relative group">
                {attachment.type === 'image' && (
                  <>
                    <MediaActions
                      attachment={attachment}
                      message={message}
                      isOwn={isOwn}
                      onView={() => setSelectedImage(attachment.url)}
                      onDownload={() => {
                        // Download logic
                        const link = document.createElement('a');
                        link.href = attachment.url;
                        link.download = `image-${Date.now()}.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      onReply={() => onReply(message)}
                      onForward={() => onForward(message)}
                      onDelete={() => onDelete(message)}
                    />
                    <img
                      src={attachment.url}
                      alt="attachment"
                      className="max-w-full h-auto rounded max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(attachment.url)}
                    />
                  </>
                )}
                {attachment.type === 'video' && (
                  <div className="relative group">
                    <MediaActions
                      attachment={attachment}
                      message={message}
                      isOwn={isOwn}
                      onView={() => setSelectedVideo(attachment.url)}
                      onDownload={() => {
                        // Download logic
                        const link = document.createElement('a');
                        link.href = attachment.url;
                        link.download = `video-${Date.now()}.mp4`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      onReply={() => onReply(message)}
                      onForward={() => onForward(message)}
                      onDelete={() => onDelete(message)}
                    />
                    <video
                      src={attachment.url}
                      className="max-w-full h-auto rounded max-h-[300px] object-contain cursor-pointer"
                      preload="metadata"
                      onClick={() => setSelectedVideo(attachment.url)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-black/70 transition-colors">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text content and metadata - WITH MessageActions wrapper */}
        {hasTextOrMetadata && (
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
                'rounded-lg px-3 py-2 shadow-message cursor-pointer hover:shadow-lg transition-shadow',
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
        )}

        {/* If only attachments, show timestamp separately */}
        {hasAttachments && !hasTextOrMetadata && (
          <div className="flex items-center justify-end gap-1 mt-1 px-2">
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
                  <CheckCheck className="h-3 w-3" />
                ) : hasBeenSent ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Lightbox components */}
      <ImageLightbox 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />

      <VideoLightbox 
        videoUrl={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
      />
    </div>
  );
}
