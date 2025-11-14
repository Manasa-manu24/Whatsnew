import { MessageCircle, Sparkles, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'chats' | 'updates' | 'calls';

interface BottomNavMobileProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function BottomNavMobile({ activeTab, onTabChange }: BottomNavMobileProps) {
  const tabs = [
    { id: 'chats' as TabType, label: 'Chats', icon: MessageCircle },
    { id: 'updates' as TabType, label: 'Updates', icon: Sparkles },
    { id: 'calls' as TabType, label: 'Calls', icon: Phone },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-bottom">
      <div className="flex items-center h-14 sm:h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 sm:gap-1 h-full transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:bg-muted/50'
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-[10px] sm:text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
