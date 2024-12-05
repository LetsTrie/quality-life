const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { MODEL_NAME } = require("./model_name");
const { constants } = require("../utils");

const notificationSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.USER,
    },
    prof: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.PROFESSIONAL,
    },
    for: {
      type: String,
      enum: [constants.ROLES.USER, constants.ROLES.PROFESSIONAL],
    },
    type: {
      type: String,
      required: true,
      enum: [
        constants.APPOINTMENT_REQUESTED,
        constants.APPOINTMENT_ACCEPTED,
        constants.SUGGEST_A_SCALE,
        constants.SCALE_FILLUP_BY_USER,
      ],
    },
    hasSeen: {
      type: Boolean,
      default: false,
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.APPOINTMENT,
    },
    assessment: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.PROFESSIONAL_ASSESSMENT,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.PROFESSIONALS_CLIENT,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model(
  MODEL_NAME.NOTIFICATION,
  notificationSchema
);

module.exports = Notification;
