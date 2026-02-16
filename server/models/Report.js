const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  accommodationName: { type: String, required: true },
  issueType: { type: String, required: true },
  description: { type: String, required: true },
  images: [{
    url: String,
    publicId: String
  }],
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
    required: true,
    index: true
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
  },
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model("Report", ReportSchema);