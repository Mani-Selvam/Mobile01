import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./apiConfig";

// Create axios instance with auth token
const createApiClient = async () => {
    const token = await AsyncStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
    };

    // Only add Authorization header if token exists
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return axios.create({
        baseURL: API_URL,
        headers,
    });
};

// GET FOLLOWUPS (with tab filter)
export const getFollowUps = async (tab = "Today") => {
    try {
        const client = await createApiClient();
        const response = await client.get("/followups", {
            params: { tab },
        });
        return response.data;
    } catch (error) {
        console.error(
            "Get followups error:",
            error.response?.data || error.message,
        );
        throw error;
    }
};

// CREATE FOLLOWUP
export const createFollowUp = async (followUpData) => {
    try {
        const client = await createApiClient();
        const response = await client.post("/followups", followUpData);
        return response.data;
    } catch (error) {
        console.error(
            "Create followup error:",
            error.response?.data || error.message,
        );
        throw error;
    }
};

// UPDATE FOLLOWUP
export const updateFollowUp = async (id, followUpData) => {
    try {
        const client = await createApiClient();
        const response = await client.put(`/followups/${id}`, followUpData);
        return response.data;
    } catch (error) {
        console.error(
            "Update followup error:",
            error.response?.data || error.message,
        );
        throw error;
    }
};

// DELETE FOLLOWUP
export const deleteFollowUp = async (id) => {
    try {
        const client = await createApiClient();
        const response = await client.delete(`/followups/${id}`);
        return response.data;
    } catch (error) {
        console.error(
            "Delete followup error:",
            error.response?.data || error.message,
        );
        throw error;
    }
};
