import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { UserStatus, StatusItem } from '@/hooks/useStatus';
import { Progress } from '@/components/ui/progress';

interface StatusViewerProps {
  userStatus: UserStatus;
  open: boolean;
  onClose: () => void;
  onReply?: (statusId: string, message: string) => void;
}

export default function StatusViewer({ userStatus, open, onClose, onReply }: StatusViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentItem = userStatus.items[currentIndex];
  const isVideo = currentItem?.mediaUrl.includes('.mp4') || currentItem?.mediaUrl.includes('video');
  const duration = isVideo ? 15000 : 5000; // 15s for video, 5s for image

  useEffect(() => {
    if (!open) {
      setCurrentIndex(0);
      setProgress(0);
      return;
    }

    setProgress(0);
    const startTime = Date.now();

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / duration) * 100;

      if (newProgress >= 100) {
        handleNext();
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [open, currentIndex, duration]);

  const handleNext = () => {
    if (currentIndex < userStatus.items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleReply = () => {
    if (replyText.trim() && onReply && currentItem) {
      onReply(currentItem.id, replyText);
      setReplyText('');
    }
  };

  if (!open || !currentItem) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
        {userStatus.items.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={userStatus.userAvatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userStatus.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold">{userStatus.userName}</p>
            <p className="text-white/80 text-sm">
              {formatDistanceToNow(currentItem.createdAt.toDate(), { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Media content */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Navigation areas */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-0 bottom-0 w-1/4 z-10"
          aria-label="Previous status"
          disabled={currentIndex === 0}
        />
        <button
          onClick={handleNext}
          className="absolute right-0 top-0 bottom-0 w-1/4 z-10"
          aria-label="Next status"
        />

        {isVideo ? (
          <video
            ref={videoRef}
            src={currentItem.mediaUrl}
            className="max-w-full max-h-full object-contain"
            autoPlay
            onEnded={handleNext}
          />
        ) : (
          <img
            src={currentItem.mediaUrl}
            alt="Status"
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Caption */}
        {currentItem.caption && (
          <div className="absolute bottom-20 left-0 right-0 px-6">
            <p className="text-white text-center bg-black/50 rounded-lg px-4 py-2">
              {currentItem.caption}
            </p>
          </div>
        )}
      </div>

      {/* Reply input */}
      <div className="p-4 bg-black/50">
        <div className="flex gap-2">
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Reply to status..."
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            onKeyDown={(e) => e.key === 'Enter' && handleReply()}
          />
          <Button
            onClick={handleReply}
            disabled={!replyText.trim()}
            size="icon"
            className="bg-primary hover:bg-primary-dark"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
