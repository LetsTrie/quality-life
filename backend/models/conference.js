const mongoose = require("mongoose");

const conferenceSchema = new mongoose.Schema({
  userId: String,
  title: String,
  duration: String,
  dates: String,
});

const Conference = mongoose.model("qlife_conference", conferenceSchema);

module.exports = Conference;
