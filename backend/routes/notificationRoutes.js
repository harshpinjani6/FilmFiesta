import express from "express";
import Notification from "../models/Notification.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only normal users can access notifications
router.use(protect, authorize("user"));

// GET latest notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const result = notifications.map((notification) => ({
      _id: notification._id,
      type: notification.type,
      message: notification.message,
      movieId: notification.movieId,
      title: notification.title,
      createdAt: notification.createdAt,
      isRead: notification.readBy.some(
        (id) => String(id) === String(req.user.id)
      ),
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
});

// PATCH notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { $addToSet: { readBy: req.user.id } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update notification",
    });
  }
});

export default router;