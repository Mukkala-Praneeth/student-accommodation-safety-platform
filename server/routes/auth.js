const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { generateOTP, sendOTPEmail } = require("../utils/emailService");
const { checkCollegeEmail } = require("../utils/collegeVerification");

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

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: "Name must be at least 2 characters" 
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please enter a valid email address" 
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
    console.log(`[SIGNUP] Email: ${normalizedEmail}, College Check:`, collegeCheck);

    // 6. Create user instance
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "student",
      isCollegeVerified: collegeCheck.isVerified,
      collegeName: collegeCheck.collegeName
    });

    // 7. Save user to MongoDB
    await newUser.save();

    // 8. Generate and send OTP
    await OTP.deleteMany({ email: normalizedEmail, type: 'verification' });
    
    const otp = generateOTP();
    const otpDoc = new OTP({
      email: normalizedEmail,
      otp,
      type: 'verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    await otpDoc.save();

    // Send OTP email (don't block response)
    sendOTPEmail(normalizedEmail, otp, 'verification').catch(err => {
      console.error('OTP email failed:', err);
    });

    // ✅ Build response message
    let message = "Registration successful! Please check your email for the verification code.";
    if (collegeCheck.isVerified) {
      message = `Registration successful! College verified: ${collegeCheck.collegeName}. Check your email for OTP.`;
    }

    res.status(201).json({
      success: true,
      message,
      requiresVerification: true,
      email: newUser.email,
      isCollegeVerified: collegeCheck.isVerified,
      collegeName: collegeCheck.collegeName
    });
  } catch (err) {
    console.error("Signup error:", err);
    
    // Handle MongoDB Duplicate Key Error (11000)
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
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please enter all fields" 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support."
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Your email is not verified. Please verify your email to login.",
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isCollegeVerified: user.isCollegeVerified,
        collegeName: user.collegeName
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isCollegeVerified: user.isCollegeVerified,
            collegeName: user.collegeName,
            profilePhoto: user.profilePhoto
          },
        });
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

module.exports = router;