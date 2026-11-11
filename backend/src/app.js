import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import contactMessageRoutes from "./routes/contactMessageRoutes.js";
import loginLogRoutes from "./routes/loginLogRoutes.js";
import rateLimitKey from "./middleware/rateLimitKey.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      process.env.URL ||
      process.env.DEPLOY_PRIME_URL ||
      "http://localhost:5173",
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(morgan("dev"));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    keyGenerator: rateLimitKey,
  }),
);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Addition MR Push Backend API is running",
    version: "1.0.0",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    server: "online",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/login-logs", loginLogRoutes);
app.use("/api/contact-messages", contactMessageRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.use((error, _req, res, _next) => {
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Request body must contain valid JSON.",
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with the same unique value already exists.",
    });
  }

  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "The supplied data is invalid.",
    });
  }

  console.error("API error:", error);
  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
});

export default app;
