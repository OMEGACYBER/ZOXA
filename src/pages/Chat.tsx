import { useState } from "react";
import ChatInterface from "@/components/chat/ChatInterface";
import VoiceChatInterface from "@/components/chat/VoiceChatInterface";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Home,
  Plus,
  Clock,
  Mic,
  MessageCircle,
  Phone,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/layout/AppHeader";

const Chat = () => {
  const [chatMode, setChatMode] = useState<"text" | "voice">("text");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen bg-gradient-background flex flex-col">
      <AppHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} title="ZOXAA" />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={cn(
          "bg-card/50 backdrop-blur-sm border-r border-border flex flex-col transition-all duration-300",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden"
        )}>
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Zoxaa
                </h1>
                <p className="text-sm text-muted-foreground">Your AI Companion</p>
              </div>
            </div>

            {/* Chat Mode Toggle */}
            <div className="mt-3">
              <div className="flex bg-muted rounded-lg p-1">
                <Button 
                  variant={chatMode === "text" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setChatMode("text")}
                  className="flex-1 gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Text
                </Button>
                <Button 
                  variant={chatMode === "voice" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setChatMode("voice")}
                  className="flex-1 gap-2"
                >
                  <Mic className="w-4 h-4" />
                  Voice
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    variant="empathy" 
                    className="w-full justify-start gap-2" 
                    size="sm"
                    onClick={() => window.location.href = '/voice-chat'}
                  >
                    <Phone className="w-4 h-4" />
                    Voice Call
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Recent Conversations</h3>
                <div className="space-y-1">
                  {["How are you feeling today?","Tell me about your day","What's on your mind?","Let's talk about anything"].map((topic, index) => (
                    <Button key={index} variant="ghost" className="w-full justify-start text-sm" size="sm">
                      <Clock className="w-3 h-3 mr-2" />
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative">
          {!sidebarOpen && (
            <div className="absolute top-3 left-3 z-10">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <PanelLeftOpen className="w-5 h-5" />
              </Button>
            </div>
          )}
          {chatMode === "text" ? (
            <ChatInterface />
          ) : (
            <VoiceChatInterface />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;