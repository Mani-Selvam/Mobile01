const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");

// Counter for generating enquiry numbers
let enquiryCounter = 0;

// Initialize counter from database
Enquiry.countDocuments().then((count) => {
    enquiryCounter = count;
});

// GET ALL ENQUIRIES (With Search/Filter)
router.get("/", async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};

        // Filter by search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { mobile: search },
            ];
        }

        // Filter by status
        if (status && status !== "All") {
            query.status = status;
        }

        const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADD NEW ENQUIRY
router.post("/", async (req, res) => {
    try {
        console.log("POST /enquiries - Body:", req.body);

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

        // Generate enquiry number
        enquiryCounter++;
        const enqNo = `ENQ-${String(enquiryCounter).padStart(3, "0")}`;

        const newEnquiry = new Enquiry({
            enqNo,
            ...req.body,
            date: new Date().toISOString().split("T")[0],
            status: "New",
        });

        const savedEnquiry = await newEnquiry.save();
        console.log("✅ New enquiry SAVED to MongoDB:", savedEnquiry);
        console.log("✅ Enquiry ID:", savedEnquiry._id);
        console.log("✅ Enquiry Status:", savedEnquiry.status);
        res.status(201).json(savedEnquiry);
    } catch (err) {
        console.error("❌ Error in POST /enquiries:", err.message);
        console.error("❌ Full error:", err);
        res.status(400).json({ message: err.message });
    }
});

// GET SINGLE ENQUIRY
router.get("/:id", async (req, res) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }
        res.json(enquiry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE ENQUIRY
router.put("/:id", async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true },
        );
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
