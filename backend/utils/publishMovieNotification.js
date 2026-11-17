import Notification from "../models/Notification.js";

export async function publishMovieNotification(
  req,
  type,
  movie
) {
  try {
    const actionMessages = {
      "movie:created": `New movie "${movie.title}" has been added!`,
      "movie:updated": `Movie "${movie.title}" has been updated!`,
      "movie:deleted": `Movie "${movie.title}" has been removed!`,
    };

    const notification = await Notification.create({
      type,
      message: actionMessages[type],
      movieId: movie.id,
      title: movie.title,
    });

    const io = req.app.get("io");

    if (io) {
      io.to("movie-notifications-users").emit(type, {
        _id: notification._id,
        type: notification.type,
        message: notification.message,
        movieId: notification.movieId,
        title: notification.title,
        createdAt: notification.createdAt,
        isRead: false,
      });
    }

    return notification;
  } catch (error) {
    console.error(
      "Notification publishing failed:",
      error.message
    );

    return null;
  }
}