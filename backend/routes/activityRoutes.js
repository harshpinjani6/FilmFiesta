
import express from "express";
import mongoose from "mongoose";

import UserActivity from "../models/UserActivity.js";
import Movie from "../models/Movie.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("user"));

// Record a user activity
router.post("/", async (req, res) => {
  try {
    const { movieId, action } = req.body;

    const validActions = [
      "movie_viewed",
      "favorite_added",
      "favorite_removed",
      "movie_watched",
    ];

    if (
      !Number.isInteger(movieId) ||
      movieId <= 0 ||
      !validActions.includes(action)
    ) {
      return res.status(400).json({
        message: "Invalid movie ID or activity",
      });
    }

    const movie = await Movie.findOne({ id: movieId });

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    const activity = await UserActivity.create({
      userId: req.user.id,
      movieId,
      action,
    });

    res.status(201).json({
      message: "Activity recorded successfully",
      activity,
    });
  } catch (error) {
    console.error("Activity error:", error);

    res.status(500).json({
      message: "Failed to record activity",
    });
  }
});

// Get current user's recent activities
router.get("/my", async (req, res) => {
  try {
    const activities = await UserActivity.find({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch activities",
    });
  }
});

export default router;