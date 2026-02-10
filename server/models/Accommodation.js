const mongoose = require('mongoose');

const AccommodationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amenities: [{
    type: String
  }],
  totalRooms: {
    type: Number,
    required: true
  },
  occupiedRooms: {
    type: Number,
    default: 0
  },
  pricePerMonth: {
    type: Number,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  riskScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Accommodation', AccommodationSchema);
