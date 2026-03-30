const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "owner", "admin"],
    default: "student",
  },
  phone: {
    type: String,
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // ✅ ADDED: College verification fields
  isCollegeVerified: {
    type: Boolean,
    default: false
  },
  collegeName: {
    type: String,
    default: null
  },
  // ✅ ADDED: Profile photo
  profilePhoto: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);