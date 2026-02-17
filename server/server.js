const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// Init App
const app = express();

app.use(
    cors({
        origin: [
            "http://127.0.0.1:5173",
            "http://localhost:8081",
            "http://127.0.0.1:8081",
            "exp://192.168.1.33:8081",
            "http://192.168.1.34:5000",
            "http://192.168.1.34",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }),
);

// Increase JSON body size limit for base64 images

// Increase JSON body size limit for base64 images
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/enquiries", require("./routes/enquiryRoutes"));
app.use("/api/followups", require("./routes/followupRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/leadsources", require("./routes/leadSourceRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));

// Basic Route
app.get("/", (req, res) => {
    res.send("CRM API is running...");
});

const startServer = async () => {
    const PORT = process.env.API_PORT || 5000;
    try {
        await connectDB();
    } catch (e) {
        // connectDB already logs errors; continue to start server if desired
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server started on port ${PORT}`);
    });
};

startServer();
