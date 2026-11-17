import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "movie:created",
        "movie:updated",
        "movie:deleted",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    movieId: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;