import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/database";
import { logger } from "../services/log-service";

export const apiKeyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.header("X-API-KEY");

  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key" });
  }

  logger.info(`Challenged using api key ${apiKey}`);

  const user = await prisma.user.findFirst({
    where: {
      api_key: apiKey,
    },
  });

  if (!user) return res.status(401).json({ error: "Invalid API key" });

  req.user = {
    userId: user.id,
    roles: ["ApiUser"],
  };

  next();
};
