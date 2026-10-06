/**
 * Typed API errors — throw from services/controllers; error middleware maps to JSON.
 * Prefer a stable `code` + actionable `hint` over console debugging.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly hint?: string;
  readonly details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    options?: { hint?: string; details?: unknown; cause?: unknown },
  ) {
    super(message, { cause: options?.cause });
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.hint = options?.hint;
    this.details = options?.details;
  }

  static badRequest(
    code: string,
    message: string,
    details?: unknown,
  ): HttpError {
    return new HttpError(400, code, message, { details });
  }

  static notFound(code: string, message: string): HttpError {
    return new HttpError(404, code, message);
  }

  static upstream(
    code: string,
    message: string,
    options?: { hint?: string; cause?: unknown },
  ): HttpError {
    return new HttpError(502, code, message, options);
  }

  static internal(
    code: string,
    message: string,
    options?: { hint?: string; cause?: unknown },
  ): HttpError {
    return new HttpError(500, code, message, options);
  }
}

export type ErrorResponseBody = {
  error: string;
  message: string;
  hint?: string;
  details?: unknown;
};

export function toErrorResponse(err: unknown): {
  status: number;
  body: ErrorResponseBody;
} {
  if (err instanceof HttpError) {
    return {
      status: err.status,
      body: {
        error: err.code,
        message: err.message,
        ...(err.hint ? { hint: err.hint } : {}),
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    };
  }

  return {
    status: 500,
    body: {
      error: "INTERNAL_ERROR",
      message: "Something went wrong",
    },
  };
}
