import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useStatus } from '@/hooks/useStatus';
import { useChats } from '@/hooks/useChats';
import { useChatStore } from '@/stores/chatStore';
import AuthPage from '@/components/auth/AuthPage';
import ChatWindow from '@/components/chat/ChatWindow';
import WhatsnewHeader from '@/components/Layout/WhatsnewHeader';
import LeftSidebar from '@/components/Layout/LeftSidebar';
import VerticalNav from '@/components/Layout/VerticalNav';
import BottomNavMobile from '@/components/Layout/BottomNavMobile';
import StatusList from '@/components/Status/StatusList';
import StatusUploader from '@/components/Status/StatusUploader';
import StatusViewer from '@/components/Status/StatusViewer';
import ProfileDialog from '@/components/Profile/ProfileDialog';
import SettingsDialog from '@/components/Settings/SettingsDialog';
import Calls from '@/pages/Calls';
import ChatListContainer from '@/components/chat/ChatListContainer';
import { UserStatus } from '@/hooks/useStatus';
import { useIsMobile } from '@/hooks/use-mobile';

type TabType = 'chats' | 'updates' | 'calls' | 'contacts';

const Index = () => {
  const { currentUser, loading } = useAuthStore();
  const { statuses } = useStatus();
  const { currentChatId } = useChatStore();
  const isMobile = useIsMobile();
  
  useChats(); // Initialize chats
  
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [showStatusUploader, setShowStatusUploader] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  const handleOpenCamera = () => {
    setActiveTab('updates');
    setShowStatusUploader(true);
  };

  const handleViewStatus = (userStatus: UserStatus) => {
    setSelectedStatus(userStatus);
  };

  const renderSidebarContent = () => {
    switch (activeTab) {
      case 'chats':
        return <ChatListContainer />;
      case 'updates':
        return (
          <StatusList
            statuses={statuses}
            onViewStatus={handleViewStatus}
            onCreateStatus={() => setShowStatusUploader(true)}
          />
        );
      case 'calls':
        return <Calls />;
      case 'contacts':
        return (
          <div className="flex items-center justify-center h-full p-8 text-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">Contacts</h3>
              <p className="text-muted-foreground text-sm">Contact management coming soon</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getSidebarTitle = () => {
    switch (activeTab) {
      case 'chats':
        return 'Chats';
      case 'updates':
        return 'Updates';
      case 'calls':
        return 'Calls';
      case 'contacts':
        return 'Contacts';
      default:
        return 'Chats';
    }
  };

  // On mobile, when a chat is selected, show only the chat window
  const showChatWindow = isMobile && currentChatId && activeTab === 'chats';

  return (
    <>
      <div className="h-screen flex bg-background overflow-hidden">
        {isMobile ? (
          // Mobile Layout
          <div className="flex-1 flex flex-col w-full max-w-full">
            {/* Header - hide on mobile when chat is open */}
            {!showChatWindow && (
              <WhatsnewHeader
                onOpenScan={() => console.log('Scan')}
                onOpenCamera={handleOpenCamera}
                onOpenSettings={() => setShowSettingsDialog(true)}
                showSearch={activeTab === 'chats'}
              />
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-hidden relative">
              {showChatWindow ? (
                <ChatWindow />
              ) : (
                <div className="h-full pb-16 safe-bottom">
                  {renderSidebarContent()}
                </div>
              )}
            </div>

            {/* Mobile Bottom Navigation - hide when chat is open */}
            {!showChatWindow && (
              <BottomNavMobile
                activeTab={activeTab as 'chats' | 'updates' | 'calls'}
                onTabChange={(tab) => setActiveTab(tab)}
              />
            )}
          </div>
        ) : (
          // Desktop Layout - Three columns
          <>
            {/* Vertical Navigation Sidebar */}
            <VerticalNav 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              onProfileClick={() => setShowProfileDialog(true)}
              onSettingsClick={() => setShowSettingsDialog(true)}
            />

            {/* Middle Panel - Chat List / Updates / Calls */}
            <LeftSidebar title={getSidebarTitle()}>
              {renderSidebarContent()}
            </LeftSidebar>

            {/* Right Panel - Chat Window / Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
              {activeTab === 'chats' ? (
                <ChatWindow />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted/20">
                  <div className="text-center p-8">
                    <h3 className="text-lg font-semibold mb-2">
                      {activeTab === 'updates' && 'Status Updates'}
                      {activeTab === 'calls' && 'Calls'}
                      {activeTab === 'contacts' && 'Contacts'}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Select an item to view details
                    </p>
                  </div>
                </div>
              )}
            </main>
          </>
        )}
      </div>

      {/* Status Uploader Modal */}
      <StatusUploader open={showStatusUploader} onOpenChange={setShowStatusUploader} />

      {/* Status Viewer */}
      {selectedStatus && (
        <StatusViewer
          userStatus={selectedStatus}
          open={!!selectedStatus}
          onClose={() => setSelectedStatus(null)}
          onReply={(statusId, message) => {
            console.log('Reply to status:', statusId, message);
            // TODO: Implement reply functionality
          }}
        />
      )}

      {/* Profile Dialog */}
      <ProfileDialog open={showProfileDialog} onOpenChange={setShowProfileDialog} />

      {/* Settings Dialog */}
      <SettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
    </>
  );
};

export default Index;
