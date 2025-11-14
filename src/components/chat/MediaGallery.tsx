import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Message } from '@/lib/types';
import { Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import VideoLightbox from './VideoLightbox';

interface MediaGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: Message[];
}

export default function MediaGallery({ open, onOpenChange, messages }: MediaGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Extract all images and videos from messages
  const mediaMessages = messages.filter(msg => msg.attachments && msg.attachments.length > 0);
  
  const images = mediaMessages.flatMap(msg => 
    msg.attachments?.filter(att => att.type === 'image').map(att => ({
      url: att.url,
      id: att.id,
      timestamp: msg.createdAt
    })) || []
  );

  const videos = mediaMessages.flatMap(msg => 
    msg.attachments?.filter(att => att.type === 'video').map(att => ({
      url: att.url,
      id: att.id,
      timestamp: msg.createdAt
    })) || []
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Media Gallery</DialogTitle>
            <DialogDescription>
              View all images and videos shared in this chat
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="images" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="images" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Images ({images.length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <VideoIcon className="h-4 w-4" />
                Videos ({videos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="flex-1 overflow-y-auto mt-4">
              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                  <p>No images shared yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {images.map((img) => (
                    <div 
                      key={img.id}
                      className="aspect-square cursor-pointer hover:opacity-80 transition-opacity rounded-lg overflow-hidden border border-border"
                      onClick={() => setSelectedImage(img.url)}
                    >
                      <img 
                        src={img.url} 
                        alt="Media" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos" className="flex-1 overflow-y-auto mt-4">
              {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <VideoIcon className="h-16 w-16 mb-4 opacity-50" />
                  <p>No videos shared yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {videos.map((vid) => (
                    <div 
                      key={vid.id}
                      className="aspect-square cursor-pointer hover:opacity-80 transition-opacity rounded-lg overflow-hidden border border-border relative group"
                      onClick={() => setSelectedVideo(vid.url)}
                    >
                      <video 
                        src={vid.url} 
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-black/70 transition-colors">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Lightbox components */}
      <ImageLightbox 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />

      <VideoLightbox 
        videoUrl={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
      />
    </>
  );
}
