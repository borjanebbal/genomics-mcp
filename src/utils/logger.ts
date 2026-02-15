// All output goes to stderr because stdout is reserved for MCP protocol messages.

type LogLevel = "info" | "warn" | "error";

function formatMessage(level: LogLevel, tag: string, message: string): string {
  const prefix = level === "error" ? "ERROR" : level === "warn" ? "WARN" : "INFO";
  return `[${prefix}] [${tag}] ${message}`;
}

function log(level: LogLevel, tag: string, message: string, detail?: unknown): void {
  const formatted = formatMessage(level, tag, message);
  if (detail !== undefined) {
    console.error(formatted, detail);
  } else {
    console.error(formatted);
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
