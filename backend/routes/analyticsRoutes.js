
import express from "express";

import User from "../models/User.js";
import Movie from "../models/Movie.js";
import Favorite from "../models/Favorite.js";
import WatchedMovie from "../models/WatchedMovie.js";
import UserActivity from "../models/UserActivity.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admins can access analytics
router.use(protect, authorize("admin"));

// Admin analytics summary
router.get("/overview", async (req, res) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalViews,
      totalFavorites,
      totalWatched,
      recentActivities,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Movie.countDocuments(),
      UserActivity.countDocuments({
        action: "movie_viewed",
      }),
      Favorite.countDocuments(),
      WatchedMovie.countDocuments(),
      UserActivity.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "name email")
        .lean(),
    ]);

    res.status(200).json({
      stats: {
        totalUsers,
        totalMovies,
        totalViews,
        totalFavorites,
        totalWatched,
      },
      recentActivities,
    });
  } catch (error) {
    console.error("Analytics overview error:", error);

    res.status(500).json({
      message: "Failed to fetch analytics overview",
    });
  }
});

// Top performing movies
router.get("/top-movies", async (req, res) => {
  try {
    const [views, favorites, watched] = await Promise.all([
      UserActivity.aggregate([
        { $match: { action: "movie_viewed" } },
        {
          $group: {
            _id: "$movieId",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 10 },
      ]),

      Favorite.aggregate([
        {
          $group: {
            _id: "$movieId",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 10 },
      ]),

      WatchedMovie.aggregate([
        {
          $group: {
            _id: "$movieId",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 10 },
      ]),
    ]);

    // Get movie titles for all aggregated movie IDs
    const movieIds = [
      ...new Set(
        [...views, ...favorites, ...watched].map(
          (item) => item._id
        )
      ),
    ];

    const movies = await Movie.find({
      id: { $in: movieIds },
    })
      .select("id title image genre")
      .lean();

    const movieMap = new Map(
      movies.map((movie) => [movie.id, movie])
    );

    const attachMovieDetails = (items) =>
      items.map((item) => ({
        movieId: item._id,
        count: item.count,
        title:
          movieMap.get(item._id)?.title ||
          `Movie #${item._id}`,
        image: movieMap.get(item._id)?.image || null,
        genre: movieMap.get(item._id)?.genre || null,
      }));

    res.status(200).json({
      mostViewed: attachMovieDetails(views),
      mostFavorited: attachMovieDetails(favorites),
      mostWatched: attachMovieDetails(watched),
    });
  } catch (error) {
    console.error("Top movies analytics error:", error);

    res.status(500).json({
      message: "Failed to fetch top movies analytics",
    });
  }
});


// Daily movie views for the last 7 days
router.get("/daily-views", async (req, res) => {
  try {
    const now = new Date();

    // UTC midnight, 6 days ago
    const startDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 6
      )
    );

    const views = await UserActivity.aggregate([
      {
        $match: {
          action: "movie_viewed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "UTC",
            },
          },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const viewMap = new Map(
      views.map((item) => [item._id, item.views])
    );

    const dailyViews = [];

    // Include days with zero views
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);

      const dateKey = date.toISOString().slice(0, 10);

      dailyViews.push({
        date: dateKey,
        views: viewMap.get(dateKey) || 0,
      });
    }

    res.status(200).json({ dailyViews });
  } catch (error) {
    console.error("Daily views analytics error:", error);

    res.status(500).json({
      message: "Failed to fetch daily movie views",
    });
  }
});

export default router;