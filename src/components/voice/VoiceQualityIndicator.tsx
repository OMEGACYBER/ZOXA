import React from 'react';
import { Volume2, Zap, TrendingUp, Activity, Brain, Heart, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdvancedEmotionalState } from '@/utils/advancedVoiceAnalysis';

interface VoiceQualityIndicatorProps {
  audioLevel: number;
  isListening: boolean;
  isSpeaking: boolean;
  emotionalState?: AdvancedEmotionalState;
  voiceStats?: {
    totalWords: number;
    averageResponseTime: number;
    emotionalAccuracy: number;
  };
  conversationInsights?: {
    emotionalTrend: string;
    engagementLevel: string;
    averageResponseTime: number;
    interruptionRate: number;
    personalityEvolution: any;
    needsAttention: boolean;
    crisisRisk: boolean;
  };
  evi3Features?: {
    emotionalModulation: boolean;
    naturalPauses: boolean;
    adaptiveVoice: boolean;
    crisisAware: boolean;
  };
}

export const VoiceQualityIndicator: React.FC<VoiceQualityIndicatorProps> = ({
  audioLevel,
  isListening,
  isSpeaking,
  emotionalState,
  voiceStats,
  conversationInsights,
  evi3Features
}) => {
  const getEmotionalColor = (emotion: string, value: number) => {
    if (value > 0.7) return 'text-green-500';
    if (value > 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAudioLevelColor = (level: number) => {
    if (level > 0.7) return 'bg-green-500';
    if (level > 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEmotionalTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-500" />
          EVI3 Voice Quality
        </h3>
        <div className="flex items-center space-x-2">
          {isListening && (
            <div className="flex items-center text-blue-500">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-xs ml-1">Listening</span>
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center text-green-500">
              <Volume2 className="w-4 h-4" />
              <span className="text-xs ml-1">Speaking</span>
            </div>
          )}
        </div>
      </div>

      {/* EVI3 Features Status */}
      {evi3Features && (
        <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-md">
          <h4 className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">EVI3 Features</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-600 dark:text-purple-400">Emotional Modulation</span>
              <CheckCircle className={cn("w-3 h-3", evi3Features.emotionalModulation ? "text-green-500" : "text-gray-400")} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-600 dark:text-purple-400">Natural Pauses</span>
              <CheckCircle className={cn("w-3 h-3", evi3Features.naturalPauses ? "text-green-500" : "text-gray-400")} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-600 dark:text-purple-400">Adaptive Voice</span>
              <CheckCircle className={cn("w-3 h-3", evi3Features.adaptiveVoice ? "text-green-500" : "text-gray-400")} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-600 dark:text-purple-400">Crisis Aware</span>
              <AlertTriangle className={cn("w-3 h-3", evi3Features.crisisAware ? "text-red-500" : "text-gray-400")} />
            </div>
          </div>
        </div>
      )}

      {/* Audio Level Indicator */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">Audio Level</span>
          <span className="text-xs font-medium">{Math.round(audioLevel * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn("h-2 rounded-full transition-all duration-200", getAudioLevelColor(audioLevel))}
            style={{ width: `${audioLevel * 100}%` }}
          />
        </div>
      </div>

      {/* Advanced Emotional State */}
      {emotionalState && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Heart className="w-3 h-3" />
            Emotional Intelligence
          </h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Pleasure</span>
              <span className={cn("text-xs font-medium", getEmotionalColor('pleasure', emotionalState.pleasure))}>
                {Math.round(emotionalState.pleasure * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Arousal</span>
              <span className={cn("text-xs font-medium", getEmotionalColor('arousal', emotionalState.arousal))}>
                {Math.round(emotionalState.arousal * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Stress</span>
              <span className={cn("text-xs font-medium", getEmotionalColor('stress', emotionalState.stress))}>
                {Math.round(emotionalState.stress * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Stability</span>
              <span className={cn("text-xs font-medium", getEmotionalColor('stability', emotionalState.emotionalStability))}>
                {Math.round(emotionalState.emotionalStability * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Primary</span>
              <span className="text-xs font-medium text-blue-600 capitalize">
                {emotionalState.primaryEmotion}
              </span>
            </div>
            {emotionalState.crisisLevel !== 'none' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-600">Crisis Level</span>
                <span className="text-xs font-medium text-red-600 capitalize">
                  {emotionalState.crisisLevel}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conversation Insights */}
      {conversationInsights && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Conversation Insights
          </h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Emotional Trend</span>
              <span className={cn("text-xs font-medium capitalize", getEmotionalTrendColor(conversationInsights.emotionalTrend))}>
                {conversationInsights.emotionalTrend}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Engagement</span>
              <span className={cn("text-xs font-medium capitalize", getEngagementColor(conversationInsights.engagementLevel))}>
                {conversationInsights.engagementLevel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Avg Response</span>
              <span className="text-xs font-medium text-green-600">{conversationInsights.averageResponseTime.toFixed(0)}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Interruption Rate</span>
              <span className="text-xs font-medium text-orange-600">{(conversationInsights.interruptionRate * 100).toFixed(1)}%</span>
            </div>
            {conversationInsights.needsAttention && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-600">Needs Attention</span>
                <AlertTriangle className="w-3 h-3 text-red-500" />
              </div>
            )}
            {conversationInsights.crisisRisk && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-600">Crisis Risk</span>
                <AlertTriangle className="w-3 h-3 text-red-500" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voice Statistics */}
      {voiceStats && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">Statistics</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Words</span>
              <span className="text-xs font-medium text-blue-600">{voiceStats.totalWords}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Avg Response</span>
              <span className="text-xs font-medium text-green-600">{voiceStats.averageResponseTime.toFixed(1)}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Emotional Accuracy</span>
              <span className="text-xs font-medium text-purple-600">{Math.round(voiceStats.emotionalAccuracy)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Personality Evolution */}
      {conversationInsights?.personalityEvolution && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Personality Evolution</h4>
          <div className="space-y-1">
            {Object.entries(conversationInsights.personalityEvolution).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 capitalize">{key}</span>
                <span className="text-xs font-medium text-purple-600">{Math.round(Number(value) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quality Indicators */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">EVI3 Quality</span>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <TrendingUp className="w-3 h-3 text-green-500" />
            <Brain className="w-3 h-3 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
