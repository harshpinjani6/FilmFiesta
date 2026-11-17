
import mongoose from "mongoose";

const watchedMovieSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    movieId: {
      type: Number,
      required: true,
    },

    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One watched record per user per movie
watchedMovieSchema.index(
  { userId: 1, movieId: 1 },
  { unique: true }
);

const WatchedMovie = mongoose.model(
  "WatchedMovie",
  watchedMovieSchema
);

export default WatchedMovie;