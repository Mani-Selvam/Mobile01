const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const FollowUp = require("../models/FollowUp");

// GET Follow-ups with Tabs
router.get("/", async (req, res) => {
    try {
        const { tab } = req.query;
        const today = new Date().toISOString().split("T")[0];

        let query = {};

        if (tab === "Today") {
            query = {
                date: today,
                status: { $ne: "Completed" },
            };
        } else if (tab === "Upcoming") {
            query = {
                date: { $gt: today },
                status: { $ne: "Completed" },
            };
        } else if (tab === "Missed") {
            query = {
                date: { $lt: today },
                status: { $ne: "Completed" },
            };
        } else if (tab === "Completed") {
            query = {
                status: "Completed",
            };
        }

        console.log("Fetching follow-ups with query:", query);
        const followUps = await FollowUp.find(query).sort({ date: -1 });
        console.log(`Found ${followUps.length} follow-ups for tab: ${tab}`);
        res.json(followUps);
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

module.exports = router;
