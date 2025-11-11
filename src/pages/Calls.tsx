import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface Call {
  id: string;
  contactName: string;
  contactAvatar?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  isVideo: boolean;
  timestamp: Date;
  duration?: number;
}

// Mock data for demonstration
const mockCalls: Call[] = [
  {
    id: '1',
    contactName: 'John Doe',
    type: 'incoming',
    isVideo: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: 320,
  },
  {
    id: '2',
    contactName: 'Jane Smith',
    type: 'missed',
    isVideo: false,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    contactName: 'Mike Johnson',
    type: 'outgoing',
    isVideo: false,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: 180,
  },
];

export default function Calls() {
  const getCallIcon = (call: Call) => {
    if (call.type === 'missed') {
      return <PhoneMissed className="h-4 w-4 text-destructive" />;
    }
    if (call.type === 'incoming') {
      return <PhoneIncoming className="h-4 w-4 text-primary" />;
    }
    return <PhoneOutgoing className="h-4 w-4 text-muted-foreground" />;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="overflow-y-auto h-full">
      {mockCalls.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center h-full">
          <div className="bg-primary/10 rounded-full p-6 mb-4">
            <Phone className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No calls yet</h3>
          <p className="text-muted-foreground text-sm">
            Start a voice or video call with your contacts
          </p>
        </div>
      ) : (
        <div>
          {mockCalls.map((call) => (
            <div
              key={call.id}
              className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors border-b border-border"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={call.contactAvatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {call.contactName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{call.contactName}</h3>
                <div className="flex items-center gap-2 text-sm">
                  {getCallIcon(call)}
                  <span className={call.type === 'missed' ? 'text-destructive' : 'text-muted-foreground'}>
                    {formatDistanceToNow(call.timestamp, { addSuffix: true })}
                  </span>
                  {call.duration && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{formatDuration(call.duration)}</span>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary-dark"
                aria-label={call.isVideo ? 'Video call' : 'Voice call'}
              >
                {call.isVideo ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
