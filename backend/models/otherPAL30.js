const mongoose = require("mongoose");

const otherPAL30Schema = new mongoose.Schema({
  userId: String,
  question: String,
  answer: String,
});

const OtherPAL30 = mongoose.model("qlife_otherPAL30", otherPAL30Schema);

module.exports = OtherPAL30;
