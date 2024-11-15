const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const errorSchema = Schema(
  {
    data: Object,
  },

  { timestamps: true }
);

const Error = mongoose.model("qlife_error", errorSchema);
module.exports = Error;
