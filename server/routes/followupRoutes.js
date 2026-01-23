const express = require("express");
const router = express.Router();

// Mock data storage
let followUps = [
    {
        id: 1,
        enqNo: "ENQ-001",
        name: "Rahul Sharma",
        type: "Call",
        date: new Date().toISOString().split("T")[0],
        time: "10:00 AM",
        status: "Pending",
        notes: "Follow up regarding quotation",
    },
    {
        id: 2,
        enqNo: "ENQ-002",
        name: "Priya Singh",
        type: "Visit",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        time: "02:00 PM",
        status: "Pending",
        notes: "Site inspection",
    },
];

let nextId = 3;

// GET Follow-ups with Tabs
router.get("/", (req, res) => {
    try {
        const { tab } = req.query;
        const today = new Date().toISOString().split("T")[0];

        let filtered = followUps;

        if (tab === "Today") {
            filtered = filtered.filter(
                (f) => f.date === today && f.status !== "Completed",
            );
        } else if (tab === "Upcoming") {
            filtered = filtered.filter(
                (f) => f.date > today && f.status !== "Completed",
            );
        } else if (tab === "Missed") {
            filtered = filtered.filter(
                (f) => f.date < today && f.status !== "Completed",
            );
        } else if (tab === "Completed") {
            filtered = filtered.filter((f) => f.status === "Completed");
        }

        res.json(filtered);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE Follow-up
router.post("/", (req, res) => {
    try {
        const newFollowUp = {
            id: nextId++,
            ...req.body,
            status: "Pending",
        };

        followUps.push(newFollowUp);
        res.status(201).json(newFollowUp);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE Follow-up
router.put("/:id", (req, res) => {
    try {
        const index = followUps.findIndex((f) => f.id == req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: "Follow-up not found" });
        }

        followUps[index] = { ...followUps[index], ...req.body };
        res.json(followUps[index]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE Follow-up
router.delete("/:id", (req, res) => {
    try {
        const index = followUps.findIndex((f) => f.id == req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: "Follow-up not found" });
        }

        const deleted = followUps.splice(index, 1);
        res.json({ message: "Follow-up deleted", data: deleted[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
