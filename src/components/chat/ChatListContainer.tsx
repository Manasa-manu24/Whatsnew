import UnifiedChatList from './UnifiedChatList';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function ChatListContainer() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search Bar */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search or start new chat"
            className="pl-9 bg-muted/50 text-sm"
          />
        </div>
      </div>

      {/* Unified Chat and Users List */}
      <UnifiedChatList />
    </div>
  );
}
