import serverless from "serverless-http";
import app from "../../src/app.js";
import connectDB from "../../src/config/db.js";

const appHandler = serverless(app);
const functionPrefix = "/.netlify/functions/api";
let databaseReady;

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required in Netlify environment variables.");
  }

  databaseReady ??= connectDB().catch((error) => {
    databaseReady = undefined;
    throw error;
  });
  await databaseReady;

  const path = event.path?.startsWith(functionPrefix)
    ? event.path.slice(functionPrefix.length) || "/"
    : event.path;

  return appHandler({ ...event, path }, context);
};
