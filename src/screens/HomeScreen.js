import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useAuth } from "../contexts/AuthContext";
import { navigationRef } from "../navigation/navigationRef";

export default function HomeScreen({ navigation }) {
    const { logout } = useAuth();

    // Mock data for dashboard
    const dashboardData = {
        totalEnquiries: 150,
        pendingFollowUps: 20,
        completedFollowUps: 130,
        conversions: 45,
    };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                onPress: async () => {
                    await logout();
                    navigationRef.reset({
                        index: 0,
                        routes: [{ name: "Login" }],
                    });
                },
            },
        ]);
    };

    return (
        <LinearGradient
            colors={["#0f0f23", "#1a1a2e", "#16213e"]}
            style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                <Animated.View
                    entering={FadeInUp.delay(100)}
                    style={styles.header}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.title}>Lead Management</Text>
                            <Text style={styles.subtitle}>
                                Dashboard & Overview
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}>
                            <MaterialIcons
                                name="logout"
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                <Animated.View
                    entering={FadeInUp.delay(200)}
                    style={styles.summary}>
                    <LinearGradient
                        colors={[
                            "rgba(102,126,234,0.1)",
                            "rgba(118,75,162,0.1)",
                        ]}
                        style={styles.summaryItem}>
                        <MaterialCommunityIcons
                            name="account-search"
                            size={32}
                            color="#667eea"
                            style={styles.summaryIcon}
                        />
                        <Text style={styles.summaryNumber}>
                            {dashboardData.totalEnquiries}
                        </Text>
                        <Text style={styles.summaryLabel}>Total Enquiries</Text>
                    </LinearGradient>

                    <LinearGradient
                        colors={["rgba(255,193,7,0.1)", "rgba(255,152,0,0.1)"]}
                        style={styles.summaryItem}>
                        <MaterialCommunityIcons
                            name="clock-outline"
                            size={32}
                            color="#ffc107"
                            style={styles.summaryIcon}
                        />
                        <Text style={styles.summaryNumber}>
                            {dashboardData.pendingFollowUps}
                        </Text>
                        <Text style={styles.summaryLabel}>
                            Pending Follow-ups
                        </Text>
                    </LinearGradient>

                    <LinearGradient
                        colors={["rgba(40,167,69,0.1)", "rgba(34,197,94,0.1)"]}
                        style={styles.summaryItem}>
                        <MaterialCommunityIcons
                            name="check-circle"
                            size={32}
                            color="#28a745"
                            style={styles.summaryIcon}
                        />
                        <Text style={styles.summaryNumber}>
                            {dashboardData.completedFollowUps}
                        </Text>
                        <Text style={styles.summaryLabel}>
                            Completed Follow-ups
                        </Text>
                    </LinearGradient>

                    <LinearGradient
                        colors={["rgba(0,123,255,0.1)", "rgba(0,86,179,0.1)"]}
                        style={styles.summaryItem}>
                        <MaterialCommunityIcons
                            name="trending-up"
                            size={32}
                            color="#007bff"
                            style={styles.summaryIcon}
                        />
                        <Text style={styles.summaryNumber}>
                            {dashboardData.conversions}
                        </Text>
                        <Text style={styles.summaryLabel}>Conversions</Text>
                    </LinearGradient>
                </Animated.View>
                <Animated.View
                    entering={FadeInUp.delay(300)}
                    style={styles.alerts}>
                    <View style={styles.alertHeader}>
                        <MaterialIcons
                            name="warning"
                            size={24}
                            color="#ffc107"
                        />
                        <Text style={styles.alertTitle}>Alerts</Text>
                    </View>
                    <Text style={styles.alertText}>5 overdue follow-ups</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(400)}
                    style={styles.quickActions}>
                    <LinearGradient
                        colors={["#667eea", "#764ba2"]}
                        style={styles.actionButtonGradient}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate("Enquiry")}>
                            <MaterialCommunityIcons
                                name="account-plus"
                                size={24}
                                color="#fff"
                                style={styles.actionIcon}
                            />
                            <Text style={styles.actionButtonText}>
                                Add Enquiry
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>

                    <LinearGradient
                        colors={["#28a745", "#20c997"]}
                        style={styles.actionButtonGradient}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate("FollowUp")}>
                            <MaterialCommunityIcons
                                name="calendar-plus"
                                size={24}
                                color="#fff"
                                style={styles.actionIcon}
                            />
                            <Text style={styles.actionButtonText}>
                                Add Follow-Up
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 40,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#a0a0a0",
    },
    logoutButton: {
        backgroundColor: "rgba(220,53,69,0.2)",
        borderWidth: 1,
        borderColor: "rgba(220,53,69,0.3)",
        padding: 12,
        borderRadius: 12,
    },
    summary: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 32,
        flexWrap: "wrap",
    },
    summaryItem: {
        flex: 1,
        minWidth: "45%",
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 20,
        margin: 4,
        borderRadius: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    summaryIcon: {
        marginBottom: 8,
    },
    summaryNumber: {
        fontSize: 28,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: "#a0a0a0",
        textAlign: "center",
        fontWeight: "500",
    },
    alerts: {
        backgroundColor: "rgba(255,193,7,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,193,7,0.2)",
        padding: 20,
        borderRadius: 16,
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    alertHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    alertTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffc107",
        marginLeft: 8,
    },
    alertText: {
        color: "#fff",
        fontSize: 14,
    },
    quickActions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    actionButtonGradient: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 16,
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    actionButton: {
        padding: 20,
        alignItems: "center",
        borderRadius: 16,
    },
    actionIcon: {
        marginBottom: 8,
    },
    actionButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
});
