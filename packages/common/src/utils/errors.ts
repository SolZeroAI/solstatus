export function getErrorMessage(cause: unknown): string {
  if (cause instanceof Error) {
    return cause.message
  }

  if (cause instanceof Object && "message" in cause) {
    return String(cause.message)
  }

  return String(cause)
}

/**
 * Error thrown when the MonitorTrigger Durable Object is accessed before being initialized.
 */
export class MonitorTriggerNotInitializedError extends Error {
  static readonly NAME = "MonitorTriggerNotInitializedError"

  constructor(message = "MonitorTrigger Durable Object accessed before initialization.") {
    super(message)
    this.name = MonitorTriggerNotInitializedError.NAME
  }
}
