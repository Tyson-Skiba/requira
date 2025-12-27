import { Request, Response, NextFunction } from "express";
import { logger } from "../services/log-service";

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(
    err.message || `Internal server error: ${req.path} ${req.params}`,
  );
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};
