import React from "react";
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

export default function ReportScreen() {
    // Mock data for reports
    const reports = {
        totalEnquiries: 150,
        pendingFollowUps: 20,
        completedFollowUps: 130,
        conversions: 45,
        conversionRate: "30%",
    };

    const generateReport = () => {
        // In a real app, this would generate and export a PDF/Excel
        Alert.alert(
            "Success",
            "Report generated and exported! (Mock functionality)"
        );
    };

    return (
        <LinearGradient
            colors={["#0f0f23", "#1a1a2e", "#16213e"]}
            style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                <Animated.View
                    entering={FadeInUp.delay(100)}
                    style={styles.header}>
                    <MaterialCommunityIcons
                        name="chart-line"
                        size={32}
                        color="#667eea"
                        style={styles.headerIcon}
                    />
                    <Text style={styles.title}>Reports & Analytics</Text>
                    <Text style={styles.subtitle}>
                        Comprehensive business insights
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(200)}
                    style={styles.reportCard}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons
                            name="account-search"
                            size={24}
                            color="#667eea"
                        />
                        <Text style={styles.cardTitle}>Enquiry Summary</Text>
                    </View>
                    <View style={styles.metricsGrid}>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricValue}>
                                {reports.totalEnquiries}
                            </Text>
                            <Text style={styles.metricLabel}>
                                Total Enquiries
                            </Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricValue}>
                                {reports.pendingFollowUps}
                            </Text>
                            <Text style={styles.metricLabel}>
                                Pending Follow-ups
                            </Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricValue}>
                                {reports.completedFollowUps}
                            </Text>
                            <Text style={styles.metricLabel}>
                                Completed Follow-ups
                            </Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricValue}>
                                {reports.conversions}
                            </Text>
                            <Text style={styles.metricLabel}>Conversions</Text>
                        </View>
                    </View>
                    <View style={styles.conversionRate}>
                        <MaterialCommunityIcons
                            name="trending-up"
                            size={20}
                            color="#28a745"
                        />
                        <Text style={styles.conversionText}>
                            Conversion Rate: {reports.conversionRate}
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(300)}
                    style={styles.reportCard}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons
                            name="chart-bar"
                            size={24}
                            color="#667eea"
                        />
                        <Text style={styles.cardTitle}>
                            Performance Analysis
                        </Text>
                    </View>
                    <View style={styles.analysisItems}>
                        <View style={styles.analysisItem}>
                            <MaterialCommunityIcons
                                name="account-group"
                                size={20}
                                color="#a0a0a0"
                            />
                            <Text style={styles.analysisText}>
                                User-wise Reports: Available
                            </Text>
                        </View>
                        <View style={styles.analysisItem}>
                            <MaterialCommunityIcons
                                name="calendar-month"
                                size={20}
                                color="#a0a0a0"
                            />
                            <Text style={styles.analysisText}>
                                Date-wise Reports: Available
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(400)}
                    style={styles.exportSection}>
                    <LinearGradient
                        colors={["#667eea", "#764ba2"]}
                        style={styles.buttonGradient}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={generateReport}>
                            <MaterialCommunityIcons
                                name="download"
                                size={24}
                                color="#fff"
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.buttonText}>Export Report</Text>
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
        alignItems: "center",
        marginBottom: 32,
    },
    headerIcon: {
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#a0a0a0",
        textAlign: "center",
    },
    reportCard: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        marginLeft: 12,
    },
    metricsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 16,
    },
    metricItem: {
        width: "50%",
        alignItems: "center",
        marginBottom: 16,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: "700",
        color: "#667eea",
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12,
        color: "#a0a0a0",
        textAlign: "center",
    },
    conversionRate: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(40,167,69,0.1)",
        borderWidth: 1,
        borderColor: "rgba(40,167,69,0.2)",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    conversionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#28a745",
        marginLeft: 8,
    },
    analysisItems: {
        marginTop: 8,
    },
    analysisItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    analysisText: {
        fontSize: 16,
        color: "#a0a0a0",
        marginLeft: 12,
    },
    exportSection: {
        marginTop: 20,
        marginBottom: 40,
    },
    buttonGradient: {
        borderRadius: 16,
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    button: {
        height: 60,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
    },
    buttonIcon: {
        marginRight: 12,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
