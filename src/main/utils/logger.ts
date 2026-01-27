/**
 * Logger système pour envoyer les logs vers l'UI
 */

import { LogLevel, LogMessage } from "../types/loggerTypes";

class Logger {
  private logs: LogMessage[] = [];

  async log(level: LogLevel, message: string, data?: any) {
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

    await new Promise<void>((r) => setTimeout(r, 0));
  }

  async info(message: string, data?: any) {
    await this.log("info", message, data);
  }

  async success(message: string, data?: any) {
    await this.log("success", message, data);
  }

  async warn(message: string, data?: any) {
    await this.log("warn", message, data);
  }

  async error(message: string, data?: any) {
    await this.log("error", message, data);
  }

  async debug(message: string, data?: any) {
    await this.log("debug", message, data);
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
