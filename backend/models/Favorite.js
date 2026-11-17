
import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// One user can favorite a movie only once
favoriteSchema.index(
  { userId: 1, movieId: 1 },
  { unique: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;