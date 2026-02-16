require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const path = require("path");
const Report = require("./models/Report");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require('./middleware/adminMiddleware');
const ownerMiddleware = require('./middleware/ownerMiddleware');
const User = require('./models/User');
const Accommodation = require('./models/Accommodation');
const CounterReport = require('./models/CounterReport');
const { cloudinary, upload } = require('./config/cloudinary');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend API working" });
});

// ============ IMAGE UPLOAD ROUTES ============

// Upload images
app.post('/api/upload', authMiddleware, upload.array('images', 5), (req, res) => {
  try {
    console.log('[Upload] Received upload request');
    console.log('[Upload] Files count:', req.files ? req.files.length : 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadedImages = req.files.map(file => {
      console.log('[Upload] Processing file:', file.filename);
      return {
        url: file.path,
        publicId: file.filename
      };
    });

    console.log('[Upload] Uploaded images:', uploadedImages);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: uploadedImages
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    res.status(500).json({ success: false, message: 'Error uploading images', error: error.message });
  }
});

// Delete image
app.delete('/api/upload/:publicId', authMiddleware, async (req, res) => {
  try {
    const { publicId } = req.params;

    // Destroy the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return res.status(400).json({ success: false, message: 'Error deleting image from cloud' });
    }

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Error deleting image', error: error.message });
  }
});

// ============ REPORT ROUTES ============
app.get('/api/reports/my-reports', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userReports = await Report.find({ user: req.user.id })
      .select('accommodationName issueType description images createdAt status upvotes upvotedBy user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      count: userReports.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
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
    console.log('=== NEW REPORT SUBMISSION ===');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);

    const { accommodationName, issueType, description, images } = req.body;

    // Validate required fields
    if (!accommodationName || !issueType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate and filter images
    let validatedImages = [];
    if (images && Array.isArray(images)) {
      validatedImages = images.filter(img => img && img.url && img.publicId);
      console.log('Validated images:', validatedImages.length, 'of', images.length);
    }

    console.log('Creating report with:', {
      accommodationName,
      issueType,
      description,
      imageCount: validatedImages.length,
      userId: req.user.id
    });

    const newReport = new Report({
      accommodationName,
      issueType,
      description,
      images: validatedImages,
      user: req.user.id
    });

    const saved = await newReport.save();
    console.log('Report saved successfully! ID:', saved._id);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: saved
    });
  } catch (error) {
    console.error('SAVE ERROR:', error);
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
    const { accommodationName, issueType, description, images } = req.body;

    console.log('=== UPDATE REPORT ===');
    console.log('Report ID:', id);
    console.log('User ID:', req.user.id);
    console.log('Updated data:', { accommodationName, issueType, description, images });

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reports'
      });
    }

    // Update fields
    report.accommodationName = accommodationName;
    report.issueType = issueType;
    report.description = description;

    // Update images if provided
    if (images !== undefined) {
      report.images = images;
    }

    const updated = await report.save();

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('UPDATE ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
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

app.post('/api/reports/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.user.toString() === userId) {
      return res.status(400).json({ success: false, message: 'Cannot upvote your own report' });
    }

    const alreadyUpvoted = report.upvotedBy.some(id => id.toString() === userId);

    if (alreadyUpvoted) {
      report.upvotedBy = report.upvotedBy.filter(id => id.toString() !== userId);
      report.upvotes = Math.max(0, report.upvotes - 1);
    } else {
      report.upvotedBy.push(userId);
      report.upvotes += 1;
    }

    await report.save();

    res.json({
      success: true,
      data: {
        upvotes: report.upvotes,
        hasUpvoted: !alreadyUpvoted
      }
    });
  } catch (error) {
    console.error('UPVOTE ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Error processing upvote' });
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

// ============ PROFILE ROUTES ============

// Get profile with stats
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const totalReports = await Report.countDocuments({ user: req.user.id });

    const upvoteResult = await Report.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: null, totalUpvotes: { $sum: '$upvotes' } } }
    ]);

    const totalUpvotes = upvoteResult.length > 0 ? upvoteResult[0].totalUpvotes : 0;

    res.json({
      success: true,
      data: {
        ...user,
        totalReports,
        totalUpvotes
      }
    });
  } catch (error) {
    console.error('PROFILE ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// Update name
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true }
    ).select('-password');

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('PROFILE UPDATE ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// Change password
app.put('/api/profile/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('PASSWORD CHANGE ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Error changing password' });
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


