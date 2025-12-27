import { Router } from "express";
import {
  get,
  createUser,
  editUser,
  deleteUser,
  avatar,
  getActivity,
} from "../controllers/user-controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", get);
router.get("/activities", getActivity);
router.post("/", createUser);
router.put("/avatar", avatar);
router.put("/:id", editUser);
router.delete("/:id", deleteUser);

export default router;
