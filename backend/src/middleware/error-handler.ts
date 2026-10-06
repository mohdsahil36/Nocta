import type { NextFunction, Request, Response } from "express";
import { HttpError, toErrorResponse } from "../lib/http-error.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const { status, body } = toErrorResponse(err);

  // Log unexpected failures with cause; known HttpErrors stay quiet unless 5xx.
  if (!(err instanceof HttpError) || status >= 500) {
    const cause =
      err instanceof Error && err.cause !== undefined
        ? err.cause
        : undefined;
    console.error(`[${body.error}] ${body.message}`, cause ?? err);
  }

  res.status(status).json(body);
}
