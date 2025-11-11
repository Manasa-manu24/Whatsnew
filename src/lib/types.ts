import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  phone?: string;
  email: string;
  name: string;
  about?: string;
  avatarUrl?: string;
  createdAt: Timestamp;
  lastSeen: Timestamp;
  isOnline: boolean;
  settings?: {
    privacyLastSeen: 'everyone' | 'contacts' | 'nobody';
    readReceipts: boolean;
    profilePhotoPrivacy: 'everyone' | 'contacts' | 'nobody';
  };
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name?: string;
  avatarUrl?: string;
  members: string[];
  adminIds?: string[];
  lastMessagePreview?: {
    text?: string;
    senderId?: string;
    createdAt?: Timestamp;
    attachmentType?: 'image' | 'video' | 'file' | null;
  };
  unreadCounts?: { [uid: string]: number };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  pinnedBy?: { [uid: string]: boolean };
  archivedBy?: { [uid: string]: boolean };
}

export interface Attachment {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker';
  size?: number;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content?: string;
  attachments?: Attachment[];
  createdAt: Timestamp;
  editedAt?: Timestamp;
  deletedFor?: string[];
  deliveredTo?: string[];
  readBy?: { [uid: string]: Timestamp };
  reactions?: { [emoji: string]: string[] };
  replyToMessageId?: string;
}

export interface Presence {
  uid: string;
  isOnline: boolean;
  lastSeen: Timestamp;
  currentChatId?: string;
  typing?: boolean;
}
