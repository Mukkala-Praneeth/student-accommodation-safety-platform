const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  accommodationName: { type: String, required: true },
  issueType: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Report", ReportSchema);