import { Router } from "express";
import {
  get,
  createUser,
  editUser,
  deleteUser,
  avatar,
  getActivity,
  generateApiKey,
} from "../controllers/user-controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", get);
router.get("/activities", getActivity);
router.post("/", createUser);
router.post("/generate-api-key", generateApiKey);
router.put("/avatar", avatar);
router.put("/:id", editUser);
router.delete("/:id", deleteUser);

export default router;
