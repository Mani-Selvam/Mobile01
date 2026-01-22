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
import Animated, { FadeInUp } from "react-native-reanimated";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const API_URL = "http://192.168.1.33:5000";
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        // Check for demo login
        if (email === "user" && password === "user@123") {
            setLoading(true);
            try {
                // Simulate demo login success
                const demoUser = {
                    id: "demo-user-123",
                    email: "user",
                    name: "Demo User",
                    role: "demo",
                };
                const demoToken = "demo-token-123";

                // Store demo data
                await login(demoToken, demoUser);

                console.log("Demo login successful");

                // Navigate to Main
                Alert.alert("Success", "Demo login successful!");
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Main" }],
                });
            } catch (error) {
                Alert.alert("Error", "Demo login failed");
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password,
            });

            // Store token
            await login(response.data.token, response.data.user);

            console.log("Login successful:", response.data);

            // Navigate to Main
            Alert.alert("Success", "Login successful!");
            navigation.reset({
                index: 0,
                routes: [{ name: "Main" }],
            });
        } catch (error) {
            console.error(
                "Login error:",
                error.response?.data || error.message
            );
            Alert.alert(
                "Error",
                error.response?.data?.errors?.[0]?.msg ||
                    error.response?.data?.message ||
                    "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
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
                // Send the id token to your server
                const response = await axios.post(
                    `${API_URL}/api/auth/google`,
                    {
                        idToken: result.params.id_token,
                    }
                );

                console.log("Google login successful:", response.data);
                await AsyncStorage.setItem("token", response.data.token);
                await AsyncStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );
                Alert.alert("Success", "Google login successful!");
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Main" }],
                });
            }
        } catch (_error) {
            console.error("Google login error:", _error);
            Alert.alert("Error", "Google login failed");
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
                                name="rocket-launch"
                                size={40}
                                color="#fff"
                            />
                        </LinearGradient>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(200)}
                        style={styles.titleContainer}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Sign in to your account
                        </Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(300)}
                        style={styles.formContainer}>
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

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>
                                Forgot password?
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(350)}
                        style={styles.demoContainer}>
                        <View style={styles.demoBadge}>
                            <MaterialIcons
                                name="info"
                                size={16}
                                color="#667eea"
                            />
                            <Text style={styles.demoText}>
                                Demo: user / user@123
                            </Text>
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
                                onPress={handleLogin}
                                disabled={loading}>
                                <MaterialIcons
                                    name={loading ? "hourglass-empty" : "login"}
                                    size={24}
                                    color="#fff"
                                    style={styles.buttonIcon}
                                />
                                <Text style={styles.primaryButtonText}>
                                    {loading ? "Signing in..." : "Sign In"}
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
                            onPress={handleGoogleLogin}>
                            <MaterialCommunityIcons
                                name="google"
                                size={24}
                                color="#DB4437"
                            />
                            <Text style={styles.googleButtonText}>
                                Continue with Google
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(500)}
                        style={styles.footer}>
                        <Text style={styles.footerText}>
                            Don&apos;t have an account?{" "}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Signup")}>
                            <Text style={styles.footerLink}>Create one</Text>
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
    forgotPassword: {
        alignSelf: "flex-end",
        marginTop: 8,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: "#667eea",
        fontWeight: "500",
    },
    demoContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    demoBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(102,126,234,0.1)",
        borderWidth: 1,
        borderColor: "rgba(102,126,234,0.3)",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    demoText: {
        fontSize: 14,
        color: "#a0a0a0",
        marginLeft: 8,
        fontWeight: "500",
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

export default LoginScreen;
