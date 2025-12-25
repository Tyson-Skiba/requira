import type { Request, Response, NextFunction } from "express";
import { prisma } from "../services/database";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageSize = Number(req.query.pageSize ?? 20);
    const page = Number(req.query.page ?? 1);
    const skip = (page - 1) * pageSize;
    const [items, total] = await prisma.$transaction([
      prisma.queue.findMany({
        skip,
        take: pageSize,
        orderBy: { created_at: "desc" },
      }),
      prisma.queue.count(),
    ]);

    res.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: page * pageSize < total,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
};
