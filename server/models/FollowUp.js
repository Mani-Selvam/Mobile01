const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema({
    enqId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Enquiry",
        required: true,
    },
    enqNo: { type: String, required: true },
    name: { type: String, required: true }, // Cached for easy display
    date: { type: String, required: true },
    time: String,
    type: {
        type: String,
        enum: ["Call", "WhatsApp", "Visit"],
        default: "Call",
    },
    remarks: { type: String, required: true },
    nextAction: {
        type: String,
        enum: ["Interested", "Need Time", "Not Interested", "Converted"],
        required: true,
    },
    status: { type: String, default: "Scheduled" }, // Scheduled, Missed, Completed
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FollowUp", followUpSchema);
