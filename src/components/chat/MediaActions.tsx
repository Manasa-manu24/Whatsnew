import { Attachment, Message } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Download, Forward, Trash2, Eye, Reply } from 'lucide-react';

interface MediaActionsProps {
  attachment: Attachment;
  message: Message;
  isOwn: boolean;
  onView: () => void;
  onDownload: () => void;
  onReply: () => void;
  onForward: () => void;
  onDelete: () => void;
}

export default function MediaActions({
  attachment,
  message,
  isOwn,
  onView,
  onDownload,
  onReply,
  onForward,
  onDelete,
}: MediaActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white absolute top-2 right-2 z-10 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onReply();
        }}>
          <Reply className="mr-2 h-4 w-4" />
          <span>Reply</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onView();
        }}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onDownload();
        }}>
          <Download className="mr-2 h-4 w-4" />
          <span>Download</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onForward();
        }}>
          <Forward className="mr-2 h-4 w-4" />
          <span>Forward</span>
        </DropdownMenuItem>
        
        {isOwn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
