const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema({
    enqId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Enquiry",
    },
    enqNo: { type: String, required: true },
    name: { type: String, required: true }, // Cached for easy display
    mobile: { type: String }, // Cached for easy display
    image: { type: String }, // Cached for easy display
    date: { type: String, required: true },
    time: String,
    type: {
        type: String,
        enum: ["WhatsApp", "Visit"],
        default: "WhatsApp",
    },
    remarks: { type: String, required: true },
    nextAction: {
        type: String,
        enum: ["Followup", "Sales", "Drop"],
        required: true,
    },
    status: { type: String, default: "Scheduled" }, // Scheduled, Missed, Completed
    amount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

// Indexes for performance
followUpSchema.index({ date: -1 });
followUpSchema.index({ status: 1 });
followUpSchema.index({ nextAction: 1 });
followUpSchema.index({ enqId: 1 });
followUpSchema.index({ enqNo: 1 });

module.exports = mongoose.model("FollowUp", followUpSchema);
