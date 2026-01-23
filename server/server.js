const express = require("express");
const cors = require("cors");

// Init App
const app = express();

// Middleware
app.use(cors()); // Allow React Native to access API
app.use(express.json());

// Routes
app.use("/api/enquiries", require("./routes/enquiryRoutes"));
app.use("/api/followups", require("./routes/followupRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Basic Route
app.get("/", (req, res) => {
    res.send("CRM API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
