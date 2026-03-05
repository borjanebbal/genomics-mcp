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
  const method = level === "error" ? "error" : level === "warn" ? "warn" : "info";

  if (detail !== undefined) {
    stderrConsole[method](formatted, detail);
  } else {
    stderrConsole[method](formatted);
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
