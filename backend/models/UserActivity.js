
import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
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
      index: true,
    },

    action: {
      type: String,
      enum: [
        "movie_viewed",
        "favorite_added",
        "favorite_removed",
        "movie_watched",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Faster analytics queries
userActivitySchema.index({
  movieId: 1,
  action: 1,
  createdAt: -1,
});

// Faster user history queries
userActivitySchema.index({
  userId: 1,
  createdAt: -1,
});

const UserActivity = mongoose.model(
  "UserActivity",
  userActivitySchema
);

export default UserActivity;