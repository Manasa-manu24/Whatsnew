import { Search, QrCode, Camera, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WhatsnewHeaderProps {
  onOpenScan?: () => void;
  onOpenCamera?: () => void;
  onOpenSettings?: () => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export default function WhatsnewHeader({
  onOpenScan,
  onOpenCamera,
  onOpenSettings,
  showSearch = false,
  onSearch,
}: WhatsnewHeaderProps) {
  return (
    <header className="bg-card border-b border-border h-14 min-h-[3.5rem] flex items-center px-4 gap-2 md:gap-4 flex-shrink-0">
      <h1 className="text-base md:text-lg font-semibold text-foreground whitespace-nowrap">WhatsNew</h1>
      
      {showSearch && (
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search or start new chat"
              className="pl-10 bg-background"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 min-h-[2.25rem] min-w-[2.25rem]"
                onClick={onOpenScan}
                aria-label="Scan QR code"
              >
                <QrCode className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Scan QR code</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 min-h-[2.25rem] min-w-[2.25rem]"
                onClick={onOpenCamera}
                aria-label="Camera"
              >
                <Camera className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Camera</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 min-h-[2.25rem] min-w-[2.25rem]"
                onClick={onOpenSettings}
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
