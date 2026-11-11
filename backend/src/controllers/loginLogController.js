import mongoose from "mongoose";
import LoginLog from "../models/LoginLog.js";

const getLoginLogs = async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "page must be positive; limit must be between 1 and 100.",
      });
    }

    if (
      (req.query.email !== undefined && typeof req.query.email !== "string") ||
      (req.query.action !== undefined && typeof req.query.action !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "email and action filters must be single text values.",
      });
    }

    const filter = {};
    if (req.query.email) {
      filter.Email = req.query.email.trim().toLowerCase();
    }
    if (req.query.action) {
      filter.Action = req.query.action.trim().toUpperCase();
    }

    const [items, total] = await Promise.all([
      LoginLog.find(filter)
        .sort({ Date: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      LoginLog.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: items,
    });
  } catch (error) {
    return next(error);
  }
};

const getLoginLogById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "A valid MongoDB ObjectId is required.",
      });
    }

    const item = await LoginLog.findById(req.params.id).lean();
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Login log not found.",
      });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

const createLoginLog = async (req, res, next) => {
  try {
    const { Email, Action } = req.body ?? {};
    const eventDate = req.body?.Date;
    const recordNumber = req.body?.["#"];

    if (
      typeof Email !== "string" ||
      !Email.trim() ||
      Email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid Email is required.",
      });
    }

    if (
      typeof Action !== "string" ||
      !Action.trim() ||
      Action.trim().length > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "A non-empty Action of at most 50 characters is required.",
      });
    }

    if (
      eventDate !== undefined &&
      (typeof eventDate !== "string" || Number.isNaN(Date.parse(eventDate)))
    ) {
      return res.status(400).json({
        success: false,
        message: "Date must be a valid ISO date string.",
      });
    }

    if (
      recordNumber !== undefined &&
      (!Number.isInteger(recordNumber) || recordNumber < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'The "#" field must be a non-negative integer.',
      });
    }

    const item = await LoginLog.create({
      Email: Email.trim(),
      Action: Action.trim(),
      ...(eventDate ? { Date: new Date(eventDate) } : {}),
      ...(recordNumber !== undefined ? { "#": recordNumber } : {}),
    });

    return res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return next(error);
  }
};

export { createLoginLog, getLoginLogById, getLoginLogs };
