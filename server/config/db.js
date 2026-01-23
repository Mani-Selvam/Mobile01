const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Replace 'mongodb://localhost:27017/crm' with your actual DB URL (MongoDB Atlas or Local)
        const conn = await mongoose.connect(
            "mongodb+srv://mani001:001@cluster0.tzie1yt.mongodb.net/?appName=Cluster0",
        );
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
