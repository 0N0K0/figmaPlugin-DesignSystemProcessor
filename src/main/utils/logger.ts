/**
 * Logger système pour envoyer les logs vers l'UI
 */

export type LogLevel = "info" | "success" | "warn" | "error" | "debug";

export interface LogMessage {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogMessage[] = [];

  log(level: LogLevel, message: string, data?: any) {
    const logMessage: LogMessage = {
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    this.logs.push(logMessage);

    // Envoyer à l'UI
    figma.ui.postMessage({
      type: "log",
      log: logMessage,
    });

    // Garder aussi dans la console
    console[level === "debug" || level === "success" ? "log" : level](
      message,
      data,
    );
  }

  info(message: string, data?: any) {
    this.log("info", message, data);
  }

  success(message: string, data?: any) {
    this.log("success", message, data);
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  error(message: string, data?: any) {
    this.log("error", message, data);
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data);
  }

  clear() {
    this.logs = [];
    figma.ui.postMessage({
      type: "clearLogs",
    });
  }

  getLogs(): LogMessage[] {
    return [...this.logs];
  }
}

export const logger = new Logger();
