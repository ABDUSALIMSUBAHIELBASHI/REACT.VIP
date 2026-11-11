import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const port = Number(process.env.PORT || 5000);

if (!process.env.MONGODB_URI) {
  console.error("Startup failed: MONGODB_URI is required.");
  process.exit(1);
}

if (!process.env.API_KEY || process.env.API_KEY.length < 32) {
  console.error("Startup failed: set API_KEY to a secret of at least 32 characters.");
  process.exit(1);
}

try {
  await connectDB();
  const server = app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
  });

  const shutdown = async () => {
    server.close(async () => {
      const mongoose = await import("mongoose");
      await mongoose.default.disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} catch (error) {
  console.error("Server startup failed:", error.message);
  process.exit(1);
}
