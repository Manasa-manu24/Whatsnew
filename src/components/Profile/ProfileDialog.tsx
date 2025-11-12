import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { userProfile, setUserProfile } = useAuthStore();
  const [name, setName] = useState(userProfile?.name || '');
  const [bio, setBio] = useState(userProfile?.about || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(Math.round(progress));
      });

      setAvatarUrl(result.secure_url);
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (!userProfile) return;

    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);

    try {
      const userRef = doc(db, 'users', userProfile.uid);
      const updateData: any = {
        name: name.trim(),
        about: bio.trim() || null,
      };

      if (avatarUrl !== userProfile.avatarUrl) {
        updateData.avatarUrl = avatarUrl;
      }

      await updateDoc(userRef, updateData);

      // Update local state
      setUserProfile({
        ...userProfile,
        name: name.trim(),
        about: bio.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      toast.success('Profile updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and picture
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-32 w-32 cursor-pointer" onClick={handleImageClick}>
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                  {name.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg"
                onClick={handleImageClick}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </Button>
            </div>

            {uploading && (
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/50 characters
            </p>
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={200}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/200 characters
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
