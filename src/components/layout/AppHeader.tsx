import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen, Phone } from 'lucide-react';

interface AppHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  title?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ sidebarOpen, onToggleSidebar, title = 'ZOXAA' }) => {
  return (
    <header className="h-12 border-b border-border bg-background/80 backdrop-blur flex items-center px-3 justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </Button>
        <div className="text-sm font-semibold tracking-wide">{title}</div>
      </div>
      <nav className="flex items-center gap-2 text-sm">
        <Link to="/pricing" className="px-2 py-1 rounded hover:bg-muted">Pricing</Link>
        <Link to="/docs" className="px-2 py-1 rounded hover:bg-muted">Docs</Link>
        <Link to="/terms" className="px-2 py-1 rounded hover:bg-muted">Terms</Link>
        <Link to="/privacy" className="px-2 py-1 rounded hover:bg-muted">Privacy</Link>
        <Link to="/voice-chat" className="ml-1">
          <Button size="sm" variant="outline" className="gap-2"><Phone className="w-4 h-4" /> Voice</Button>
        </Link>
      </nav>
    </header>
  );
};

export default AppHeader;
