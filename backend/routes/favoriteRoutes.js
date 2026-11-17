
import express from "express";

import Favorite from "../models/Favorite.js";
import Movie from "../models/Movie.js";
import UserActivity from "../models/UserActivity.js";
import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("user"));

// Get current user's favorites
router.get("/", async (req, res) => {
  try {
    const favorites = await Favorite.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch favorites",
    });
  }
});

// Add favorite
router.post("/:movieId", async (req, res) => {
  try {
    const movieId = Number(req.params.movieId);

    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({
        message: "Invalid movie ID",
      });
    }

    const movie = await Movie.findOne({ id: movieId });

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    const result = await Favorite.updateOne(
      { userId: req.user.id, movieId },
      {
        $setOnInsert: {
          userId: req.user.id,
          movieId,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      await UserActivity.create({
        userId: req.user.id,
        movieId,
        action: "favorite_added",
      });
    }

    res.status(200).json({
      message: "Favorite saved",
      movieId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to add favorite",
    });
  }
});

// Remove favorite
router.delete("/:movieId", async (req, res) => {
  try {
    const movieId = Number(req.params.movieId);

    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({
        message: "Invalid movie ID",
      });
    }

    const result = await Favorite.deleteOne({
      userId: req.user.id,
      movieId,
    });

    if (result.deletedCount > 0) {
      await UserActivity.create({
        userId: req.user.id,
        movieId,
        action: "favorite_removed",
      });
    }

    res.json({
      message: "Favorite removed",
      movieId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to remove favorite",
    });
  }
});

export default router;