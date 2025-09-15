import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Mic, 
  MicOff, 
  Brain, 
  User, 
  Volume2, 
  VolumeX,
  BarChart3,
  Activity,
  Zap,
  Heart,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ActivitySquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useZoxaaChat } from "@/hooks/useZoxaaChat";
import useZoxaaVoice from "@/hooks/useZoxaaVoice";
import { VoiceQualityIndicator } from "@/components/voice/VoiceQualityIndicator";

interface VoiceChatInterfaceProps {
  className?: string;
}

const VoiceChatInterface = ({ className }: VoiceChatInterfaceProps) => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [voiceActivity, setVoiceActivity] = useState<number>(0);
  const [showBrowserInfo, setShowBrowserInfo] = useState(false);
  const [showEVI3Metrics, setShowEVI3Metrics] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Enhanced mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  const isPhone = isMobile && !isTablet;
  const isChrome = /Chrome/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  const isEdge = /Edg/.test(navigator.userAgent);
  
  // Screen size detection for better responsiveness
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  // Update screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced mobile detection with screen size
  const isMobileView = isMobile || screenSize.width < 768;
  const isSmallScreen = screenSize.width < 480;

  // Custom hooks
  const { messages, isLoading, sendMessage, clearMessages } = useZoxaaChat();
  const { 
    isRecording, 
    isPlaying, 
    userEmotion,
    isListeningForInterruption, 
    audioLevel,
    voiceQuality,
    conversationInsights,
    startRecording, 
    stopRecording, 
    speakWithEmotion, 
    stopSpeaking,
    analyzeUserEmotion
  } = useZoxaaVoice();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-detect emotion from transcript
  useEffect(() => {
    if (currentEmotion !== userEmotion.primaryEmotion) {
      setCurrentEmotion(userEmotion.primaryEmotion);
    }
  }, [userEmotion.primaryEmotion, currentEmotion]);

  // Simulate voice activity visualization
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setVoiceActivity(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVoiceActivity(0);
    }
  }, [isRecording]);

  const getBrowserInfo = () => {
    const browser = isChrome ? 'Chrome' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : isEdge ? 'Edge' : 'Unknown';
    const device = isMobile ? (isIOS ? 'iOS' : isAndroid ? 'Android' : 'Mobile') : 'Desktop';
    const secure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    
    return { browser, device, secure };
  };

  const handleVoiceToggle = async () => {
    console.log('🎤 handleVoiceToggle called, isVoiceActive:', isVoiceActive);
    if (isVoiceActive) {
      // Stop voice conversation
      console.log('🎤 Stopping voice conversation...');
      setIsVoiceActive(false);
      try {
        await stopRecording();
      } catch (error) {
        console.log('No active recording to stop');
      }
      stopSpeaking();
      toast({
        title: "Voice Chat Ended",
        description: "Switched back to text mode"
      });
    } else {
      // Start voice conversation with enhanced error handling
      console.log('🎤 Starting voice conversation...');
      try {
        await startRecording();
        setIsVoiceActive(true);
        
        const message = isMobileView 
          ? "Voice Intelligence mode active on mobile. Tap to speak."
          : "I'm listening to you with Voice Intelligence emotional analysis...";
          
        toast({
          title: "Voice Intelligence Chat Active",
          description: message
        });
      } catch (error) {
        console.error('Failed to start voice chat:', error);
        
        if (isMobileView) {
          toast({
            title: "Mobile Voice Issue",
            description: "Voice recognition may not work on mobile. Please use text input.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Voice Error",
            description: "Unable to start voice recognition. Please use text input.",
            variant: "destructive"
          });
        }
      }
    }
  };

  const handleSendVoiceMessage = async () => {
    console.log('🎤 handleSendVoiceMessage called, isRecording:', isRecording);
    if (!isRecording) {
      console.log('🎤 Not recording, returning...');
      return;
    }

    try {
      console.log('🎤 Stopping recording to process voice message...');
      const transcribedText = await stopRecording();
      console.log('🎤 Transcribed text:', transcribedText);
      
      if (transcribedText.trim()) {
        const userMessage = transcribedText;
    setConversationHistory(prev => [...prev, `You: ${userMessage}`]);
        
        // Enhanced Voice Intelligence emotional analysis
        const emotionalState = await analyzeUserEmotion(userMessage);
        console.log('🎤 Voice Intelligence Analysis:', {
          text: userMessage,
          emotion: emotionalState?.primaryEmotion || 'neutral',
          intensity: emotionalState?.emotionalIntensity || 0.5,
          crisisLevel: emotionalState?.crisisLevel || 'none'
        });
        
        try {
          console.log('🎤 Sending message to chat...');
          await sendMessage(userMessage);
          
          // Get the last assistant message to speak with Voice Intelligence emotion
          const lastAssistantMessage = messages
            .slice()
            .reverse()
            .find(msg => msg.role === 'assistant');
             
          if (lastAssistantMessage) {
            console.log('🎤 Speaking assistant response with emotion...');
            // Speak with full Voice Intelligence emotional adaptation
            await speakWithEmotion(lastAssistantMessage.content, emotionalState);
          }
    } catch (error) {
      console.error('Failed to process voice message:', error);
          toast({
            title: "Voice Processing Error",
            description: "I couldn't process your message. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        console.log('🎤 No transcribed text, skipping...');
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      toast({
        title: "Recording Error",
        description: "I couldn't process your voice. Please try again.",
        variant: "destructive"
      });
    }
  };

     // Enhanced Voice Intelligence interruption handling
  const handleInterrupt = () => {
     console.log('🔄 Voice Intelligence Interruption: User manually interrupted');
    stopSpeaking();
    toast({
      title: "Interrupted",
       description: "Stopped ZOXAA's response - Voice Intelligence interruption detected"
    });
  };

   // Real-time Voice Intelligence status monitoring
   useEffect(() => {
     if (isListeningForInterruption) {
       console.log('🎤 Voice Intelligence: Listening for interruptions with adaptive thresholds');
     }
   }, [isListeningForInterruption]);

   useEffect(() => {
     if (isPlaying) {
       console.log('🗣️ Voice Intelligence: ZOXAA speaking with emotional adaptation');
     }
   }, [isPlaying]);

   useEffect(() => {
     if (isRecording) {
       console.log('🎙️ Voice Intelligence: Recording user input for emotional analysis');
     }
   }, [isRecording]);

  return (
    <div className={cn(
      "flex flex-col h-full bg-gradient-background",
      isMobileView && "min-h-screen",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm",
        isMobileView ? "p-3" : "p-4"
      )}>
        <div className="flex items-center gap-3">
          <Avatar className={cn(
            "bg-gradient-primary",
            isMobileView ? "w-8 h-8" : "w-10 h-10"
          )}>
            <AvatarFallback className="bg-transparent">
              <Brain className={cn(
                "text-primary-foreground",
                isMobileView ? "w-4 h-4" : "w-5 h-5"
              )} />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className={cn(
              "font-semibold",
              isMobileView ? "text-sm" : "text-base"
              )}>ZOXAA Voice Intelligence ⚡</h2>
            <p className={cn(
              "text-muted-foreground",
              isMobileView ? "text-xs" : "text-sm"
            )}>
                               {!isVoiceActive 
                  ? "Ultra-fast emotional intelligence voice chat ready ⚡" 
                  : "Real-time emotional voice conversation (optimized)"
              }
            </p>
        </div>
      </div>

                 {/* Voice Intelligence Metrics Toggle */}
         <Button
           onClick={() => setShowEVI3Metrics(!showEVI3Metrics)}
           className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-9 px-3"
         >
           <ActivitySquare className={cn(
                isMobileView ? "w-4 h-4" : "w-5 h-5"
              )} />
           {!isMobileView && <span className="ml-1">Voice IQ</span>}
            </Button>
          </div>
          
             {/* Voice Intelligence Status Indicator */}
       {isVoiceActive && (
        <div className={cn(
           "bg-purple-500/10 border-purple-500/20 border-b",
          isMobileView ? "p-3" : "p-4"
         )}>
           <div className={cn(
             "flex items-center justify-between mb-2",
             isMobileView && "flex-col gap-2 items-start"
        )}>
          <div className="flex items-center gap-2">
               <Brain className={cn(
                 "text-purple-500",
                 isMobileView ? "w-3 h-3" : "w-4 h-4"
            )} />
            <span className={cn(
                 "font-medium text-purple-700 dark:text-purple-300",
              isMobileView ? "text-xs" : "text-sm"
               )}>ZOXAA Voice Intelligence Active</span>
        </div>
          <div className="flex items-center gap-2">
              <Heart className={cn(
                currentEmotion === 'joy' ? "text-red-500" : "text-purple-500",
                isMobileView ? "w-3 h-3" : "w-4 h-4"
            )} />
            <span className={cn(
                "text-purple-700 dark:text-purple-300 capitalize",
              isMobileView ? "text-xs" : "text-sm"
              )}>{currentEmotion}</span>
            </div>
          </div>
          
                     {/* Voice Intelligence Features Status */}
           <div className="flex items-center gap-4 text-xs text-purple-600 dark:text-purple-400">
             <div className="flex items-center gap-1">
               <CheckCircle className="w-3 h-3" />
               <span>Emotional Modulation</span>
             </div>
             <div className="flex items-center gap-1">
               <CheckCircle className="w-3 h-3" />
               <span>Natural Pauses</span>
             </div>
             <div className="flex items-center gap-1">
               <CheckCircle className="w-3 h-3" />
               <span>Adaptive Voice</span>
             </div>
             {userEmotion.crisisLevel !== 'none' && (
               <div className="flex items-center gap-1">
                 <AlertTriangle className="w-3 h-3 text-red-500" />
                 <span className="text-red-600">Crisis Aware</span>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Voice Activity Visualization */}
      {isVoiceActive && (
        <div className={cn(
          "bg-accent/5 border-b border-accent/20",
          isMobileView ? "p-3" : "p-4"
        )}>
          <div className={cn(
            "flex items-center justify-between mb-2",
            isMobileView && "flex-col gap-2 items-start"
          )}>
            <div className="flex items-center gap-2">
              <Activity className={cn(
                "text-accent",
                isMobileView ? "w-3 h-3" : "w-4 h-4"
              )} />
              <span className={cn(
                "font-medium text-accent",
                isMobileView ? "text-xs" : "text-sm"
               )}>Voice Intelligence Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className={cn(
                "text-green-500",
                isMobileView ? "w-3 h-3" : "w-4 h-4"
              )} />
              <span className={cn(
                "text-muted-foreground",
                isMobileView ? "text-xs" : "text-sm"
              )}>Real-time Analysis</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 h-8">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 bg-accent/20 rounded-sm transition-all duration-100",
                  isRecording && voiceActivity > i * 5 && "bg-purple-500 animate-pulse"
                )}
                style={{
                  height: `${Math.max(10, voiceActivity * 0.3)}%`
                }}
              />
            ))}
          </div>
        </div>
      )}

             {/* Voice Intelligence Status Indicator */}
       <div className={cn(
         "border-b border-border bg-card/30 backdrop-blur-sm",
         isMobileView ? "p-2" : "p-3"
       )}>
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             {/* Voice Intelligence Emotional State */}
            <div className="flex items-center gap-2">
              <Heart className={cn(
                "text-red-500",
                isMobileView ? "w-4 h-4" : "w-5 h-5"
              )} />
              <span className={cn(
                "font-medium",
                isMobileView ? "text-xs" : "text-sm"
              )}>
                {userEmotion.primaryEmotion.charAt(0).toUpperCase() + userEmotion.primaryEmotion.slice(1)}
              </span>
              <div className={cn(
                "w-2 h-2 rounded-full",
                userEmotion.crisisLevel === 'critical' ? "bg-red-500 animate-pulse" :
                userEmotion.stress > 0.7 ? "bg-orange-500" :
                userEmotion.pleasure > 0.5 ? "bg-green-500" : "bg-blue-500"
              )} />
            </div>

                         {/* Voice Intelligence Activity Status */}
             <div className="flex items-center gap-2">
               {isRecording && (
                 <div className="flex items-center gap-1">
                   <Mic className="w-4 h-4 text-purple-500 animate-pulse" />
                   <span className="text-xs text-purple-600">Recording</span>
                 </div>
               )}
               {isPlaying && (
                 <div className="flex items-center gap-1">
                   <Volume2 className="w-4 h-4 text-green-500" />
                   <span className="text-xs text-green-600">Speaking</span>
                 </div>
               )}
               {isListeningForInterruption && (
                 <div className="flex items-center gap-1">
                   <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                   <span className="text-xs text-blue-600">Listening</span>
                 </div>
               )}
             </div>
           </div>

           {/* Voice Intelligence Metrics */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              Intensity: {(userEmotion.emotionalIntensity * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Stress: {(userEmotion.stress * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={cn(
        "flex-1 overflow-y-auto space-y-4",
        isMobileView ? "p-3" : "p-4"
      )}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <Avatar className={cn(
                "bg-gradient-primary",
                isMobileView ? "w-6 h-6" : "w-8 h-8"
              )}>
                <AvatarFallback className="bg-transparent">
                  <Brain className={cn(
                    "text-primary-foreground",
                    isMobileView ? "w-3 h-3" : "w-4 h-4"
                  )} />
                </AvatarFallback>
              </Avatar>
            )}

            <Card className={cn(
              "bg-gradient-card group relative",
              message.role === "user" 
                ? "bg-gradient-primary text-primary-foreground" 
                : "border-primary/20",
              isMobileView ? "max-w-[90%] p-3" : "max-w-[80%] p-4"
            )}>
              <p className={cn(
                "leading-relaxed",
                isMobileView ? "text-xs" : "text-sm"
              )}>{message.content}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 opacity-70">
                  <MessageCircle className={cn(
                    isMobileView ? "w-2 h-2" : "w-3 h-3"
                  )} />
                  <span className={cn(
                    isMobileView ? "text-xs" : "text-xs"
                  )}>
                    {new Date().toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            </Card>

            {message.role === "user" && (
              <Avatar className={cn(
                "bg-secondary",
                isMobileView ? "w-6 h-6" : "w-8 h-8"
              )}>
                <AvatarFallback className="bg-transparent">
                  <User className={cn(
                    "text-secondary-foreground",
                    isMobileView ? "w-3 h-3" : "w-4 h-4"
                  )} />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className={cn(
              "bg-gradient-primary",
              isMobileView ? "w-6 h-6" : "w-8 h-8"
            )}>
              <AvatarFallback className="bg-transparent">
                <Brain className={cn(
                  "text-primary-foreground",
                  isMobileView ? "w-3 h-3" : "w-4 h-4"
                )} />
              </AvatarFallback>
            </Avatar>
            <Card className={cn(
              "bg-ai-thinking/20 border-primary/20",
              isMobileView ? "p-3" : "p-4"
            )}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className={cn(
                    "bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]",
                    isMobileView ? "w-1.5 h-1.5" : "w-2 h-2"
                  )}></div>
                  <div className={cn(
                    "bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]",
                    isMobileView ? "w-1.5 h-1.5" : "w-2 h-2"
                  )}></div>
                  <div className={cn(
                    "bg-purple-500 rounded-full animate-bounce",
                    isMobileView ? "w-1.5 h-1.5" : "w-2 h-2"
                  )}></div>
                </div>
                <span className={cn(
                  "text-muted-foreground",
                  isMobileView ? "text-xs" : "text-sm"
                                 )}>ZOXAA Voice Intelligence is thinking...</span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Controls */}
      <div className={cn(
        "border-t border-border bg-card/50 backdrop-blur-sm",
        isMobileView ? "p-3" : "p-4"
      )}>
        {isVoiceActive ? (
          <div className="space-y-4">
            {/* Voice Control Buttons */}
            <div className={cn(
              "flex items-center justify-center gap-4",
              isMobileView && "flex-col gap-2"
            )}>
              <Button
                onClick={isRecording ? handleSendVoiceMessage : startRecording}
                className={cn(
                  isRecording ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700",
                  isMobileView ? "h-10 px-4 py-2 w-full" : "h-11 px-8 py-2"
                )}
              >
                {isRecording ? (
                  <>
                    <Mic className={cn("mr-2", isMobileView ? "w-4 h-4" : "w-5 h-5")} />
                    Send Voice Message
                  </>
                ) : (
                  <>
                    <Mic className={cn("mr-2", isMobileView ? "w-4 h-4" : "w-5 h-5")} />
                    Start Recording
                  </>
                )}
              </Button>

              <Button
                onClick={isPlaying ? handleInterrupt : undefined}
                disabled={!isPlaying}
                className={cn(
                  isPlaying ? "bg-destructive hover:bg-destructive/90" : "bg-secondary hover:bg-secondary/80",
                  isMobileView ? "h-10 px-4 py-2 w-full" : "h-11 px-8 py-2"
                )}
              >
                {isPlaying ? (
                  <>
                    <VolumeX className={cn("mr-2", isMobileView ? "w-4 h-4" : "w-5 h-5")} />
                    Interrupt
                  </>
                ) : (
                  <>
                    <Volume2 className={cn("mr-2", isMobileView ? "w-4 h-4" : "w-5 h-5")} />
                    Zoxaa Speaking
                  </>
                )}
              </Button>

              <Button
                onClick={handleVoiceToggle}
                className={cn(
                  "bg-destructive hover:bg-destructive/90 animate-pulse",
                  isMobileView ? "h-10 px-4 py-2 w-full" : "h-11 px-8 py-2"
                )}
              >
                <MicOff className={cn("mr-2", isMobileView ? "w-4 h-4" : "w-5 h-5")} />
                                 End Voice Intelligence Chat
              </Button>
            </div>

            {/* Status Indicators */}
            <div className={cn(
              "flex items-center justify-center text-xs text-muted-foreground",
              isMobileView ? "flex-col gap-2" : "gap-6"
            )}>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isRecording ? "bg-green-500 animate-pulse" : "bg-muted"
                )} />
                <span>Listening</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isPlaying ? "bg-purple-500 animate-pulse" : "bg-muted"
                )} />
                <span>Speaking</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isLoading ? "bg-yellow-500 animate-pulse" : "bg-muted"
                )} />
                <span>Thinking</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isListeningForInterruption ? "bg-blue-500 animate-pulse" : "bg-muted"
                )} />
                                 <span>Voice IQ Active</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <h3 className={cn(
                "font-semibold mb-2",
                isMobileView ? "text-sm" : "text-base"
              )}>
                                 Start Voice Intelligence Conversation
              </h3>
              <p className={cn(
                "text-muted-foreground mb-4",
                isMobileView ? "text-xs" : "text-sm"
              )}>
                                 Experience ZOXAA with advanced emotional intelligence and natural voice interaction
              </p>
            </div>
            
              <Button
                onClick={handleVoiceToggle}
                className={cn(
                "bg-purple-600 hover:bg-purple-700 animate-pulse",
                isMobileView ? "h-10 px-4 py-2 w-full max-w-xs" : "h-11 px-8 py-2"
                )}
              >
              <Brain className={cn("mr-2", isMobileView ? "w-4 h-4" : "w-5 h-5")} />
                             Start Voice Intelligence Chat
              </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4 text-center">
          {isVoiceActive 
                ? isMobileView 
               ? "Voice Intelligence mobile mode • Tap to speak • Advanced emotional intelligence"
               : "Voice Intelligence real-time conversation • Emotional adaptation • Natural flow"
                : isMobileView
               ? "Tap to start Voice Intelligence conversation with ZOXAA"
               : "Click to start a Voice Intelligence conversation with ZOXAA"
          }
        </p>
      </div>

             {/* Voice Intelligence Quality Indicator */}
      {showEVI3Metrics && (
        <VoiceQualityIndicator
          audioLevel={audioLevel}
          isListening={isRecording}
          isSpeaking={isPlaying}
          emotionalState={userEmotion}
          conversationInsights={conversationInsights}
          evi3Features={{
            emotionalModulation: true,
            naturalPauses: true,
            adaptiveVoice: true,
            crisisAware: userEmotion.crisisLevel !== 'none'
          }}
        />
      )}
    </div>
  );
};

export default VoiceChatInterface; 