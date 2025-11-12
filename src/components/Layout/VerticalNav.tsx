import { MessageCircle, Sparkles, Phone, Users, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

type TabType = 'chats' | 'updates' | 'calls' | 'contacts';

interface VerticalNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export default function VerticalNav({ 
  activeTab, 
  onTabChange, 
  onProfileClick, 
  onSettingsClick 
}: VerticalNavProps) {
  const { userProfile } = useAuthStore();

  const tabs = [
    { id: 'chats' as TabType, icon: MessageCircle, label: 'Chats' },
    { id: 'updates' as TabType, icon: Sparkles, label: 'Updates' },
    { id: 'calls' as TabType, icon: Phone, label: 'Calls' },
    { id: 'contacts' as TabType, icon: Users, label: 'Contacts' },
  ];

  return (
    <aside className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-4">
      {/* User Avatar at top */}
      <Avatar 
        className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity" 
        onClick={onProfileClick}
      >
        <AvatarImage src={userProfile?.avatarUrl} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {userProfile?.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-2 flex-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="icon"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'h-12 w-12 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-6 w-6" />
            </Button>
          );
        })}
      </div>

      {/* Settings at bottom */}
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Settings"
        onClick={onSettingsClick}
      >
        <Settings className="h-6 w-6" />
      </Button>
    </aside>
  );
}
