import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  status?: number;
  error?: string;
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error('API Error:', err);

  // Handle Zod Validation Errors (400 Bad Request)
  if (err instanceof ZodError) {
    const combinedMessage = err.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');

    return res.status(400).json({
      error: 'Validation Error',
      message: combinedMessage
    });
  }

  // Handle custom AppErrors
  const status = err.status || 500;
  const errorName = err.error || (status === 404 ? 'Not Found' : 'Internal Server Error');
  const message = err.message || 'An unexpected error occurred';

  return res.status(status).json({
    error: errorName,
    message
  });
};
