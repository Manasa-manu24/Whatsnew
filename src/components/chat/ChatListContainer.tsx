import UnifiedChatList from './UnifiedChatList';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function ChatListContainer() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search Bar */}
      <div className="p-2 sm:p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            placeholder="Search or start new chat"
            className="pl-7 sm:pl-9 h-8 sm:h-9 bg-muted/50 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Unified Chat and Users List */}
      <UnifiedChatList />
    </div>
  );
}
