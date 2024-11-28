const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const { MODEL_NAME } = require("./model_name");

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.USER,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    comment: String,
    videoUrl: String,
    contentId: String,
  },
  { timestamps: true }
);

const Rating = mongoose.model("qlife_rating", ratingSchema);

module.exports = Rating;
