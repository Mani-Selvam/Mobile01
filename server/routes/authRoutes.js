const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Validation helper
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// Register / Signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        }

        if (!validateEmail(email)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid email format" });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        if (password !== confirmPassword) {
            return res
                .status(400)
                .json({ success: false, message: "Passwords do not match" });
        }

        // Check if user already exists
        let user = await User.findOne({ email }).maxTimeMS(5000);
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Create new user
        user = new User({ name, email, password });
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (err) {
        console.error("Signup error:", err);

        // Check for MongoDB connection timeout
        if (
            err.name === "MongoTimeoutError" ||
            err.message.includes("timed out")
        ) {
            return res.status(503).json({
                success: false,
                message: "Database connection timeout. Please try again later.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error: " + err.message,
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        if (!validateEmail(email)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid email format" });
        }

        // Find user by email
        const user = await User.findOne({ email }).maxTimeMS(5000);
        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid email or password" });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (err) {
        console.error("Login error:", err);

        // Check for MongoDB connection timeout
        if (
            err.name === "MongoTimeoutError" ||
            err.message.includes("timed out")
        ) {
            return res.status(503).json({
                success: false,
                message: "Database connection timeout. Please try again later.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error: " + err.message,
        });
    }
});

// Verify Token (Optional - for protected routes)
router.get("/verify", (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
            success: true,
            message: "Token is valid",
            userId: decoded.userId,
        });
    } catch (err) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

// Get current user profile
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            message: "Profile retrieved successfully",
            user,
        });
    } catch (err) {
        console.error("Profile error:", err);
        res.status(500).json({
            success: false,
            message: "Server error: " + err.message,
        });
    }
});

// Logout
router.post("/logout", verifyToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Logout successful",
        });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({
            success: false,
            message: "Server error: " + err.message,
        });
    }
});

module.exports = router;
