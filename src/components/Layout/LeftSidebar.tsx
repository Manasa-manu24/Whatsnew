interface LeftSidebarProps {
  children?: React.ReactNode;
  title?: string;
}

export default function LeftSidebar({ children, title = 'Chats' }: LeftSidebarProps) {
  return (
    <aside className="w-[360px] bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </aside>
  );
}
