console.log("AUTH ROUTES LOADED");

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post("/signup", async (req, res) => {
  console.log("Signup request received:", req.body);
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
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create user instance
    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "student",
    });

    // 6. Save user to MongoDB
    await newUser.save();
    console.log("User saved successfully:", newUser.email);

    res.status(201).json({ 
      success: true, 
      message: "User registered successfully" 
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
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
