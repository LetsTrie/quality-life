const mongoose = require("mongoose");
const { MODEL_NAME } = require("./model_name");
const Schema = mongoose.Schema;

const appointmentMetaSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: MODEL_NAME.USER },
    prof: { type: Schema.Types.ObjectId, ref: MODEL_NAME.PROFESSIONAL },
    appointmentId: { type: Schema.Types.ObjectId, ref: MODEL_NAME.APPOINTMENT, unique: true },
    stage: {
      type: String,
      enum: ["REQUESTED", "RESPONSED", "IS_A_CLIENT"],
    },
  },
  { timestamps: true }
);

appointmentMetaSchema.index({ user: 1, prof: 1 }, { unique: true });

const AppointmentMeta = mongoose.model(
  MODEL_NAME.APPOINTMENT_META,
  appointmentMetaSchema
);

module.exports = AppointmentMeta;
