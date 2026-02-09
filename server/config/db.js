const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Try MongoDB Atlas first
        const mongoURI =
            process.env.MONGODB_URI ||
            "mongodb+srv://mani001:001@cluster0.tzie1yt.mongodb.net/crm_db?retryWrites=true&w=majority";

        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (atlasError) {
        console.warn(
            `⚠️  MongoDB Atlas connection failed: ${atlasError.message}`,
        );

        // Fallback to local MongoDB
        try {
            console.log("Attempting to connect to local MongoDB...");
            const conn = await mongoose.connect(
                "mongodb://localhost:27017/crm_db",
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: 5000,
                },
            );
            console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
            return true;
        } catch (localError) {
            console.error(`❌ Both MongoDB Atlas and Local MongoDB failed`);
            console.error(`Atlas Error: ${atlasError.message}`);
            console.error(`Local Error: ${localError.message}`);
            console.log("\n⚠️  Running without database connection. Please:");
            console.log("   1. Start local MongoDB: mongodb");
            console.log("   2. Or check MongoDB Atlas credentials");
            console.log("   3. Or set MONGODB_URI environment variable");
            return false;
        }
    }
};

module.exports = connectDB;
