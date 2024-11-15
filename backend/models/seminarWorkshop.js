const mongoose = require("mongoose");

const seminarWorkshopSchema = new mongoose.Schema({
  userId: String,
  seminarWorkshop: String,
  title: String,
  duration: String,
  dates: String,
});

const SeminarWorkshop = mongoose.model(
  "qlife_seminarWorkshop",
  seminarWorkshopSchema
);

module.exports = SeminarWorkshop;
