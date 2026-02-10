require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const Report = require("./models/Report");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require('./middleware/adminMiddleware');
const ownerMiddleware = require('./middleware/ownerMiddleware');
const User = require('./models/User');
const Accommodation = require('./models/Accommodation');
const CounterReport = require('./models/CounterReport');

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend API working" });
});

// IMPORTANT: my-reports MUST come BEFORE /api/reports
app.get('/api/reports/my-reports', authMiddleware, async (req, res) => {
  try {
    console.log('=== MY REPORTS DEBUG ===');
    console.log('req.user:', req.user);
    const userReports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
    console.log('Found reports:', userReports.length);
    res.json({
      success: true,
      count: userReports.length,
      data: userReports
    });
  } catch (error) {
    console.error('MY REPORTS ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching your reports',
      error: error.message
    });
  }
});

// GET all reports
app.get('/api/reports', async (req, res) => {
  try {
    console.log("===== GET ALL REPORTS =====");
    const reports = await Report.find().sort({ createdAt: -1 });
    console.log("Reports found:", reports.length);
    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error("FETCH ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST new report
app.post('/api/reports', authMiddleware, async (req, res) => {
  try {
    console.log('=== NEW REPORT SUBMIT ===');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);

    const { accommodationName, issueType, description } = req.body;

    const newReport = new Report({
      accommodationName,
      issueType,
      description,
      user: req.user.id
    });

    const saved = await newReport.save();
    console.log('Report saved! ID:', saved._id);

    res.status(201).json({
      success: true,
      message: 'Report saved successfully',
      data: saved
    });
  } catch (error) {
    console.error('SAVE ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error saving report',
      error: error.message
    });
  }
});

// Route 1 - UPDATE report:
app.put('/api/reports/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { accommodationName, issueType, description } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own reports' });
    }

    report.accommodationName = accommodationName;
    report.issueType = issueType;
    report.description = description;

    const updated = await report.save();

    res.json({ success: true, message: 'Report updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating report', error: error.message });
  }
});

// Route 2 - DELETE report:
app.delete('/api/reports/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own reports' });
    }

    await Report.findByIdAndDelete(id);

    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting report', error: error.message });
  }
});

// ============ ADMIN ROUTES ============

// GET admin dashboard stats
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const approvedReports = await Report.countDocuments({ status: 'approved' });
    const rejectedReports = await Report.countDocuments({ status: 'rejected' });
    const totalUsers = await User.countDocuments({ role: 'student' });
    const bannedUsers = await User.countDocuments({ isBanned: true });

    const issueStats = await Report.aggregate([
      { $group: { _id: '$issueType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalReports,
        pendingReports,
        approvedReports,
        rejectedReports,
        totalUsers,
        bannedUsers,
        issueStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
});

// GET all reports for admin
app.get('/api/admin/reports', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reports', error: error.message });
  }
});

// UPDATE report status (approve/reject)
app.put('/api/admin/reports/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, message: `Report ${status}`, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating report', error: error.message });
  }
});

// DELETE any report (admin)
app.delete('/api/admin/reports/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting report', error: error.message });
  }
});

// GET all users
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
});

// BAN/UNBAN user
app.put('/api/admin/users/:id/ban', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isBanned },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: isBanned ? 'User banned successfully' : 'User unbanned successfully',
      data: user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
});

// Get all counter reports (Admin)
app.get('/api/admin/counter-reports', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const counterReports = await CounterReport.find()
      .populate('originalReport')
      .populate('accommodation', 'name')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: counterReports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching counter reports', error: error.message });
  }
});

// Review counter report (Admin)
app.put('/api/admin/counter-reports/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const counterReport = await CounterReport.findByIdAndUpdate(
      id,
      { status, adminNotes, reviewedAt: new Date() },
      { new: true }
    );

    if (!counterReport) {
      return res.status(404).json({ success: false, message: 'Counter report not found' });
    }

    await Report.findByIdAndUpdate(counterReport.originalReport, {
      counterStatus: status,
      status: status === 'accepted' ? 'rejected' : undefined
    });

    res.json({ success: true, message: `Counter report ${status}`, data: counterReport });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error reviewing counter report', error: error.message });
  }
});

// ============ OWNER ROUTES ============

// Register as owner
app.post('/api/auth/register-owner', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'owner',
      phone
    });

    await newUser.save();

    const jwt = require('jsonwebtoken');
    const payload = {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Owner registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error registering owner', error: error.message });
  }
});

