
import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";

dotenv.config();

const upcomingMovies = [
  {
    id: 101,
    title: "Avengers: Doomsday",
    image: "https://lumiere-a.akamaihd.net/v1/images/g_movies_avengersdoomsday_poster_b81ec5ee.jpeg",
    rating: 0,
    genre: "Action",
    year: 2026,
    language: "English",
    type: "upcoming",
  },
  {
    id: 102,
    title: "Spider-Man: Brand New Day",
    image: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    rating: 0,
    genre: "Action",
    year: 2026,
    language: "English",
    type: "upcoming",
  },
  {
    id: 103,
    title: "Toy Story 5",
    image: "https://lumiere-a.akamaihd.net/v1/images/g_movies_toystory5_payoff_poster_bb9dcbe9.jpeg",
    rating: 0,
    genre: "Animation",
    year: 2026,
    language: "English",
    type: "upcoming",
  },
  {
    id: 104,
    title: "The Batman Part II",
    image: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    rating: 0,
    genre: "Action",
    year: 2027,
    language: "English",
    type: "upcoming",
  },
  {
    id: 105,
    title: "Avatar 4",
    image: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    rating: 0,
    genre: "Adventure",
    year: 2029,
    language: "English",
    type: "upcoming",
  },
];

async function addUpcomingMovies() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const movie of upcomingMovies) {
      await Movie.updateOne(
        { id: movie.id },
        { $set: movie },
        { upsert: true }
      );
    }

    console.log("Upcoming movies added successfully!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

addUpcomingMovies();