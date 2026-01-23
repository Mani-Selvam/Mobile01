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

// CREATE ENQUIRY
export const createEnquiry = async (enquiryData) => {
    try {
        const client = await createApiClient();
        const response = await client.post("/enquiries", enquiryData);
        return response.data;
    } catch (error) {
        console.error(
            "Create enquiry error:",
            error.response?.data || error.message,
        );
        throw error;
    }
};

// GET ALL ENQUIRIES
export const getAllEnquiries = async () => {
    try {
        const client = await createApiClient();
        const response = await client.get("/enquiries");
        return response.data;
    } catch (error) {
        console.error(
            "Get enquiries error:",
            error.response?.data || error.message,
        );
        throw error;
    }
};

// GET SINGLE ENQUIRY
export const getEnquiryById = async (id) => {
    try {
        const client = await createApiClient();
        const response = await client.get(`/enquiries/${id}`);
        return response.data;
    } catch (error) {
        console.error(
            "Get enquiry error:",
            error.response?.data || error.message,
        );
        throw error;
    }
};

// UPDATE ENQUIRY
export const updateEnquiry = async (id, enquiryData) => {
    try {
        const client = await createApiClient();
        const response = await client.put(`/enquiries/${id}`, enquiryData);
        return response.data;
    } catch (error) {
        console.error(
            "Update enquiry error:",
            error.response?.data || error.message,
        );
        throw error;
    }
};

// DELETE ENQUIRY
export const deleteEnquiry = async (id) => {
    try {
        const client = await createApiClient();
        const response = await client.delete(`/enquiries/${id}`);
        return response.data;
    } catch (error) {
        console.error(
            "Delete enquiry error:",
            error.response?.data || error.message,
        );
        throw error;
    }
};

// GET ENQUIRIES BY STATUS
export const getEnquiriesByStatus = async (status) => {
    try {
        const client = await createApiClient();
        const response = await client.get(`/enquiries/status/${status}`);
        return response.data;
    } catch (error) {
        console.error(
            "Get enquiries by status error:",
            error.response?.data || error.message,
        );
        throw error;
    }
};
