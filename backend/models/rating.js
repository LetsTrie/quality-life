const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    userId: String,
    rating: String,
    comment: String,
    videoUrl: String,
  },
  { timestamps: true }
);

const rating = mongoose.model("qlife_rating", ratingSchema);

module.exports = rating;
