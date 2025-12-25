import { Router } from "express";
import {
  currentUser,
  login,
  logout,
  refresh,
} from "../controllers/auth-controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/user", authMiddleware, currentUser);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/login", login);

export default router;
