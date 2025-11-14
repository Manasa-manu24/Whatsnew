import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Lock, 
  Bell, 
  Database, 
  UserPlus, 
  RefreshCw,
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SettingItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  onClick?: () => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  
  const handleShareApp = async () => {
    const shareData = {
      title: 'WhatsNew - Chat App',
      text: 'Check out WhatsNew, a modern messaging app!',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Failed to share');
      }
    }
  };

  const settingsItems: SettingItem[] = [
    {
      id: 'account',
      label: 'Account',
      icon: User,
      description: 'Security, change number, delete account',
      onClick: () => {
        toast.info('Account settings - Coming soon');
        // TODO: Navigate to account settings page
      },
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: Lock,
      description: 'Block contacts, disappearing messages',
      onClick: () => {
        toast.info('Privacy settings - Coming soon');
        // TODO: Navigate to privacy settings page
      },
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Message, group & call tones',
      onClick: () => {
        toast.info('Notification settings - Coming soon');
        // TODO: Navigate to notification settings page
      },
    },
    {
      id: 'storage',
      label: 'Storage and Data',
      icon: Database,
      description: 'Network usage, auto-download',
      onClick: () => {
        toast.info('Storage settings - Coming soon');
        // TODO: Navigate to storage settings page
      },
    },
    {
      id: 'invite',
      label: 'Invite a Friend',
      icon: UserPlus,
      description: 'Share WhatsNew with friends',
      onClick: handleShareApp,
    },
    {
      id: 'updates',
      label: 'App Updates',
      icon: RefreshCw,
      description: 'Check for new versions',
      onClick: () => {
        toast.success('You are using the latest version');
        // TODO: Implement version check
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your app preferences and account settings
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh]">
          {settingsItems.map((item, index) => (
            <div key={item.id}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto py-4 px-6 hover:bg-muted/50",
                  "flex items-center gap-4"
                )}
                onClick={item.onClick}
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </Button>
              
              {index < settingsItems.length - 1 && (
                <Separator className="mx-6" />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-muted/30 text-center text-xs text-muted-foreground">
          <p>WhatsNew v1.0.0</p>
          <p className="mt-1">Made with ❤️ for better communication</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
