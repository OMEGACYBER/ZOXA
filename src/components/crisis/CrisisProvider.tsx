import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CrisisAlert from './CrisisAlert';

interface CrisisEvent {
  id: string;
  crisis_level: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  context?: string;
  created_at: string;
}

interface CrisisContextType {
  activeCrisis: CrisisEvent | null;
  reportCrisis: (
    level: 'low' | 'medium' | 'high' | 'critical',
    indicators: string[],
    context?: string
  ) => Promise<void>;
  acknowledgeCrisis: () => void;
  dismissCrisis: () => void;
  getCrisisHistory: () => Promise<CrisisEvent[]>;
}

const CrisisContext = createContext<CrisisContextType | undefined>(undefined);

interface CrisisProviderProps {
  children: React.ReactNode;
}

export const CrisisProvider: React.FC<CrisisProviderProps> = ({ children }) => {
  const [activeCrisis, setActiveCrisis] = useState<CrisisEvent | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize user session
  useEffect(() => {
    const initializeUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
        
        // Check for any active crisis events
        const activeCrises = await supabaseService.getActiveCrisisEvents(user.id);
        if (activeCrises.length > 0) {
          // Show the most recent/severe crisis
          const mostSevere = activeCrises.sort((a, b) => {
            const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
            return severityOrder[b.crisis_level] - severityOrder[a.crisis_level];
          })[0];
          
          setActiveCrisis(mostSevere);
        }
      }
    };

    initializeUser();
  }, []);

  const reportCrisis = useCallback(async (
    level: 'low' | 'medium' | 'high' | 'critical',
    indicators: string[],
    context?: string
  ) => {
    if (!currentUser) return;

    try {
      // Save crisis event to database
      const crisisEvent = await supabaseService.saveCrisisEvent(
        currentUser,
        currentConversation || '',
        level,
        indicators,
        context
      );

      if (crisisEvent) {
        setActiveCrisis(crisisEvent);
        
        // Log the crisis event
        await supabaseService.logEvent(
          'crisis_detected',
          {
            level,
            indicators,
            context,
            crisisEventId: crisisEvent.id
          },
          level === 'critical' ? 'critical' : level === 'high' ? 'error' : 'warn',
          currentUser
        );

        // Show toast notification based on severity
        if (level === 'critical' || level === 'high') {
          toast({
            title: 'Crisis Support Available',
            description: level === 'critical' 
              ? 'Immediate help is available. Please consider reaching out to crisis services.'
              : 'Mental health support is available if you need it.',
            variant: 'destructive',
            duration: 0 // Don't auto-dismiss for severe crises
          });
        }
      }
    } catch (error) {
      console.error('Error reporting crisis:', error);
      
      // Still show crisis alert even if database save fails
      setActiveCrisis({
        id: `temp_${Date.now()}`,
        crisis_level: level,
        indicators,
        context,
        created_at: new Date().toISOString()
      });
    }
  }, [currentUser, currentConversation, toast]);

  const acknowledgeCrisis = useCallback(async () => {
    if (!activeCrisis || !currentUser) return;

    try {
      // Mark as acknowledged in database
      await supabaseService.logEvent(
        'crisis_acknowledged',
        { crisisEventId: activeCrisis.id },
        'info',
        currentUser
      );

      toast({
        title: 'Thank you',
        description: 'I\'m here if you need continued support. Your wellbeing matters.',
        duration: 5000
      });
    } catch (error) {
      console.error('Error acknowledging crisis:', error);
    }

    setActiveCrisis(null);
  }, [activeCrisis, currentUser, toast]);

  const dismissCrisis = useCallback(async () => {
    if (!activeCrisis || !currentUser) return;

    try {
      // Log dismissal
      await supabaseService.logEvent(
        'crisis_dismissed',
        { crisisEventId: activeCrisis.id },
        'info',
        currentUser
      );
    } catch (error) {
      console.error('Error dismissing crisis:', error);
    }

    setActiveCrisis(null);
  }, [activeCrisis, currentUser]);

  const getCrisisHistory = useCallback(async (): Promise<CrisisEvent[]> => {
    if (!currentUser) return [];

    try {
      const events = await supabaseService.getActiveCrisisEvents(currentUser);
      return events;
    } catch (error) {
      console.error('Error fetching crisis history:', error);
      return [];
    }
  }, [currentUser]);

  const handleGetHelp = useCallback(() => {
    // Open resources or help page
    window.open('https://suicidepreventionlifeline.org/help-yourself/', '_blank');
    acknowledgeCrisis();
  }, [acknowledgeCrisis]);

  const handleContinueChat = useCallback(() => {
    toast({
      title: 'I\'m here for you',
      description: 'Let\'s continue our conversation. Remember, you can always ask for help.',
      duration: 5000
    });
    acknowledgeCrisis();
  }, [acknowledgeCrisis, toast]);

  const contextValue: CrisisContextType = {
    activeCrisis,
    reportCrisis,
    acknowledgeCrisis,
    dismissCrisis,
    getCrisisHistory
  };

  return (
    <CrisisContext.Provider value={contextValue}>
      {children}
      {activeCrisis && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <CrisisAlert
            crisisLevel={activeCrisis.crisis_level}
            indicators={activeCrisis.indicators}
            context={activeCrisis.context}
            onAcknowledge={acknowledgeCrisis}
            onGetHelp={handleGetHelp}
            onContinueChat={handleContinueChat}
          />
        </div>
      )}
    </CrisisContext.Provider>
  );
};

export const useCrisis = (): CrisisContextType => {
  const context = useContext(CrisisContext);
  if (context === undefined) {
    throw new Error('useCrisis must be used within a CrisisProvider');
  }
  return context;
};

export default CrisisProvider;

