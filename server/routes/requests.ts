import { Router } from "express";
import { get } from "../controllers/request-controller";

const router = Router();

router.get("/", get);

export default router;
