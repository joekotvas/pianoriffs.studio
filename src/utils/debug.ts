import { CONFIG } from '@/config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class DebugLogger {
  private static instance: DebugLogger;

  private constructor() {}

  public static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  private shouldLog(_level: LogLevel): boolean {
    if (!CONFIG.debug?.enabled) return false;
    // Could add level filtering here based on config if needed
    return true;
  }

  public log(message: string, data?: any, level: LogLevel = LogLevel.INFO) {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const prefix = `[${timestamp}] [${LogLevel[level]}]`;

    /* eslint-disable no-console */
    switch (level) {
      case LogLevel.ERROR:
        console.error(prefix, message, data || '');
        break;
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data || '');
        break;
      case LogLevel.DEBUG:
        console.debug(prefix, message, data || '');
        break;
      default:
        console.log(prefix, message, data || '');
    }
  }

  public group(label: string) {
    if (CONFIG.debug?.enabled) {
      console.group(label);
    }
  }

  public groupEnd() {
    if (CONFIG.debug?.enabled) {
      console.groupEnd();
    }
  }

  public logCommand(commandType: string, payload?: any) {
    if (CONFIG.debug?.logCommands) {
      this.log(`COMMAND: ${commandType}`, payload, LogLevel.INFO);
    }
  }

  public logStateChange(oldStateHash: string, newStateHash: string) {
    if (CONFIG.debug?.logStateChanges) {
      this.log(`STATE CHANGE: ${oldStateHash} -> ${newStateHash}`, undefined, LogLevel.DEBUG);
    }
  }

  public logValidationFailure(reason: string, context?: any) {
    if (CONFIG.debug?.logValidation) {
      this.log(`VALIDATION FAILED: ${reason}`, context, LogLevel.ERROR);
    }
  }
}

export const logger = DebugLogger.getInstance();
