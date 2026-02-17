const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");
const FollowUp = require("../models/FollowUp");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, "../uploads");
        // Ensure uploads directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
        );
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(
            path.extname(file.originalname).toLowerCase(),
        );

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only image files are allowed!"));
    },
});

// Helper: Generate next enquiry number by querying the database
// Helper: Generate next enquiry number efficiently
const generateEnquiryNumber = async () => {
    try {
        // Find the latest enquiry by sorting enqNo in descending order
        // This relies on consistent numbering ENQ-XXX
        // We use natural sort if possible, but standard string sort might be "ENQ-10" < "ENQ-9"
        // So relying on createdAt is safer for finding the 'latest', then parsing its ID

        const latestEnquiry = await Enquiry.findOne({}, { enqNo: 1 })
            .sort({ createdAt: -1 })
            .lean();

        let nextNumber = 1;

        if (latestEnquiry && latestEnquiry.enqNo) {
            const match = latestEnquiry.enqNo.match(/\d+/);
            if (match) {
                nextNumber = parseInt(match[0], 10) + 1;
            }
        }

        return `ENQ-${String(nextNumber).padStart(3, "0")}`;
    } catch (error) {
        console.error("Error generating enquiry number:", error);
        const count = await Enquiry.countDocuments();
        return `ENQ-${String(count + 1).padStart(3, "0")}`;
    }
};

// GET ALL ENQUIRIES (With Search/Filter & Pagination)
router.get("/", async (req, res) => {
    try {
        const { search, status, page = 1, limit = 20 } = req.query;
        let query = {};

        // Filter by search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { mobile: search },
                { enqNo: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by status
        if (status && status !== "All") {
            query.status = status;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Use .lean() for faster read performance
        const enquiries = await Enquiry.find(query)
            .select('name mobile image product enqNo status enqType date createdAt cost address source requirements')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const total = await Enquiry.countDocuments(query);

        res.json({
            data: enquiries,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADD NEW ENQUIRY (with optional image upload)
router.post("/", upload.single("image"), async (req, res) => {
    try {
        console.log("POST /enquiries - Body:", req.body);
        console.log("POST /enquiries - File:", req.file);

        const { name, mobile, product, cost } = req.body;

        if (!name || !mobile || !product || !cost) {
            console.log(
                "Missing fields - name:",
                name,
                "mobile:",
                mobile,
                "product:",
                product,
                "cost:",
                cost,
            );
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Generate enquiry number dynamically from database
        const enqNo = await generateEnquiryNumber();

        // Handle image - either from file upload or base64 string
        let imageData = null;
        if (req.file) {
            // File was uploaded via multipart/form-data
            imageData = `/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            // Image sent as base64 or URI string in JSON
            imageData = req.body.image;
        }

        const newEnquiry = new Enquiry({
            enqNo,
            ...req.body,
            image: imageData,
            date: new Date().toISOString().split("T")[0],
            status: "New",
        });

        const savedEnquiry = await newEnquiry.save();
        console.log("✅ New enquiry SAVED to MongoDB:", savedEnquiry);

        // --- NEW: Automatically create a follow-up for 'Today' ---
        try {
            const todayStr = new Date().toISOString().split("T")[0];
            const initialFollowUp = new FollowUp({
                enqId: savedEnquiry._id,
                enqNo: savedEnquiry.enqNo,
                name: savedEnquiry.name,
                mobile: savedEnquiry.mobile,
                image: savedEnquiry.image,
                date: todayStr,
                time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                type: "WhatsApp",
                remarks: "Initial Enquiry Created",
                nextAction: "Followup",
                status: "Scheduled"
            });
            const savedFollowUp = await initialFollowUp.save();
            console.log("✅ Initial follow-up created successfully!");
            console.log("   ID:", savedFollowUp._id);
            console.log("   Date:", savedFollowUp.date);
            console.log("   EnqNo:", savedFollowUp.enqNo);
        } catch (fErr) {
            console.error("❌ Failed to create initial follow-up:", fErr.message);
        }

        res.status(201).json(savedEnquiry);
    } catch (err) {
        console.error("❌ Error in POST /enquiries:", err.message);
        console.error("❌ Full error:", err);

        // If it's a duplicate key error, try with a fallback enqNo
        if (err.code === 11000 && err.keyPattern?.enqNo) {
            console.warn(
                "⚠️ Duplicate enqNo detected, retrying with fallback...",
            );
            const fallbackEnqNo = `ENQ-${Date.now().toString().slice(-6)}`;
            try {
                let imageData = null;
                if (req.file) {
                    imageData = `/uploads/${req.file.filename}`;
                } else if (req.body.image) {
                    imageData = req.body.image;
                }

                const retryEnquiry = new Enquiry({
                    enqNo: fallbackEnqNo,
                    ...req.body,
                    image: imageData,
                    date: new Date().toISOString().split("T")[0],
                    status: "New",
                });
                const savedEnquiry = await retryEnquiry.save();
                console.log(
                    "✅ Enquiry saved with fallback enqNo:",
                    fallbackEnqNo,
                );
                return res.status(201).json(savedEnquiry);
            } catch (retryErr) {
                console.error("❌ Retry also failed:", retryErr.message);
                return res.status(400).json({
                    message: "Failed to create enquiry: " + retryErr.message,
                });
            }
        }

        res.status(400).json({ message: err.message });
    }
});

// GET SINGLE ENQUIRY (Supports both MongoDB ID and enqNo)
router.get("/:id", async (req, res) => {
    try {
        let enquiry;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            enquiry = await Enquiry.findById(req.params.id).lean();
        } else {
            enquiry = await Enquiry.findOne({ enqNo: req.params.id }).lean();
        }

        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }
        res.json(enquiry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE ENQUIRY (with optional image upload)
router.put("/:id", upload.single("image"), async (req, res) => {
    try {
        // Handle image - either from file upload or base64 string
        let updateData = { ...req.body };

        if (req.file) {
            // File was uploaded via multipart/form-data
            updateData.image = `/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            // Image sent as base64 or URI string in JSON
            updateData.image = req.body.image;
        }

        let enquiry;
        if (require("mongoose").Types.ObjectId.isValid(req.params.id)) {
            enquiry = await Enquiry.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true },
            );
        } else {
            enquiry = await Enquiry.findOneAndUpdate(
                { enqNo: req.params.id },
                updateData,
                { new: true, runValidators: true },
            );
        }
        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }
        res.json(enquiry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE ENQUIRY
router.delete("/:id", async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }
        res.json({ message: "Enquiry deleted successfully", data: enquiry });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
