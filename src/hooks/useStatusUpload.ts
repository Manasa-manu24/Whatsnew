import { useState } from 'react';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { toast } from '@/hooks/use-toast';

export interface StatusUploadData {
  caption?: string;
  visibility?: 'everyone' | 'contacts' | 'close_contacts';
}

export function useStatusUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { userProfile } = useAuthStore();

  const uploadStatus = async (file: File, data: StatusUploadData = {}) => {
    if (!userProfile) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload status',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(file, (progress) => {
        setProgress(progress);
      });

      // Generate thumbnail URL with Cloudinary transformation
      const thumbnailUrl = uploadResult.secure_url.replace(
        '/upload/',
        '/upload/w_480,h_853,c_fill,q_auto,f_auto/'
      );

      // Calculate expiry (24 hours from now)
      const expiresAt = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000);

      // Save to Firestore
      const statusRef = collection(db, 'status', userProfile.uid, 'items');
      const docRef = await addDoc(statusRef, {
        userId: userProfile.uid,
        mediaUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        thumbnailUrl,
        caption: data.caption || '',
        visibility: data.visibility || 'everyone',
        createdAt: serverTimestamp(),
        expiresAt,
        viewers: [],
      });

      toast({
        title: 'Status uploaded',
        description: 'Your status has been shared',
      });

      setProgress(100);
      return docRef.id;
    } catch (error) {
      console.error('Error uploading status:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload status. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return { uploadStatus, uploading, progress };
}
