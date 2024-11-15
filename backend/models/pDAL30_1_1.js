const mongoose = require("mongoose");

const pDAL30_1_1Schema = new mongoose.Schema({
  userId: String,
  title: String,
  facilitatedParticipated: String,
  duration: String,
  dates: String,
});

const PDAL30_1_1 = mongoose.model("qlife_pDAL30_1_1", pDAL30_1_1Schema);

module.exports = PDAL30_1_1;
