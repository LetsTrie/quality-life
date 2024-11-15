const mongoose = require("mongoose");
const { MODEL_NAME } = require("./model_name");
const Schema = mongoose.Schema;

const recentlyContactedSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: MODEL_NAME.USER },
    prof: { type: Schema.Types.ObjectId, ref: MODEL_NAME.PROFESSIONAL },
  },
  { timestamps: true }
);

recentlyContactedSchema.index({ name: 1, user: 1 }, { unique: true });

const RecentlyContacted = mongoose.model(
  "qlife_recentlycontacted",
  recentlyContactedSchema
);
module.exports = RecentlyContacted;
