import { Router } from "express";
import {
  createLoginLog,
  getLoginLogById,
  getLoginLogs,
} from "../controllers/loginLogController.js";
import apiKeyAuth from "../middleware/apiKeyAuth.js";

const router = Router();

router.use(apiKeyAuth);
router.get("/", getLoginLogs);
router.get("/:id", getLoginLogById);
router.post("/", createLoginLog);

export default router;
