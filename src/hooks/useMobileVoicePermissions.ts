import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

export interface MobileVoicePermissions {
  microphone: 'granted' | 'denied' | 'prompt' | 'checking';
  isNative: boolean;
  isRequesting: boolean;
}

export const useMobileVoicePermissions = () => {
  const [permissions, setPermissions] = useState<MobileVoicePermissions>({
    microphone: 'checking',
    isNative: Capacitor.isNativePlatform(),
    isRequesting: false
  });

  const checkPermissions = useCallback(async () => {
    try {
      // Check if permissions API is available
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissions(prev => ({
            ...prev,
            microphone: permission.state as any,
            isRequesting: false
          }));
          return;
        } catch (permissionError) {
          console.log('Permissions API not fully supported, falling back to getUserMedia test');
        }
      }

      // Fallback: Try to access microphone to check permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true 
          } 
        });
        stream.getTracks().forEach(track => track.stop());
        setPermissions(prev => ({
          ...prev,
          microphone: 'granted',
          isRequesting: false
        }));
      } catch (error: any) {
        if (error.name === 'NotAllowedError') {
          setPermissions(prev => ({
            ...prev,
            microphone: 'denied',
            isRequesting: false
          }));
        } else {
          setPermissions(prev => ({
            ...prev,
            microphone: 'prompt',
            isRequesting: false
          }));
        }
      }
    } catch (error) {
      console.error('Error checking microphone permissions:', error);
      setPermissions(prev => ({
        ...prev,
        microphone: 'prompt',
        isRequesting: false
      }));
    }
  }, []);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    setPermissions(prev => ({ ...prev, isRequesting: true }));
    
    try {
      // Request microphone access with optimized settings for mobile
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimal for speech recognition
          channelCount: 1,    // Mono for mobile performance
          ...(Capacitor.isNativePlatform() && {
            // Mobile-specific optimizations
            volume: 1.0,
            latency: 0.1
          })
        }
      });
      
      // Test successful - clean up and update state
      stream.getTracks().forEach(track => track.stop());
      
      setPermissions(prev => ({
        ...prev,
        microphone: 'granted',
        isRequesting: false
      }));
      
      console.log('✅ Microphone permission granted for mobile');
      return true;
      
    } catch (error: any) {
      console.error('❌ Microphone permission denied:', error);
      
      let status: 'denied' | 'prompt' = 'denied';
      if (error.name === 'NotAllowedError') {
        status = 'denied';
      } else if (error.name === 'NotFoundError') {
        console.error('No microphone found on device');
      } else {
        status = 'prompt';
      }
      
      setPermissions(prev => ({
        ...prev,
        microphone: status,
        isRequesting: false
      }));
      
      return false;
    }
  }, []);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissions,
    requestMicrophonePermission,
    checkPermissions,
    isReady: permissions.microphone !== 'checking'
  };
};
