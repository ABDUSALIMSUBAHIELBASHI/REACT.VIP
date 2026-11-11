import { ipKeyGenerator } from "express-rate-limit";

const rateLimitKey = (req) =>
  ipKeyGenerator(req.get("x-nf-client-connection-ip") || req.ip || "unknown");

export default rateLimitKey;
