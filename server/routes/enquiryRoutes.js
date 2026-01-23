const express = require("express");
const router = express.Router();

// Mock data storage (in-memory)
let enquiries = [
    {
        id: 1,
        enqNo: "ENQ-001",
        name: "Rahul Sharma",
        mobile: "9876543210",
        product: "iPhone 15",
        status: "New",
        date: "2023-10-25",
    },
    {
        id: 2,
        enqNo: "ENQ-002",
        name: "Priya Singh",
        mobile: "9876543211",
        product: "Samsung S24",
        status: "In Progress",
        date: "2023-10-24",
    },
    {
        id: 3,
        enqNo: "ENQ-003",
        name: "Amit Verma",
        mobile: "9876543212",
        product: "MacBook Air",
        status: "Converted",
        date: "2023-10-20",
    },
];

let nextId = 4;

// GET ALL ENQUIRIES (With Search/Filter)
router.get("/", (req, res) => {
    try {
        const { search, status } = req.query;
        let filtered = enquiries;

        // Filter by search
        if (search) {
            filtered = filtered.filter(
                (e) =>
                    e.name.toLowerCase().includes(search.toLowerCase()) ||
                    e.mobile.includes(search),
            );
        }

        // Filter by status
        if (status && status !== "All") {
            filtered = filtered.filter((e) => e.status === status);
        }

        res.json(filtered);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADD NEW ENQUIRY
router.post("/", (req, res) => {
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

        const newEnquiry = {
            id: nextId++,
            enqNo: `ENQ-${String(enquiries.length + 1).padStart(3, "0")}`,
            ...req.body,
            date: new Date().toISOString().split("T")[0],
            status: "New",
        };

        enquiries.unshift(newEnquiry);
        console.log("New enquiry created:", newEnquiry);
        res.status(201).json(newEnquiry);
    } catch (err) {
        console.error("Error in POST /enquiries:", err);
        res.status(400).json({ message: err.message });
    }
});

// GET SINGLE ENQUIRY
router.get("/:id", (req, res) => {
    try {
        const enquiry = enquiries.find((e) => e.id == req.params.id);
        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }
        res.json(enquiry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE ENQUIRY
router.put("/:id", (req, res) => {
    try {
        const index = enquiries.findIndex((e) => e.id == req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: "Enquiry not found" });
        }

        enquiries[index] = { ...enquiries[index], ...req.body };
        res.json(enquiries[index]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE ENQUIRY
router.delete("/:id", (req, res) => {
    try {
        const index = enquiries.findIndex((e) => e.id == req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: "Enquiry not found" });
        }

        const deleted = enquiries.splice(index, 1);
        res.json({ message: "Enquiry deleted successfully", data: deleted[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
