import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, Heart, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrisisAlertProps {
  crisisLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  context?: string;
  onAcknowledge?: () => void;
  onGetHelp?: () => void;
  onContinueChat?: () => void;
  className?: string;
}

const CRISIS_CONFIG = {
  low: {
    title: 'Emotional Support Available',
    color: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    iconColor: 'text-yellow-600',
    description: 'I notice you might be going through something difficult. I\'m here to listen and support you.',
  },
  medium: {
    title: 'Mental Health Check-In',
    color: 'border-orange-200 bg-orange-50 text-orange-800', 
    iconColor: 'text-orange-600',
    description: 'I want to make sure you\'re okay. It seems like you might be experiencing some emotional distress.',
  },
  high: {
    title: 'Immediate Support Recommended',
    color: 'border-red-200 bg-red-50 text-red-800',
    iconColor: 'text-red-600',
    description: 'I\'m concerned about your wellbeing. Please consider reaching out to a mental health professional or crisis support service.',
  },
  critical: {
    title: 'Crisis Support Needed',
    color: 'border-red-500 bg-red-100 text-red-900',
    iconColor: 'text-red-700',
    description: 'I\'m very concerned about you right now. Please reach out for immediate help from a crisis hotline or emergency services.',
  }
};

const CRISIS_RESOURCES = {
  low: [
    { name: 'Continue talking with ZOXAA', action: 'continue', icon: MessageSquare },
    { name: 'Learn about self-care', action: 'selfcare', icon: Heart },
  ],
  medium: [
    { name: 'Continue our conversation', action: 'continue', icon: MessageSquare },
    { name: 'Mental health resources', action: 'resources', icon: Heart },
    { name: 'Talk to someone now', action: 'help', icon: Phone },
  ],
  high: [
    { name: 'Crisis Text Line: Text HOME to 741741', action: 'textline', icon: MessageSquare },
    { name: 'National Suicide Prevention Lifeline', action: 'lifeline', icon: Phone },
    { name: 'Continue with ZOXAA support', action: 'continue', icon: Heart },
  ],
  critical: [
    { name: 'Call 988 - Suicide & Crisis Lifeline', action: 'emergency', icon: Phone },
    { name: 'Text HOME to 741741', action: 'textline', icon: MessageSquare },
    { name: 'Call 911 if in immediate danger', action: '911', icon: AlertTriangle },
  ]
};

export const CrisisAlert: React.FC<CrisisAlertProps> = ({
  crisisLevel,
  indicators,
  context,
  onAcknowledge,
  onGetHelp,
  onContinueChat,
  className
}) => {
  const config = CRISIS_CONFIG[crisisLevel];
  const resources = CRISIS_RESOURCES[crisisLevel];

  const handleAction = (action: string) => {
    switch (action) {
      case 'continue':
        onContinueChat?.();
        break;
      case 'help':
      case 'resources':
      case 'selfcare':
        onGetHelp?.();
        break;
      case 'emergency':
        window.open('tel:988', '_blank');
        break;
      case 'textline':
        window.open('sms:741741?body=HOME', '_blank');
        break;
      case '911':
        window.open('tel:911', '_blank');
        break;
      case 'lifeline':
        window.open('tel:988', '_blank');
        break;
      default:
        onAcknowledge?.();
    }
  };

  return (
    <Alert className={cn(config.color, 'border-2 shadow-lg', className)}>
      <AlertTriangle className={cn('h-5 w-5', config.iconColor)} />
      <AlertTitle className="text-lg font-semibold mb-2">
        {config.title}
      </AlertTitle>
      <AlertDescription className="space-y-4">
        <p className="text-sm leading-relaxed">
          {config.description}
        </p>
        
        {indicators.length > 0 && (
          <div className="text-xs opacity-75">
            <p className="font-medium mb-1">What I noticed:</p>
            <ul className="list-disc list-inside space-y-1">
              {indicators.slice(0, 3).map((indicator, index) => (
                <li key={index}>{indicator}</li>
              ))}
            </ul>
          </div>
        )}

        {context && crisisLevel !== 'low' && (
          <div className="text-xs opacity-75">
            <p className="font-medium">Recent context:</p>
            <p className="italic">"{context}"</p>
          </div>
        )}

        <div className="grid gap-2 mt-4">
          {resources.map((resource, index) => {
            const IconComponent = resource.icon;
            return (
              <Button
                key={index}
                variant={resource.action === 'emergency' || resource.action === '911' ? 'destructive' : 
                        resource.action === 'continue' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleAction(resource.action)}
                className={cn(
                  'justify-start text-left h-auto py-2 px-3',
                  resource.action === 'emergency' && 'animate-pulse bg-red-600 hover:bg-red-700',
                  resource.action === '911' && 'animate-pulse bg-red-700 hover:bg-red-800'
                )}
              >
                <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{resource.name}</span>
              </Button>
            );
          })}
        </div>

        {(crisisLevel === 'high' || crisisLevel === 'critical') && (
          <div className="text-xs text-center pt-2 border-t border-current/20">
            <p className="font-medium">You are not alone. Help is available 24/7.</p>
            <p>These services are free, confidential, and staffed by trained counselors.</p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default CrisisAlert;

