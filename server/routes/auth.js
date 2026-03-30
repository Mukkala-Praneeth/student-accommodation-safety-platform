const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateOTP, sendOTPEmail } = require('../utils/emailService');
const { checkCollegeEmail } = require('../utils/collegeVerification');  // ✅ NEW
const OTP = require('../models/OTP');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // 1. Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please enter all fields: name, email, and password are required" 
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Check if user exists
    let user = await User.findOne({ email: normalizedEmail }).select('-password');
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ 5. Check if it's a college email
    const collegeCheck = checkCollegeEmail(normalizedEmail);

    // 6. Create user instance
    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "student",
      isCollegeVerified: collegeCheck.isVerified,  // ✅ NEW
      collegeName: collegeCheck.collegeName  // ✅ NEW
    });

    // 7. Save user to MongoDB
    await newUser.save();

    // 8. Generate and send OTP
    const otp = generateOTP();
    const otpDoc = new OTP({
      email: newUser.email.toLowerCase(),
      otp,
      type: 'verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    await otpDoc.save();

    // Send OTP email
    sendOTPEmail(newUser.email, otp, 'verification').catch(err => {
      console.error('OTP email failed:', err);
    });

    res.status(201).json({
      success: true,
      message: collegeCheck.isVerified 
        ? `Registration successful! College verified: ${collegeCheck.collegeName}. Check your email for OTP.`
        : "Registration successful! Please check your email for the verification code.",
      requiresVerification: true,
      email: newUser.email,
      isCollegeVerified: collegeCheck.isVerified,  // ✅ Tell frontend about badge
      collegeName: collegeCheck.collegeName
    });
  } catch (err) {
    console.error("Signup error:", err);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: err.message || "Server error during registration" 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Your email is not verified. Please verify your email to login.",
        requiresVerification: true,
        email: user.email
      });
    }

    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isCollegeVerified: user.isCollegeVerified,  // ✅ Include in JWT
        collegeName: user.collegeName  // ✅ Include in JWT
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isCollegeVerified: user.isCollegeVerified,  // ✅ Send to frontend
            collegeName: user.collegeName
          },
        });
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;