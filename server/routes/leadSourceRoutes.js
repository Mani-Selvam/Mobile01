const express = require("express");
const router = express.Router();
const LeadSource = require("../models/LeadSource");
const { protect } = require("../routes/authRoutes");

// GET ALL LEAD SOURCES
router.get("/", async (req, res) => {
    try {
        const leadSources = await LeadSource.find().lean();
        res.status(200).json(leadSources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET SINGLE LEAD SOURCE
router.get("/:id", async (req, res) => {
    try {
        const leadSource = await LeadSource.findById(req.params.id).lean();
        if (!leadSource) {
            return res.status(404).json({ error: "Lead source not found" });
        }
        res.status(200).json(leadSource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE LEAD SOURCE
router.post("/", async (req, res) => {
    try {
        const { name, sources } = req.body;

        // Validate input
        if (!name || !Array.isArray(sources) || sources.length === 0) {
            return res.status(400).json({
                error: "Lead source name and at least one source are required",
            });
        }

        const newLeadSource = new LeadSource({
            name,
            sources,
        });

        const savedLeadSource = await newLeadSource.save();
        res.status(201).json(savedLeadSource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE LEAD SOURCE
router.put("/:id", async (req, res) => {
    try {
        const { name, sources } = req.body;

        const leadSource = await LeadSource.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    name,
                    sources,
                    updatedAt: new Date(),
                },
            },
            { new: true, runValidators: true },
        );

        if (!leadSource) {
            return res.status(404).json({ error: "Lead source not found" });
        }

        res.status(200).json(leadSource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE LEAD SOURCE
router.delete("/:id", async (req, res) => {
    try {
        const leadSource = await LeadSource.findByIdAndDelete(req.params.id);

        if (!leadSource) {
            return res.status(404).json({ error: "Lead source not found" });
        }

        res.status(200).json({ message: "Lead source deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
