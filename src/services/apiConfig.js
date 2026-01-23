import { Platform } from "react-native";

const getApiUrl = () => {
    // In Replit web preview, we should use the domain of the workspace for API calls
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const apiHostname = hostname.replace('-5000.', '-3000.');
        return `${window.location.protocol}//${apiHostname}/api`;
    }
    return "http://localhost:3000/api"; 
};

export const API_URL = getApiUrl();
