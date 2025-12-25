import { Router } from "express";
import {
  get,
  queue,
  create,
  search,
  remove,
} from "../controllers/song-controller";

const router = Router();

router.get("/", get);
router.get("/search", search);
router.get("/queue", queue);
//router.get('/:id', getItemById);
router.post("/", create);
router.delete("/:id/remove", remove);

export default router;
