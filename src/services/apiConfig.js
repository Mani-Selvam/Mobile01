
const getApiUrl = () => {
    // Get API URL from environment variable
    // In Expo, EXPO_PUBLIC_ variables are automatically available
    const envApiUrl = process.env.EXPO_PUBLIC_API_URL;

    if (envApiUrl) {
        console.log("📡 Using API URL from .env:", envApiUrl);
        return envApiUrl;
    }

    // If no environment variable is set, show error
    console.error(`
❌ ERROR: EXPO_PUBLIC_API_URL is not defined!

Please ensure your .env file contains:
EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api

Then restart Expo with: npx expo start -c
    `);

    throw new Error("EXPO_PUBLIC_API_URL not configured in .env file");
};

export const API_URL = getApiUrl();
console.log("🔗 API_URL configured as:", API_URL);
