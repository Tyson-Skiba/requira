import { Router } from "express";
import { search, get, remove, queue } from "../controllers/book-controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.put("/queue", queue);
router.get("/search", search);
router.get("/", get);
router.delete("/:id/remove", remove);

export default router;
