const mongoose = require("mongoose");
const { MODEL_NAME } = require("./model_name");
const Schema = mongoose.Schema;

const profsClient = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.USER,
    },
    prof: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.PROFESSIONAL,
    },
    customId: {
      type: String,
      default: () => Math.floor(1000000 + Math.random() * 9000000).toString(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Active UserxProf aktai thakbe
// Inactive UserxProf akathik thakte pare

profsClient.index({ user: 1, prof: 1, isActive: 1 }, { unique: true });

const ProfsClient = mongoose.model("qlife_profs-client", profsClient);
module.exports = ProfsClient;
