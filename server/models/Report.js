const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  accommodationName: { type: String, required: true },
  issueType: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  accommodation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Accommodation'
  },
  isCountered: {
    type: Boolean,
    default: false
  },
  counterStatus: {
    type: String,
    enum: ['none', 'pending', 'accepted', 'rejected'],
    default: 'none'
  }
});

module.exports = mongoose.model("Report", ReportSchema);