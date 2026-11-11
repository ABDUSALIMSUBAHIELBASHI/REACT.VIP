import ContactMessage from "../models/ContactMessage.js";

const listContactMessages = async (req, res, next) => {
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

    const filter = {};
    if (req.query.email !== undefined) {
      if (typeof req.query.email !== "string" || !req.query.email.trim()) {
        return res.status(400).json({
          success: false,
          message: "email must be a non-empty text value.",
        });
      }
      filter.email = req.query.email.trim().toLowerCase();
    }

    const [items, total] = await Promise.all([
      ContactMessage.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ContactMessage.countDocuments(filter),
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

const getContactMessageStats = async (_req, res, next) => {
  try {
    const monthlyCounts = await ContactMessage.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
              timezone: "UTC",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 24 },
    ]);

    return res.json({
      success: true,
      total: await ContactMessage.countDocuments(),
      monthlyCounts,
    });
  } catch (error) {
    return next(error);
  }
};

const createContactMessage = async (req, res, next) => {
  try {
    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a JSON object.",
      });
    }

    const allowedFields = new Set(["name", "email", "message"]);
    if (Object.keys(req.body).some((key) => !allowedFields.has(key))) {
      return res.status(400).json({
        success: false,
        message: "Only name, email, and message fields are accepted.",
      });
    }

    const { name, email, message } = req.body;
    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "name must be between 2 and 100 characters.",
      });
    }

    if (
      typeof email !== "string" ||
      email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required.",
      });
    }

    if (
      typeof message !== "string" ||
      message.trim().length < 5 ||
      message.trim().length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "message must be between 5 and 5000 characters.",
      });
    }

    await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Your message was received.",
    });
  } catch (error) {
    return next(error);
  }
};

export {
  createContactMessage,
  getContactMessageStats,
  listContactMessages,
};
