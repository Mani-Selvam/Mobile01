const express = require("express");
const router = express.Router();

// Mock data
const enquiries = [
    { id: 1, status: "New", name: "Rahul Sharma", date: "2023-10-25" },
    { id: 2, status: "In Progress", name: "Priya Singh", date: "2023-10-24" },
    { id: 3, status: "Converted", name: "Amit Verma", date: "2023-10-20" },
    { id: 4, status: "Closed", name: "Sneha Gupta", date: "2023-10-15" },
];

const followUps = [
    { id: 1, status: "Completed", date: "2023-10-25" },
    { id: 2, status: "Pending", date: "2023-10-26" },
];

// Get All Stats
router.get("/stats", (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const stats = {
            enquiry: {
                newEnqs: enquiries.filter((e) => e.status === "New").length,
                inProgress: enquiries.filter((e) => e.status === "In Progress")
                    .length,
                converted: enquiries.filter((e) => e.status === "Converted")
                    .length,
                closed: enquiries.filter((e) => e.status === "Closed").length,
            },
            followup: {
                today: followUps.filter((f) => f.date === today).length,
                upcoming: followUps.filter((f) => f.date > today).length,
                missed: 0,
                completed: followUps.filter((f) => f.status === "Completed")
                    .length,
            },
            conversion: {
                total: enquiries.length,
                converted: enquiries.filter((e) => e.status === "Converted")
                    .length,
                rate: 25,
            },
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Detailed Lists
router.get("/list", (req, res) => {
    try {
        const { type, filter } = req.query;
        const today = new Date().toISOString().split("T")[0];

        let data = [];

        if (type === "enquiry") {
            if (filter === "new")
                data = enquiries.filter((e) => e.status === "New");
            else if (filter === "inprogress")
                data = enquiries.filter((e) => e.status === "In Progress");
            else if (filter === "converted")
                data = enquiries.filter((e) => e.status === "Converted");
            else if (filter === "closed")
                data = enquiries.filter((e) => e.status === "Closed");
            else data = enquiries;
        } else if (type === "followup") {
            if (filter === "today")
                data = followUps.filter((f) => f.date === today);
            else if (filter === "completed")
                data = followUps.filter((f) => f.status === "Completed");
            else data = followUps;
        } else if (type === "conversion") {
            data = enquiries.filter((e) => e.status === "Converted");
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
