// 📝 Production-Safe Logger - Zero Debug Exposure to Users
// Completely separates internal debugging from user-facing output

export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: 'emotion' | 'voice' | 'conversation' | 'system' | 'api';
  message: string;
  data?: unknown;
  sessionId?: string;
}

export interface LogConfig {
  productionMode: boolean;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxEntries: number;
}

export class ProductionLogger {
  private config: LogConfig;
  private logs: LogEntry[] = [];
  private sessionLogs: Map<string, LogEntry[]> = new Map();
  private maxLogs: number = 1000;

  constructor(config: Partial<LogConfig> = {}) {
    this.config = {
      productionMode: true,
      enableConsole: false, // NEVER enable console in production
      enableFileLogging: false,
      logLevel: 'error', // Only log errors in production
      maxLogs: 1000,
      ...config
    };
  }

  // 🚨 CRITICAL: Production-safe logging - NO DEBUG OUTPUT TO USERS
  private shouldLog(level: string): boolean {
    if (this.config.productionMode) {
      // In production, only log errors and warnings
      return level === 'error' || level === 'warning';
    }
    return true;
  }

  // 🚨 CRITICAL: Sanitize all log data to prevent information leakage
  private sanitizeData(data: unknown): unknown {
    if (!data) return data;
    
    // Remove sensitive fields
    const sensitiveFields = [
      'apiKey', 'token', 'password', 'secret', 'key',
      'emotionalState', 'userEmotion', 'voiceData',
      'sessionId', 'userId', 'personalData'
    ];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });
      return sanitized;
    }
    
    return data;
  }

  // 🧠 Emotion analysis logging (internal only)
  logEmotion(sessionId: string, message: string, data?: unknown): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'debug',
      category: 'emotion',
      message,
      data,
      sessionId
    });
  }

  // 🎤 Voice system logging (internal only)
  logVoice(sessionId: string, message: string, data?: unknown): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'debug',
      category: 'voice',
      message,
      data,
      sessionId
    });
  }

  // 💬 Conversation logging (internal only)
  logConversation(sessionId: string, message: string, data?: unknown): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'info',
      category: 'conversation',
      message,
      data,
      sessionId
    });
  }

  // 🔧 System logging (internal only)
  logSystem(message: string, data?: unknown): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'info',
      category: 'system',
      message,
      data
    });
  }

  // 🌐 API logging (internal only)
  logAPI(sessionId: string, message: string, data?: unknown): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'debug',
      category: 'api',
      message,
      data,
      sessionId
    });
  }

  // ⚠️ Warning logging (internal only)
  logWarning(sessionId: string, message: string, data?: unknown): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'warn',
      category: 'system',
      message,
      data,
      sessionId
    });
  }

  // ❌ Error logging (internal only)
  logError(sessionId: string, message: string, error?: unknown): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'error',
      category: 'system',
      message,
      data: error,
      sessionId
    });
  }

  // ➕ Add log entry (internal method)
  private addLog(entry: LogEntry): void {
    // Add to main logs
    this.logs.push(entry);
    
    // Add to session-specific logs
    if (entry.sessionId) {
      if (!this.sessionLogs.has(entry.sessionId)) {
        this.sessionLogs.set(entry.sessionId, []);
      }
      this.sessionLogs.get(entry.sessionId)!.push(entry);
    }

    // Limit log size
    if (this.logs.length > this.config.maxEntries) {
      this.logs.shift();
    }

    // Output based on configuration
    this.outputLog(entry);
  }

  // 📤 Output log based on configuration
  private outputLog(entry: LogEntry): void {
    // Check log level
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[entry.level] < levels[this.config.logLevel]) {
      return;
    }

    // Console output (only in non-production)
    if (this.config.enableConsole && !this.config.productionMode) {
      const prefix = `[${entry.category.toUpperCase()}]`;
      const timestamp = new Date(entry.timestamp).toISOString();
      const session = entry.sessionId ? `[${entry.sessionId}]` : '';
      
      switch (entry.level) {
        case 'debug':
          console.debug(`${prefix} ${timestamp} ${session} ${entry.message}`, entry.data || '');
          break;
        case 'info':
          console.info(`${prefix} ${timestamp} ${session} ${entry.message}`, entry.data || '');
          break;
        case 'warn':
          console.warn(`${prefix} ${timestamp} ${session} ${entry.message}`, entry.data || '');
          break;
        case 'error':
          console.error(`${prefix} ${timestamp} ${session} ${entry.message}`, entry.data || '');
          break;
      }
    }

    // File output (future implementation)
    if (this.config.enableFile) {
      // TODO: Implement file logging
    }

    // Remote output (future implementation)
    if (this.config.enableRemote) {
      // TODO: Implement remote logging
    }
  }

  // 📊 Get logs for analysis (development only)
  getLogs(sessionId?: string, level?: string, category?: string): LogEntry[] {
    if (this.config.productionMode) {
      return []; // No logs in production
    }

    let filteredLogs = sessionId ? 
      this.sessionLogs.get(sessionId) || [] : 
      this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    return filteredLogs;
  }

  // 📈 Get session statistics (development only)
  getSessionStats(sessionId: string): { totalLogs: number; errorCount: number; warningCount: number; lastActivity: number } | null {
    if (this.config.productionMode) {
      return null;
    }

    const sessionLogs = this.sessionLogs.get(sessionId) || [];
    const emotionLogs = sessionLogs.filter(log => log.category === 'emotion');
    const voiceLogs = sessionLogs.filter(log => log.category === 'voice');
    const conversationLogs = sessionLogs.filter(log => log.category === 'conversation');

    return {
      sessionId,
      totalLogs: sessionLogs.length,
      emotionAnalysis: emotionLogs.length,
      voiceInteractions: voiceLogs.length,
      conversationTurns: conversationLogs.length,
      lastActivity: sessionLogs[sessionLogs.length - 1]?.timestamp || 0,
      errorCount: sessionLogs.filter(log => log.level === 'error').length,
      warningCount: sessionLogs.filter(log => log.level === 'warn').length
    };
  }

  // 🧹 Clean up old logs
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    
    // Clean main logs
    this.logs = this.logs.filter(log => log.timestamp > cutoff);
    
    // Clean session logs
    for (const [sessionId, logs] of this.sessionLogs.entries()) {
      const filteredLogs = logs.filter(log => log.timestamp > cutoff);
      if (filteredLogs.length === 0) {
        this.sessionLogs.delete(sessionId);
      } else {
        this.sessionLogs.set(sessionId, filteredLogs);
      }
    }
  }

  // 🔄 Export logs for debugging (development only)
  exportLogs(sessionId?: string): string {
    if (this.config.productionMode) {
      return 'Logs not available in production mode';
    }

    const logs = this.getLogs(sessionId);
    return JSON.stringify(logs, null, 2);
  }

  // 🚫 Clear all logs
  clearLogs(): void {
    this.logs = [];
    this.sessionLogs.clear();
  }

  // ⚙️ Update configuration
  updateConfig(newConfig: Partial<LogConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 🔍 Check if logging is enabled
  isLoggingEnabled(): boolean {
    return !this.config.productionMode;
  }
}

// 🎯 Global logger instance
export const logger = new ProductionLogger({
  productionMode: process.env.NODE_ENV === 'production',
  enableConsole: process.env.NODE_ENV !== 'production',
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug'
});

export default ProductionLogger;
