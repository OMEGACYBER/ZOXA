import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface VoiceSettings {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number;
  pitch: number;
  volume: number;
  naturalPauses: boolean;
  emotionalModulation: boolean;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  crisisAlerts: boolean;
  emotionInsights: boolean;
  dailyReminders: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  voiceSettings: VoiceSettings;
  notificationSettings: NotificationSettings;
  language: string;
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    personalizedResponses: boolean;
  };
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voice: 'nova',
  speed: 1.0,
  pitch: 1.0,
  volume: 1.0,
  naturalPauses: true,
  emotionalModulation: true
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  crisisAlerts: true,
  emotionInsights: true,
  dailyReminders: false
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  voiceSettings: DEFAULT_VOICE_SETTINGS,
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  language: 'en',
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    largeText: false
  },
  privacy: {
    dataCollection: true,
    analytics: true,
    personalizedResponses: true
  }
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadLocalPreferences = () => {
      try {
        const stored = localStorage.getItem('zoxaa-preferences');
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences(prev => ({ ...prev, ...parsed }));
        }
      } catch (error) {
        console.error('Failed to load local preferences:', error);
      }
    };

    loadLocalPreferences();
    setIsLoading(false);
  }, []);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Load preferences from database if user is authenticated
  useEffect(() => {
    const loadDatabasePreferences = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Failed to load preferences from database:', error);
          return;
        }

        if (data) {
          const dbPreferences = data.preferences || {};
          setPreferences(prev => ({ ...prev, ...dbPreferences }));
          
          // Update localStorage with merged preferences
          localStorage.setItem('zoxaa-preferences', JSON.stringify({ ...prev, ...dbPreferences }));
        }
      } catch (error) {
        console.error('Error loading database preferences:', error);
      }
    };

    loadDatabasePreferences();
  }, [userId]);

  // Save preferences to both localStorage and database
  const savePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    
    // Update local state
    setPreferences(updatedPreferences);
    
    // Save to localStorage
    try {
      localStorage.setItem('zoxaa-preferences', JSON.stringify(updatedPreferences));
    } catch (error) {
      console.error('Failed to save preferences to localStorage:', error);
    }

    // Save to database if user is authenticated
    if (userId) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            preferences: updatedPreferences,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Failed to save preferences to database:', error);
          toast({
            title: "Preferences Saved Locally",
            description: "Your preferences have been saved locally. They will sync when you're online.",
            variant: "default"
          });
        } else {
          toast({
            title: "Preferences Saved",
            description: "Your preferences have been saved and synced.",
          });
        }
      } catch (error) {
        console.error('Error saving preferences to database:', error);
      }
    }
  }, [preferences, userId, toast]);

  // Update specific preference sections
  const updateVoiceSettings = useCallback((voiceSettings: Partial<VoiceSettings>) => {
    savePreferences({ voiceSettings: { ...preferences.voiceSettings, ...voiceSettings } });
  }, [preferences.voiceSettings, savePreferences]);

  const updateNotificationSettings = useCallback((notificationSettings: Partial<NotificationSettings>) => {
    savePreferences({ notificationSettings: { ...preferences.notificationSettings, ...notificationSettings } });
  }, [preferences.notificationSettings, savePreferences]);

  const updateTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    savePreferences({ theme });
  }, [savePreferences]);

  const updateAccessibility = useCallback((accessibility: Partial<UserPreferences['accessibility']>) => {
    savePreferences({ accessibility: { ...preferences.accessibility, ...accessibility } });
  }, [preferences.accessibility, savePreferences]);

  const updatePrivacy = useCallback((privacy: Partial<UserPreferences['privacy']>) => {
    savePreferences({ privacy: { ...preferences.privacy, ...privacy } });
  }, [preferences.privacy, savePreferences]);

  // Reset preferences to defaults
  const resetPreferences = useCallback(async () => {
    await savePreferences(DEFAULT_PREFERENCES);
    toast({
      title: "Preferences Reset",
      description: "Your preferences have been reset to default values.",
    });
  }, [savePreferences, toast]);

  // Export preferences
  const exportPreferences = useCallback(() => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zoxaa-preferences-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [preferences]);

  // Import preferences
  const importPreferences = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      // Validate imported preferences
      if (typeof imported === 'object' && imported !== null) {
        await savePreferences(imported);
        toast({
          title: "Preferences Imported",
          description: "Your preferences have been imported successfully.",
        });
      } else {
        throw new Error('Invalid preferences format');
      }
    } catch (error) {
      console.error('Failed to import preferences:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import preferences. Please check the file format.",
        variant: "destructive"
      });
    }
  }, [savePreferences, toast]);

  return {
    preferences,
    isLoading,
    userId,
    savePreferences,
    updateVoiceSettings,
    updateNotificationSettings,
    updateTheme,
    updateAccessibility,
    updatePrivacy,
    resetPreferences,
    exportPreferences,
    importPreferences
  };
};

