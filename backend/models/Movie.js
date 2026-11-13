import mongoose from "mongoose";

const currentYear = new Date().getFullYear();

const movieSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, "Movie ID is required"],
      unique: true,
      min: [1, "Movie ID must be positive"],
      validate: {
        validator: Number.isInteger,
        message: "Movie ID must be an integer",
      },
    },

    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
      minlength: [2, "Title must contain at least 2 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    image: {
      type: String,
      required: [true, "Movie image URL is required"],
      trim: true,
      match: [
        /^https?:\/\/.+/i,
        "Please provide a valid HTTP or HTTPS image URL",
      ],
    },

    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [10, "Rating cannot exceed 10"],
    },

    genre: {
      type: String,
      required: [true, "Genre is required"],
      trim: true,
    },

    year: {
      type: Number,
      required: [true, "Release year is required"],
      min: [1888, "Invalid release year"],
      max: [2100, "Release year cannot exceed 2100"],
      validate: {
        validator: Number.isInteger,
        message: "Release year must be an integer",
      },
    },

    language: {
      type: String,
      required: [true, "Language is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: {
        values: ["movie", "upcoming"],
        message: "Type must be movie or upcoming",
      },
      default: "movie",
    },
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;