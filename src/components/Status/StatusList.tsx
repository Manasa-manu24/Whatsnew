import { Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserStatus } from '@/hooks/useStatus';
import { useAuthStore } from '@/stores/authStore';
import { formatDistanceToNow } from 'date-fns';

interface StatusListProps {
  statuses: UserStatus[];
  onViewStatus: (userStatus: UserStatus) => void;
  onCreateStatus: () => void;
}

export default function StatusList({ statuses, onViewStatus, onCreateStatus }: StatusListProps) {
  const { userProfile } = useAuthStore();
  const myStatus = statuses.find((s) => s.userId === userProfile?.uid);
  const otherStatuses = statuses.filter((s) => s.userId !== userProfile?.uid);

  return (
    <div className="overflow-y-auto h-full">
      {/* My Status */}
      <div className="p-2.5 sm:p-3 md:p-4 border-b border-border">
        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 sm:h-13 sm:w-13 md:h-14 md:w-14">
              <AvatarImage src={userProfile?.avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
                {userProfile?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={onCreateStatus}
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-0.5 sm:p-1 border-2 border-card hover:bg-primary-dark transition-colors"
              aria-label="Add status"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">My status</h3>
            {myStatus ? (
              <button
                onClick={() => onViewStatus(myStatus)}
                className="text-xs sm:text-sm text-muted-foreground hover:underline text-left"
              >
                Tap to view · {formatDistanceToNow(myStatus.items[0].createdAt.toDate(), { addSuffix: true })}
              </button>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">Tap to add status update</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      {otherStatuses.length > 0 && (
        <div>
          <div className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-muted/50">
            <h4 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase">Recent updates</h4>
          </div>
          {otherStatuses.map((userStatus) => (
            <button
              key={userStatus.userId}
              onClick={() => onViewStatus(userStatus)}
              className="w-full flex items-center gap-2 sm:gap-2.5 md:gap-3 p-2.5 sm:p-3 md:p-4 hover:bg-secondary/50 transition-colors border-b border-border"
            >
              <Avatar className="h-12 w-12 sm:h-13 sm:w-13 md:h-14 md:w-14 ring-2 ring-primary ring-offset-2 ring-offset-background">
                <AvatarImage src={userStatus.userAvatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
                  {userStatus.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">{userStatus.userName}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {formatDistanceToNow(userStatus.items[0].createdAt.toDate(), { addSuffix: true })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {statuses.length === 0 && (
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center h-full">
          <div className="bg-primary/10 rounded-full p-4 sm:p-6 mb-3 sm:mb-4">
            <Plus className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">No status updates</h3>
          <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
            Share photos and videos that disappear after 24 hours
          </p>
          <Button onClick={onCreateStatus} className="h-8 sm:h-9 text-xs sm:text-sm">Create Status</Button>
        </div>
      )}
    </div>
  );
}
