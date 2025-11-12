import { Message } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Reply, Forward, Copy, Edit, Trash2 } from 'lucide-react';

interface MessageActionsProps {
  message: Message;
  isOwn: boolean;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onCopy: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  children: React.ReactNode;
}

export default function MessageActions({
  message,
  isOwn,
  onReply,
  onForward,
  onCopy,
  onEdit,
  onDelete,
  children,
}: MessageActionsProps) {
  const hasContent = !!message.content;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onReply(message)}>
          <Reply className="mr-2 h-4 w-4" />
          <span>Reply</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onForward(message)}>
          <Forward className="mr-2 h-4 w-4" />
          <span>Forward</span>
        </DropdownMenuItem>
        
        {hasContent && (
          <DropdownMenuItem onClick={() => onCopy(message)}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy</span>
          </DropdownMenuItem>
        )}
        
        {isOwn && (
          <>
            <DropdownMenuSeparator />
            
            {hasContent && (
              <DropdownMenuItem onClick={() => onEdit(message)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem 
              onClick={() => onDelete(message)}
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
