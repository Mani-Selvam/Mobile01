import { Platform } from "react-native";

const getApiUrl = () => {
    if (Platform.OS === "web") {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        return `${protocol}//${hostname}:3000/api`;
    }
    return "http://localhost:3000/api";
};

export const API_URL = getApiUrl();
