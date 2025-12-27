import { Router } from "express";
import { get } from "../controllers/request-controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", get);

export default router;
