import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import AddEnquiryScreen from "../screens/AddEnquiryScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import SignupScreen from "../screens/Auth/SignupScreen";
import EnquiryScreen from "../screens/EnquiryScreen";
import FollowUpScreen from "../screens/FollowUpScreen";
import Home from "../screens/HomeScreen";
import IntroScreen from "../screens/IntroScreen";
import LeadSourceScreen from "../screens/LeadSourceScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ReportScreen from "../screens/ReportScreen";
import StaffScreen from "../screens/StaffScreen";
import notificationService from "../services/notificationService";
import { navigationRef } from "./navigationRef";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Enquiry Stack Navigator
function EnquiryStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="EnquiryList" component={EnquiryScreen} />
            <Stack.Screen name="AddEnquiry" component={AddEnquiryScreen} />
        </Stack.Navigator>
    );
}

function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="home-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Enquiry"
                component={EnquiryStackNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="help-circle-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="FollowUp"
                component={FollowUpScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="calendar-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Report"
                component={ReportScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="bar-chart-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}


export default function AppNavigator() {
    const { isLoggedIn, onboardingCompleted, isLoading } = useAuth();

    // Setup global notification listener
    useEffect(() => {
        const subscription = notificationService.setupGlobalNotificationListener(navigationRef);
        return () => {
            subscription && subscription.remove();
        };
    }, []);

    // Show loading spinner while checking auth state
    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
            {!isLoggedIn ? (
                // Auth Stack
                <Stack.Navigator
                    screenOptions={{ headerShown: false }}
                    initialRouteName="Intro">
                    <Stack.Screen name="Intro" component={IntroScreen} />
                    <Stack.Screen
                        name="Onboarding"
                        component={OnboardingScreen}
                    />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                </Stack.Navigator>
            ) : (
                // App Stack (logged in)
                <Stack.Navigator
                    screenOptions={{ headerShown: false }}
                    initialRouteName="Main">
                    <Stack.Screen name="Main" component={MainTabNavigator} />
                    <Stack.Screen
                        name="LeadSourceScreen"
                        component={LeadSourceScreen}
                    />
                    <Stack.Screen name="StaffScreen" component={StaffScreen} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
}
