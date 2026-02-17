const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const FollowUp = require("../models/FollowUp");

// GET Follow-ups with Tabs & Pagination
router.get("/", async (req, res) => {
    try {
        const { tab, page = 1, limit = 20 } = req.query;
        const today = new Date().toISOString().split("T")[0];
        // console.log(`[GET /followups] Tab: ${tab}, Page: ${page}`);

        let query = {};

        // Active tabs should not show Completed or Dropped records (case-insensitive)
        const activeFilter = {
            status: { $nin: ["Completed", "Drop", "Dropped", "dropped", "drop"] },
            nextAction: { $nin: ["Drop", "Dropped", "dropped", "drop"] }
        };

        if (tab === "Today") {
            query = {
                date: today,
                ...activeFilter
            };
        } else if (tab === "Upcoming") {
            query = {
                date: { $gt: today },
                ...activeFilter
            };
        } else if (tab === "Missed") {
            query = {
                date: { $lt: today },
                ...activeFilter
            };
        } else if (tab === "Dropped") {
            query = {
                $or: [
                    { status: "Drop" },
                    { nextAction: "Drop" }
                ]
            };
        } else if (tab === "All") {
            query = {};
        } else if (tab === "Completed") {
            query = {
                status: "Completed",
            };
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // console.log("Fetching follow-ups with query:", JSON.stringify(query));

        // Use populate to get the full enquiry data including the profile image
        const followUps = await FollowUp.find(query)
            .select('date status nextAction remarks enqId enqNo name mobile product createdAt')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate({
                path: 'enqId',
                select: 'name mobile image product enqNo source address requirements status date createdAt'
            })
            .lean();

        const total = await FollowUp.countDocuments(query);

        // console.log(`[GET /followups] Found ${followUps.length} records. Total: ${total}`);
        res.json({
            data: followUps,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) {
        console.error("Get follow-ups error:", err);
        res.status(500).json({ message: err.message });
    }
});

// CREATE Follow-up
router.post("/", async (req, res) => {
    try {
        console.log("=== CREATE FOLLOW-UP ===");
        console.log("Raw request body:", req.body);
        console.log("Type of nextAction:", typeof req.body.nextAction);
        console.log(
            "Value of nextAction:",
            JSON.stringify(req.body.nextAction),
        );
        console.log("Type of remarks:", typeof req.body.remarks);
        console.log("Value of remarks:", JSON.stringify(req.body.remarks));

        const newFollowUp = new FollowUp({
            ...req.body,
            status: "Scheduled",
        });

        console.log("Attempting save with document:", newFollowUp.toObject());
        const saved = await newFollowUp.save();
        console.log("Follow-up created successfully:", saved._id);
        res.status(201).json(saved);
    } catch (err) {
        console.error("=== CREATE ERROR ===");
        console.error("Full error:", err);
        console.error("Error message:", err.message);
        res.status(400).json({ message: err.message });
    }
});

// UPDATE Follow-up
router.put("/:id", async (req, res) => {
    try {
        console.log("Update request for ID:", req.params.id);
        console.log("Update payload:", req.body);

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.log("Invalid ObjectId format:", req.params.id);
            return res
                .status(400)
                .json({ message: "Invalid follow-up ID format" });
        }

        const followUp = await FollowUp.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true },
        );

        if (!followUp) {
            console.log("Follow-up not found with ID:", req.params.id);
            return res.status(404).json({ message: "Follow-up not found" });
        }

        console.log("Follow-up updated successfully:", followUp._id);
        res.json(followUp);
    } catch (err) {
        console.error("Update error:", err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE Follow-up
router.delete("/:id", async (req, res) => {
    try {
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res
                .status(400)
                .json({ message: "Invalid follow-up ID format" });
        }

        const followUp = await FollowUp.findByIdAndDelete(req.params.id);

        if (!followUp) {
            return res.status(404).json({ message: "Follow-up not found" });
        }

        res.json({ message: "Follow-up deleted", data: followUp });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: err.message });
    }
});

// GET Follow-up History (all records for an enquiry)
router.get("/history/:enqNoOrId", async (req, res) => {
    try {
        const { enqNoOrId } = req.params;

        // Try to find by enqNo first, then by ID
        let query = { enqNo: enqNoOrId };

        // If it looks like a MongoDB ID, also search by that
        if (mongoose.Types.ObjectId.isValid(enqNoOrId)) {
            query = { $or: [{ enqNo: enqNoOrId }, { enqId: enqNoOrId }] };
        }

        const history = await FollowUp.find(query)
            .sort({ createdAt: -1 })
            .lean();

        console.log(
            `Found ${history.length} follow-up records for ${enqNoOrId}`,
        );
        res.json(history);
    } catch (err) {
        console.error("Get history error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
