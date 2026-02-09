const axios = require("axios");

const testPayload = {
    enqNo: "ENQ-012",
    name: "Dc",
    date: "2026-02-10",
    time: "",
    type: "WhatsApp",
    remarks: "Sales: ₹500",
    nextAction: "Sales",
};

console.log("Sending test payload:", JSON.stringify(testPayload, null, 2));

axios
    .post("http://localhost:3000/api/followups", testPayload)
    .then((response) => {
        console.log("Success! Status:", response.status);
        console.log("Response:", JSON.stringify(response.data, null, 2));
    })
    .catch((error) => {
        console.error("Error:", error.response?.status, error.response?.data);
    });
