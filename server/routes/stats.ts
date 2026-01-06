import { Router } from "express";
import { prisma } from "../services/database";
import { apiKeyMiddleware } from "../middleware/api-key";

const router = Router();

router.get("/", apiKeyMiddleware, async (req, res, next) => {
  try {
    const books = await prisma.book.count();
    const songs = await prisma.song.count();
    const approvals = await prisma.queue.count({
      where: {
        approver_user_id: null,
      },
    });

    const downloads = await prisma.queue.count({
      where: {
        approver_user_id: {
          not: null,
        },
        attempts: {
          lte: 3,
        },
      },
    });

    res.json({
      books,
      songs,
      approvals,
      downloads,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
