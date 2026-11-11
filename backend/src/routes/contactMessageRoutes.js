import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  createContactMessage,
  getContactMessageStats,
  listContactMessages,
} from "../controllers/contactMessageController.js";
import apiKeyAuth from "../middleware/apiKeyAuth.js";
import rateLimitKey from "../middleware/rateLimitKey.js";

const router = Router();

router.post(
  "/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: rateLimitKey,
  }),
  createContactMessage,
);
router.get("/stats", apiKeyAuth, getContactMessageStats);
router.get("/", apiKeyAuth, listContactMessages);

export default router;
