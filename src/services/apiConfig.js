import { Platform } from "react-native";

const getApiUrl = () => {
    // For React Native mobile devices
    if (Platform.OS === "android" || Platform.OS === "ios") {
        // Replace with your actual server IP/URL
        // For Android emulator, use: http://10.0.2.2:3000
        // For physical device, use your machine's IP: http://192.168.x.x:3000
        return "http://192.168.1.33:3000/api"; // Change IP to your server
    }

    // For web (Replit)
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        if (hostname.includes(".replit.dev") || hostname.includes(".repl.co")) {
            const apiHostname = hostname.replace("-5000.", "-3000.");
            return `${window.location.protocol}//${apiHostname}/api`;
        }
    }

    return "http://localhost:3000/api";
};

export const API_URL = getApiUrl();
