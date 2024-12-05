const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    type: String, // manoshikShasthoMullayon
    userId: String,
    questionAnswers: [
      {
        question: String,
        answer: String,
      },
    ],
    date: String,
    score: String,
    totalScore: String,
    severity: String,
    fromVideo: {
      type: Boolean,
      default: false,
    },
    postTest: Boolean,
  },
  { timestamps: true }
);

const Test = mongoose.model("qlife_test", testSchema);

module.exports = Test;
