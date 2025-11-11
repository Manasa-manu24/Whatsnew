import { useState, useRef, ChangeEvent } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStatusUpload } from '@/hooks/useStatusUpload';

interface StatusUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StatusUploader({ open, onOpenChange }: StatusUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'everyone' | 'contacts' | 'close_contacts'>('everyone');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadStatus, uploading, progress } = useStatusUpload();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const result = await uploadStatus(file, {
      caption,
      visibility,
    });

    if (result) {
      // Reset form
      setFile(null);
      setPreview(null);
      setCaption('');
      setVisibility('everyone');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
    setVisibility('everyone');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Status</DialogTitle>
          <DialogDescription>
            Share a photo or video that disappears after 24 hours
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            >
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Click to select media</p>
              <p className="text-xs text-muted-foreground">Images or videos only</p>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 z-10 bg-background/80 rounded-full p-1 hover:bg-background"
                aria-label="Remove media"
              >
                <X className="h-4 w-4" />
              </button>
              {file?.type.startsWith('video/') ? (
                <video src={preview} controls className="w-full max-h-96 object-contain" />
              ) : (
                <img src={preview} alt="Preview" className="w-full max-h-96 object-contain" />
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload media file"
          />

          {file && (
            <>
              <div className="space-y-2">
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Who can see this</Label>
                <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="contacts">My Contacts</SelectItem>
                    <SelectItem value="close_contacts">Close Contacts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={uploading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="flex-1"
                >
                  {uploading ? 'Uploading...' : 'Share Status'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
