
import express from "express";

import WatchedMovie from "../models/WatchedMovie.js";
import Movie from "../models/Movie.js";
import UserActivity from "../models/UserActivity.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Only logged-in normal users
router.use(protect, authorize("user"));

// GET user's watched movies
router.get("/", async (req, res) => {
  try {
    const watchedMovies = await WatchedMovie.find({
      userId: req.user.id,
    }).sort({ watchedAt: -1 });

    res.status(200).json(watchedMovies);
  } catch (error) {
    console.error("Fetch watched movies error:", error);

    res.status(500).json({
      message: "Failed to fetch watched movies",
    });
  }
});

// Mark movie as watched
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

    const result = await WatchedMovie.updateOne(
      {
        userId: req.user.id,
        movieId,
      },
      {
        $setOnInsert: {
          userId: req.user.id,
          movieId,
          watchedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Record activity only for first watch
    if (result.upsertedCount > 0) {
      await UserActivity.create({
        userId: req.user.id,
        movieId,
        action: "movie_watched",
      });
    }

    res.status(200).json({
      message:
        result.upsertedCount > 0
          ? "Movie marked as watched"
          : "Movie already watched",
      movieId,
      alreadyWatched: result.upsertedCount === 0,
    });
  } catch (error) {
    console.error("Mark watched error:", error);

    res.status(500).json({
      message: "Failed to mark movie as watched",
    });
  }
});

export default router;