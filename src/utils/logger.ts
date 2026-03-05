// All output goes to stderr because stdout is reserved for MCP protocol messages.

import { Console } from "node:console";

type LogLevel = "info" | "warn" | "error";

const stderrConsole = new Console({
  stdout: process.stderr,
  stderr: process.stderr,
});

function formatMessage(level: LogLevel, tag: string, message: string): string {
  const prefix = level === "error" ? "ERROR" : level === "warn" ? "WARN" : "INFO";
  return `[${prefix}] [${tag}] ${message}`;
}

function log(level: LogLevel, tag: string, message: string, detail?: unknown): void {
  const formatted = formatMessage(level, tag, message);

  switch (level) {
    case "info":
      if (detail !== undefined) {
        stderrConsole.info(formatted, detail);
      } else {
        stderrConsole.info(formatted);
      }
      break;
    case "warn":
      if (detail !== undefined) {
        stderrConsole.warn(formatted, detail);
      } else {
        stderrConsole.warn(formatted);
      }
      break;
    case "error":
      if (detail !== undefined) {
        stderrConsole.error(formatted, detail);
      } else {
        stderrConsole.error(formatted);
      }
      break;
  }
}

export function createLogger(tag: string) {
  return {
    info: (message: string, detail?: unknown) => log("info", tag, message, detail),
    warn: (message: string, detail?: unknown) => log("warn", tag, message, detail),
    error: (message: string, detail?: unknown) => log("error", tag, message, detail),
  };
}

export type Logger = ReturnType<typeof createLogger>;
