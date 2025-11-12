import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/lib/types';
import { getOrCreateChat } from '@/lib/chatUtils';
import { toast } from 'sonner';
import { Users, Loader2 } from 'lucide-react';

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState<string | null>(null);
  const { userProfile } = useAuthStore();
  const { setCurrentChatId } = useChatStore();

  useEffect(() => {
    if (!userProfile) return;

    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUsers: User[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data() as User;
        // Exclude current user
        if (userData.uid !== userProfile.uid) {
          allUsers.push(userData);
        }
      });
      setUsers(allUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handleUserClick = async (otherUser: User) => {
    if (!userProfile || creatingChat) return;

    setCreatingChat(otherUser.uid);

    try {
      const chatId = await getOrCreateChat(userProfile.uid, otherUser.uid);
      setCurrentChatId(chatId);
      toast.success(`Chat with ${otherUser.name} opened`);
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error(error.message || 'Failed to create chat');
    } finally {
      setCreatingChat(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-primary/10 rounded-full p-6 mb-4">
          <Users className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-muted-foreground text-sm">
          Be the first to invite your friends
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full overscroll-contain">
      {users.map((user) => {
        const isCreating = creatingChat === user.uid;
        
        return (
          <button
            key={user.uid}
            onClick={() => handleUserClick(user)}
            disabled={isCreating}
            className="w-full flex items-center gap-2 md:gap-3 p-3 md:p-4 hover:bg-secondary/50 transition-colors border-b border-border active:bg-secondary/70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Avatar className="h-11 w-11 md:h-12 md:w-12 flex-shrink-0 relative">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
              {user.isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-0.5 md:mb-1">
                <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
                  {user.name}
                </h3>
                {user.isOnline && (
                  <span className="text-[10px] md:text-xs text-green-600 font-medium flex-shrink-0 ml-2">
                    Online
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {user.about || user.email}
              </p>
            </div>

            {isCreating && (
              <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