// Get owner dashboard stats
app.get('/api/owner/stats', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const accommodations = await Accommodation.find({ owner: req.user.id });
    
    const totalAccommodations = accommodations.length;
    const totalRooms = accommodations.reduce((sum, a) => sum + a.totalRooms, 0);
    const occupiedRooms = accommodations.reduce((sum, a) => sum + a.occupiedRooms, 0);
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const totalReports = await Report.countDocuments({ 
      accommodationName: { $in: accommodations.map(a => a.name) }
    });
    const pendingCounters = await CounterReport.countDocuments({ 
      owner: req.user.id, 
      status: 'pending' 
    });

    res.json({
      success: true,
      data: {
        totalAccommodations,
        totalRooms,
        occupiedRooms,
        occupancyRate,
        totalReports,
        pendingCounters
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
});

// Get owner's accommodations
app.get('/api/owner/accommodations', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const accommodations = await Accommodation.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: accommodations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching accommodations', error: error.message });
  }
});

// Add new accommodation
app.post('/api/owner/accommodations', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const { name, address, city, description, amenities, totalRooms, pricePerMonth, contactPhone } = req.body;

    const newAccommodation = new Accommodation({
      name,
      address,
      city,
      description,
      amenities: amenities || [],
      totalRooms,
      pricePerMonth,
      contactPhone,
      owner: req.user.id
    });

    const saved = await newAccommodation.save();
    res.status(201).json({ success: true, message: 'Accommodation added successfully', data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding accommodation', error: error.message });
  }
});

// Update accommodation
app.put('/api/owner/accommodations/:id', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const accommodation = await Accommodation.findById(id);
    if (!accommodation) {
      return res.status(404).json({ success: false, message: 'Accommodation not found' });
    }
    
    if (accommodation.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Accommodation.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, message: 'Accommodation updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating accommodation', error: error.message });
  }
});

// Delete accommodation
app.delete('/api/owner/accommodations/:id', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const accommodation = await Accommodation.findById(id);
    if (!accommodation) {
      return res.status(404).json({ success: false, message: 'Accommodation not found' });
    }
    
    if (accommodation.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Accommodation.findByIdAndDelete(id);
    res.json({ success: true, message: 'Accommodation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting accommodation', error: error.message });
  }
});

// Get reports on owner's accommodations
app.get('/api/owner/reports', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const accommodations = await Accommodation.find({ owner: req.user.id });
    const accommodationNames = accommodations.map(a => a.name);

    const reports = await Report.find({ 
      accommodationName: { $in: accommodationNames }
    })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reports', error: error.message });
  }
});

// Submit counter report
app.post('/api/owner/counter-report', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const { reportId, reason, explanation, evidenceUrls, evidenceDescription } = req.body;

    const originalReport = await Report.findById(reportId);
    if (!originalReport) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const accommodation = await Accommodation.findOne({ 
      name: originalReport.accommodationName,
      owner: req.user.id 
    });

    if (!accommodation) {
      return res.status(403).json({ success: false, message: 'Not authorized to counter this report' });
    }

    const existingCounter = await CounterReport.findOne({ originalReport: reportId });
    if (existingCounter) {
      return res.status(400).json({ success: false, message: 'Counter report already submitted for this report' });
    }

    const counterReport = new CounterReport({
      originalReport: reportId,
      accommodation: accommodation._id,
      owner: req.user.id,
      reason,
      explanation,
      evidenceUrls: evidenceUrls || [],
      evidenceDescription
    });

    await counterReport.save();

    await Report.findByIdAndUpdate(reportId, { 
      isCountered: true, 
      counterStatus: 'pending' 
    });

    res.status(201).json({ success: true, message: 'Counter report submitted successfully', data: counterReport });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting counter report', error: error.message });
  }
});

// Get owner's counter reports
app.get('/api/owner/counter-reports', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const counterReports = await CounterReport.find({ owner: req.user.id })
      .populate('originalReport')
      .populate('accommodation', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: counterReports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching counter reports', error: error.message });
  }
});

// Update room occupancy
app.put('/api/owner/accommodations/:id/occupancy', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { occupiedRooms } = req.body;

    const accommodation = await Accommodation.findById(id);
    if (!accommodation) {
      return res.status(404).json({ success: false, message: 'Accommodation not found' });
    }

    if (accommodation.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (occupiedRooms > accommodation.totalRooms) {
      return res.status(400).json({ success: false, message: 'Occupied rooms cannot exceed total rooms' });
    }

    accommodation.occupiedRooms = occupiedRooms;
    await accommodation.save();

    res.json({ success: true, message: 'Occupancy updated', data: accommodation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating occupancy', error: error.message });
  }
});

// TEMPORARY: Make user admin (DELETE THIS AFTER USE)
app.put('/api/make-admin/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: `${email} is now an admin!`,
      data: user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error("MongoDB connection error:", err));


