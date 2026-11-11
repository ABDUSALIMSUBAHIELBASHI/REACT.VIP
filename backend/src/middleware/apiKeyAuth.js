import { timingSafeEqual } from "node:crypto";

const apiKeyAuth = (req, res, next) => {
  const suppliedKey = req.get("x-api-key");
  const expectedKey = process.env.API_KEY;

  if (!suppliedKey || !expectedKey) {
    return res.status(401).json({
      success: false,
      message: "A valid API key is required.",
    });
  }

  const suppliedBuffer = Buffer.from(suppliedKey);
  const expectedBuffer = Buffer.from(expectedKey);

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return res.status(401).json({
      success: false,
      message: "A valid API key is required.",
    });
  }

  return next();
};

export default apiKeyAuth;
