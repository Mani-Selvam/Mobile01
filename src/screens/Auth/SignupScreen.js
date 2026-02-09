import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInUp, SlideInRight } from "react-native-reanimated";
import * as AuthSession from "expo-auth-session";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { API_URL } from "../../services/apiConfig";

const SignupScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/signup`, {
                name: fullName,
                email,
                password,
                confirmPassword,
            });

            console.log("Signup successful:", response.data);
            await login(response.data.token, response.data.user);
            Alert.alert("Success", "Account created successfully!");
            navigation.navigate("Login");
        } catch (error) {
            Alert.alert(
                "Error",
                error.response?.data?.message || "Signup failed",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            const redirectUri = AuthSession.makeRedirectUri({
                useProxy: true,
            });

            const request = new AuthSession.AuthRequest({
                clientId: "YOUR_GOOGLE_CLIENT_ID", // Replace with your actual client ID
                scopes: ["openid", "profile", "email"],
                responseType: AuthSession.ResponseType.IdToken,
                redirectUri,
                additionalParameters: {},
                prompt: AuthSession.Prompt.SelectAccount,
            });

            const result = await request.promptAsync({
                authorizationEndpoint:
                    "https://accounts.google.com/oauth/v2/auth",
            });

            if (result.type === "success") {
                const response = await axios.post(
                    `${API_URL}/api/auth/google`,
                    {
                        idToken: result.params.id_token,
                    },
                );

                console.log("Google signup successful:", response.data);
                await login(response.data.token, response.data.user);
                Alert.alert("Success", "Account created with Google!");
                navigation.navigate("Home");
            }
        } catch (error) {
            console.error("Google signup error:", error);
            Alert.alert("Error", "Google signup failed");
        }
    };

    return (
        <LinearGradient
            colors={["#0f0f23", "#1a1a2e", "#16213e"]}
            style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled">
                    <Animated.View
                        entering={FadeInUp.delay(100)}
                        style={styles.logoContainer}>
                        {/* Modern App Logo */}
                        <LinearGradient
                            colors={["#667eea", "#764ba2"]}
                            style={styles.logo}>
                            <MaterialCommunityIcons
                                name="account-plus"
                                size={40}
                                color="#fff"
                            />
                        </LinearGradient>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(200)}
                        style={styles.titleContainer}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            Join us and start your journey
                        </Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(300)}
                        style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <MaterialIcons
                                name="person"
                                size={24}
                                color="#667eea"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor="#a0a0a0"
                                value={fullName}
                                onChangeText={setFullName}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons
                                name="email"
                                size={24}
                                color="#667eea"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor="#a0a0a0"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons
                                name="lock"
                                size={24}
                                color="#667eea"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#a0a0a0"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}>
                                <MaterialIcons
                                    name={
                                        showPassword
                                            ? "visibility"
                                            : "visibility-off"
                                    }
                                    size={24}
                                    color="#667eea"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons
                                name="lock-outline"
                                size={24}
                                color="#667eea"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor="#a0a0a0"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }>
                                <MaterialIcons
                                    name={
                                        showConfirmPassword
                                            ? "visibility"
                                            : "visibility-off"
                                    }
                                    size={24}
                                    color="#667eea"
                                />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(400)}
                        style={styles.buttonContainer}>
                        <LinearGradient
                            colors={["#667eea", "#764ba2"]}
                            style={styles.primaryButtonGradient}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleSignup}
                                disabled={loading}>
                                <MaterialCommunityIcons
                                    name={loading ? "loading" : "account-plus"}
                                    size={24}
                                    color="#fff"
                                    style={styles.buttonIcon}
                                />
                                <Text style={styles.primaryButtonText}>
                                    {loading
                                        ? "Creating Account..."
                                        : "Create Account"}
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={handleGoogleSignup}>
                            <MaterialCommunityIcons
                                name="google"
                                size={24}
                                color="#DB4437"
                            />
                            <Text style={styles.googleButtonText}>
                                Sign up with Google
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(500)}
                        style={styles.footer}>
                        <Text style={styles.footerText}>
                            Already have an account?{" "}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.footerLink}>Sign in</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    titleContainer: {
        alignItems: "center",
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 18,
        color: "#a0a0a0",
        textAlign: "center",
    },
    formContainer: {
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 20,
        position: "relative",
        flexDirection: "row",
        alignItems: "center",
    },
    inputIcon: {
        position: "absolute",
        left: 20,
        zIndex: 1,
    },
    input: {
        flex: 1,
        height: 60,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 16,
        paddingHorizontal: 60,
        paddingVertical: 18,
        fontSize: 16,
        backgroundColor: "rgba(255,255,255,0.05)",
        color: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    eyeIcon: {
        position: "absolute",
        right: 20,
    },
    buttonContainer: {
        marginBottom: 40,
    },
    primaryButtonGradient: {
        borderRadius: 16,
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    primaryButton: {
        height: 60,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
    },
    buttonIcon: {
        marginRight: 12,
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    disabledButton: {
        opacity: 0.6,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 32,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    dividerText: {
        paddingHorizontal: 20,
        fontSize: 14,
        color: "#a0a0a0",
        fontWeight: "500",
    },
    googleButton: {
        height: 60,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    googleButtonText: {
        marginLeft: 12,
        fontSize: 16,
        color: "#fff",
        fontWeight: "500",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        fontSize: 16,
        color: "#a0a0a0",
    },
    footerLink: {
        fontSize: 16,
        color: "#667eea",
        fontWeight: "600",
    },
});

export default SignupScreen;
