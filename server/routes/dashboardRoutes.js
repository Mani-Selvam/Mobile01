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
    {
        id: 1,
        status: "Pending",
        date: new Date().toISOString().split("T")[0],
    },
];

// Get Dashboard Summary
router.get("/summary", (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const counts = {
            new: enquiries.filter((e) => e.status === "New").length,
            inProgress: enquiries.filter((e) => e.status === "In Progress")
                .length,
            converted: enquiries.filter((e) => e.status === "Converted").length,
            closed: enquiries.filter((e) => e.status === "Closed").length,
        };

        const todayFollowUps = followUps.filter(
            (f) => f.date === today && f.status !== "Completed",
        ).length;

        res.json({
            counts,
            todayFollowUps,
            recentEnquiries: enquiries.slice(0, 5),
            todayList: followUps.slice(0, 5),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
