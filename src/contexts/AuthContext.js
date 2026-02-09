import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../services/apiConfig";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                setIsLoggedIn(true);
            }
            const onboarded = await AsyncStorage.getItem("onboardingCompleted");
            if (onboarded === "true") {
                setOnboardingCompleted(true);
            }
            setIsLoading(false);
        };
        checkStatus();
    }, []);

    const login = async (token, user) => {
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(user));
        setIsLoggedIn(true);
    };

    const logout = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (token && token !== "demo-token-123") {
                // Call logout endpoint on server (skip for demo user)
                try {
                    const response = await fetch(`${API_URL}/auth/logout`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    console.log("Logout response:", response.status);
                } catch (apiError) {
                    console.log("Logout API error:", apiError);
                    // Continue with local logout even if API fails
                }
            }
        } catch (error) {
            console.log("Logout error:", error);
        } finally {
            // Clear all local storage
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            // Update state AFTER clearing storage
            setIsLoggedIn(false);
        }
    };

    const completeOnboarding = async () => {
        await AsyncStorage.setItem("onboardingCompleted", "true");
        setOnboardingCompleted(true);
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                onboardingCompleted,
                isLoading,
                login,
                logout,
                completeOnboarding,
            }}>
            {children}
        </AuthContext.Provider>
    );
};
