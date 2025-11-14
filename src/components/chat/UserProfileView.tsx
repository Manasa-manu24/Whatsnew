import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import { Mail, Phone, Info, MessageCircle, Video, Bell } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface UserProfileViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export default function UserProfileView({ open, onOpenChange, user }: UserProfileViewProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <VisuallyHidden>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View user profile information, contact details, and action buttons
          </DialogDescription>
        </VisuallyHidden>
        
        {/* Header with Avatar */}
        <div className="bg-primary/5 pt-8 pb-6 px-6 flex flex-col items-center">
          <Avatar className="h-32 w-32 mb-4 ring-4 ring-background">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-2xl font-bold text-foreground mb-1">{user.name}</h2>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {user.isOnline ? (
              <>
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span>Online</span>
              </>
            ) : (
              <span>Offline</span>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 space-y-4">
          {/* About Section */}
          {user.about && (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Info className="h-4 w-4" />
                <span className="font-medium">About</span>
              </div>
              <p className="text-sm text-foreground pl-6">{user.about}</p>
            </div>
          )}

          <Separator />

          {/* Email Section */}
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Mail className="h-4 w-4" />
              <span className="font-medium">Email</span>
            </div>
            <p className="text-sm text-foreground pl-6">{user.email}</p>
          </div>

          {/* Phone Section (if available) */}
          {user.phone && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">Phone</span>
                </div>
                <p className="text-sm text-foreground pl-6">{user.phone}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex flex-col items-center gap-1 h-auto py-3">
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs">Message</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col items-center gap-1 h-auto py-3">
              <Video className="h-5 w-5" />
              <span className="text-xs">Video Call</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col items-center gap-1 h-auto py-3">
              <Bell className="h-5 w-5" />
              <span className="text-xs">Mute</span>
            </Button>
          </div>
        </div>

        {/* Privacy Info */}
        <div className="bg-muted/30 px-6 py-3 text-center text-xs text-muted-foreground">
          <p>Messages and calls are end-to-end encrypted</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
