require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debugging line to check if JWT_SECRET is loaded
const mongoose = require("mongoose");         
const express = require("express");
const cors = require("cors");
const Report = require("./models/Report");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.post("/api/reports", authMiddleware, async (req, res) => {
  try {
    const { accommodationName, issueType, description } = req.body;

    const newReport = new Report({
      accommodationName,
      issueType,
      description,
      user: req.user.id,
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: "Report saved successfully",
      data: newReport,
    });

  } catch (error) {
    console.error("Error saving report:", error);
    res.status(500).json({
      success: false,
      message: "Error saving report",
    });
  }
});


app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
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
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend API working",
  });
});
app.get('/api/reports', async (req, res) => {
  try {
    console.log("===== GET REPORTS API HIT =====");
    console.log("Report Model Loaded:", typeof Report);
    const reports = await Report.find();
    console.log("Reports Retrieved:", reports);
    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error("===== REPORT FETCH ERROR =====");
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


app.post("/api/reports", async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.json({
      success: true,
      message: "Report saved to database ✅"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error saving report"
    });
  }
});
