const mongoose = require("mongoose");
const { MODEL_NAME } = require("./model_name");
const { constants } = require("../utils/constants");
const Schema = mongoose.Schema;

const appointmentSchema = Schema(
  {
    // **************************************************
    // User Taking Appointment....
    // **************************************************

    user: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.USER,
    },
    prof: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.PROFESSIONAL,
    },
    permissionToSeeProfile: {
      type: Boolean,
      default: false,
    },
    dateByClient: {
      type: Date,
    },
    status: {
      type: String,
      enum: [constants.APPOINTMENT_REQUESTED, constants.APPOINTMENT_ACCEPTED],
      default: constants.APPOINTMENT_REQUESTED,
    },
    // **************************************************
    // Professional just seen the appointment request
    // **************************************************

    hasProfViewed: {
      type: Boolean,
      default: false,
    },
    profViewedAt: Date,

    // **************************************************
    // Professional responded to the appointment request
    // **************************************************

    hasProfRespondedToClient: {
      type: Boolean,
      default: false,
    },
    profRespondedAt: Date,
    dateByProfessional: {
      type: Date,
    },
    messageFromProf: String,
    initAssessmentSlug: String,
    initAssessmentId: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

appointmentSchema.index(
  { user: 1, prof: 1, isActive: 1 },
  { unique: true }
);

const Appointment = mongoose.model(MODEL_NAME.APPOINTMENT, appointmentSchema);
module.exports = Appointment;
