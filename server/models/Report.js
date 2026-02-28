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
    enum: ['pending', 'approved', 'rejected', 'resolved', 'verified', 'disputed'],
    default: 'pending'
  },
  resolution: {
    description: { type: String, default: '' },
    images: [{
      url: { type: String },
      publicId: { type: String }
    }],
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    actionTaken: { type: String, default: '' }
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    feedback: { type: String, default: '' },
    isDisputed: { type: Boolean, default: false },
    disputeReason: { type: String, default: '' }
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