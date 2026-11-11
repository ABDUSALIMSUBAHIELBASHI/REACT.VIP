import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema(
  {
    "#": {
      type: Number,
      min: 0,
    },
    Email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    Date: {
      type: Date,
      default: Date.now,
    },
    Action: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
  },
  {
    versionKey: false,
    collection: process.env.MONGODB_COLLECTION || "loginlogs",
  },
);

loginLogSchema.index({ Email: 1, Date: -1 });
loginLogSchema.index({ Action: 1, Date: -1 });

const LoginLog =
  mongoose.models.LoginLog || mongoose.model("LoginLog", loginLogSchema);

export default LoginLog;
