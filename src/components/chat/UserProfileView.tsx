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
import { Mail, Phone, Info, MessageCircle, Video, Bell, BellOff, Shield, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Badge } from '@/components/ui/badge';

interface UserProfileViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export default function UserProfileView({ open, onOpenChange, user }: UserProfileViewProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <VisuallyHidden>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View user profile information, contact details, and action buttons
          </DialogDescription>
        </VisuallyHidden>
        
        {/* Header with Cover & Avatar */}
        <div className="relative">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5" />
          
          {/* Avatar - Overlapping */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
            <div className="relative">
              <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Online Status Badge */}
              {user.isOnline && (
                <div className="absolute bottom-2 right-2 h-6 w-6 bg-green-500 rounded-full ring-4 ring-background" />
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Name & Status */}
          <div className="pt-20 pb-4 px-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">{user.name}</h2>
            
            <Badge variant={user.isOnline ? "default" : "secondary"} className="mb-3">
              {user.isOnline ? "Active Now" : "Offline"}
            </Badge>

            {/* About Section */}
            {user.about && (
              <p className="text-sm text-muted-foreground mt-3 italic">
                "{user.about}"
              </p>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-primary/5 hover:border-primary transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium">Message</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-primary/5 hover:border-primary transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium">Video</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-primary/5 hover:border-primary transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium">Mute</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="px-6 py-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Contact Information
            </h3>

            {/* Email */}
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                <p className="text-sm text-foreground font-medium truncate">{user.email}</p>
              </div>
            </div>

            {/* Phone */}
            {user.phone && (
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                  <p className="text-sm text-foreground font-medium">{user.phone}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Additional Actions */}
          <div className="px-6 py-4 space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-12 hover:bg-muted/50"
            >
              <BellOff className="h-4 w-4" />
              <span className="text-sm">Mute Notifications</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-12 hover:bg-muted/50"
            >
              <Shield className="h-4 w-4" />
              <span className="text-sm">Block User</span>
            </Button>
          </div>

          {/* Privacy Info */}
          <div className="bg-muted/30 px-6 py-4 text-center mt-4">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <p>Messages and calls are end-to-end encrypted</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
