
import express from "express";
import Movie from "../models/Movie.js";
import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

const allowedMovieFields = [
  "id",
  "title",
  "image",
  "rating",
  "genre",
  "year",
  "language",
  "type",
];

function validateMovieBody(body, isUpdate = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Invalid request body";
  }

  const keys = Object.keys(body);

  if (keys.length === 0) {
    return "Request body cannot be empty";
  }

  const unknownFields = keys.filter(
    (key) => !allowedMovieFields.includes(key)
  );

  if (unknownFields.length > 0) {
    return `Unknown fields: ${unknownFields.join(", ")}`;
  }

  if (isUpdate && body.id !== undefined) {
    return "Movie ID cannot be changed";
  }

  return null;
}

function validateMovieId(id) {
  return /^\d+$/.test(id) && Number(id) > 0;
}

// GET all movies - Public access
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch movies",
      error: error.message,
    });
  }
});

// GET movie by ID - Public access
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findOne({
      id: Number(req.params.id),
    });

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch movie",
      error: error.message,
    });
  }
});

// POST new movie - Admin only

router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const validationError = validateMovieBody(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const movie = await Movie.create(req.body);

    const io = req.app.get("io");

    if (io) {
      io.emit("movie:created", {
        message: `New movie "${movie.title}" has been added!`,
        movieId: movie.id,
        title: movie.title,
      });
    }

    return res.status(201).json(movie);
  } catch (error) {
    return res.status(400).json({
      message: "Movie validation failed",
      error: error.message,
    });
  }
});

// PUT update movie - Admin only
// PUT update movie - Admin only

router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    if (!validateMovieId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid movie ID",
      });
    }

    const validationError = validateMovieBody(req.body, true);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const movie = await Movie.findOneAndUpdate(
      { id: Number(req.params.id) },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.emit("movie:updated", {
        message: `Movie "${movie.title}" has been updated!`,
        movieId: movie.id,
        title: movie.title,
      });
    }

    return res.status(200).json(movie);
  } catch (error) {
    return res.status(400).json({
      message: "Movie validation failed",
      error: error.message,
    });
  }
});

// DELETE movie - Admin only
// DELETE movie - Admin only
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const movie = await Movie.findOneAndDelete({
      id: Number(req.params.id),
    });

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    // Emit real-time notification
    const io = req.app.get("io");

    io.emit("movie:deleted", {
      message: `Movie "${movie.title}" has been deleted!`,
      movieId: movie.id,
      title: movie.title,
    });

    res.status(200).json({
      message: "Movie deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete movie",
      error: error.message,
    });
  }
});

export default router;
