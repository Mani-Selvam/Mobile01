import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Modal,
    ScrollView,
    Alert,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Animated,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as enquiryService from "../services/enquiryService";
import * as followupService from "../services/followupService";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
    const { logout } = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);
    const [notifications] = useState(3); // Mock notification count
    const [searchQuery, setSearchQuery] = useState("");

    // State for data fetched from API
    const [enquiries, setEnquiries] = useState([]);
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // State for search results
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Function to fetch data from API
    const fetchData = async () => {
        try {
            setLoading(true);
            const [enquiriesData, followUpsData] = await Promise.all([
                enquiryService.getAllEnquiries(),
                followupService.getFollowUps("Today"),
            ]);
            setEnquiries(enquiriesData);
            setFollowUps(followUpsData);
        } catch (error) {
            Alert.alert("Error", "Failed to load data. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Function to handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Calculate counts for Summary Cards
    const getCounts = () => {
        if (!Array.isArray(enquiries))
            return { new: 0, inProgress: 0, converted: 0, closed: 0 };
        return {
            new: enquiries.filter((e) => e.status === "New").length,
            inProgress: enquiries.filter((e) => e.status === "In Progress")
                .length,
            converted: enquiries.filter((e) => e.status === "Converted").length,
            closed: enquiries.filter((e) => e.status === "Closed").length,
        };
    };

    const counts = getCounts();

    // --- HANDLERS ---
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults(null);
            return;
        }

        try {
            setSearching(true);
            const results = await enquiryService.getAllEnquiries();
            const filteredResults = results.filter(
                (e) =>
                    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    e.product.toLowerCase().includes(searchQuery.toLowerCase()),
            );
            setSearchResults({
                enquiries: filteredResults,
                followUps: [],
            });
        } catch (error) {
            Alert.alert("Error", "Search failed. Please try again.");
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    // Reset search when query is cleared
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults(null);
        }
    }, [searchQuery]);

    const handleQuickAction = (action) => {
        Alert.alert("Navigation", `Opening ${action}...`);
    };

    // --- RENDER SUB-COMPONENTS ---

    const SideMenu = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={menuVisible}
            onRequestClose={() => setMenuVisible(false)}>
            <TouchableOpacity
                style={styles.menuOverlay}
                activeOpacity={1}
                onPressOut={() => setMenuVisible(false)}>
                <View style={styles.menuContent}>
                    <View style={styles.menuHeader}>
                        <View style={styles.profileCircle}>
                            <Ionicons name="person" size={40} color="#fff" />
                        </View>
                        <Text style={styles.profileName}>Admin User</Text>
                        <Text style={styles.profileRole}>Sales Manager</Text>
                    </View>

                    <View style={styles.menuList}>
                        <MenuItem icon="home-outline" label="Dashboard" />
                        <MenuItem icon="people-outline" label="Enquiries" />
                        <MenuItem icon="call-outline" label="Follow-ups" />
                        <MenuItem icon="bar-chart-outline" label="Reports" />
                        <MenuItem icon="settings-outline" label="Settings" />
                        <MenuItem
                            icon="log-out-outline"
                            label="Logout"
                            color="#ef4444"
                            onPress={handleLogout}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            {
                text: "Cancel",
                onPress: () => setMenuVisible(false),
                style: "cancel",
            },
            {
                text: "Logout",
                onPress: async () => {
                    setMenuVisible(false);
                    // Just call logout - AppNavigator will handle navigation based on isLoggedIn state
                    await logout();
                },
                style: "destructive",
            },
        ]);
    };

    const MenuItem = ({ icon, label, color = "#334155", onPress }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon} size={24} color={color} />
            <Text style={[styles.menuItemText, { color }]}>{label}</Text>
        </TouchableOpacity>
    );

    const QuickActionCard = ({
        title,
        icon,
        color,
        bgColor,
        count,
        onPress,
    }) => (
        <TouchableOpacity
            style={[styles.quickCard, { borderLeftColor: color }]}
            onPress={onPress}
            activeOpacity={0.7}>
            <View style={[styles.iconBg, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.quickCardTitle}>{title}</Text>
            {count !== undefined && (
                <View style={styles.badgeSmall}>
                    <Text style={styles.badgeSmallText}>{count}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const SummaryCard = ({ title, count, color, bgColor }) => (
        <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: bgColor }]}>
            <Text style={[styles.summaryCount, { color: color }]}>{count}</Text>
            <Text style={[styles.summaryTitle, { color: color }]}>{title}</Text>
        </TouchableOpacity>
    );

    const FollowUpItem = ({ item }) => (
        <View style={[styles.listItem, item.isMissed && styles.missedItem]}>
            <View style={styles.listItemLeft}>
                <View
                    style={[
                        styles.typeIcon,
                        {
                            backgroundColor:
                                item.type === "Visit"
                                    ? "#fef3c7"
                                    : item.type === "WhatsApp"
                                      ? "#dcfce7"
                                      : "#e0f2fe",
                        },
                    ]}>
                    <Ionicons
                        name={
                            item.type === "Call"
                                ? "call"
                                : item.type === "Visit"
                                  ? "location"
                                  : "logo-whatsapp"
                        }
                        size={16}
                        color={
                            item.type === "Visit"
                                ? "#d97706"
                                : item.type === "WhatsApp"
                                  ? "#059669"
                                  : "#0284c7"
                        }
                    />
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemSub}>
                        {item.time} • {item.type}
                    </Text>
                </View>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity
                    onPress={() =>
                        Alert.alert("View", "Viewing follow-up details")
                    }>
                    <Ionicons name="eye-outline" size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={async () => {
                        Alert.alert("Update", "Updating follow-up...", [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Mark Complete",
                                onPress: async () => {
                                    try {
                                        await API.updateFollowUp(
                                            item.id,
                                            "Completed",
                                        );
                                        // Refresh data
                                        const updatedFollowUps =
                                            await API.getFollowUps();
                                        setFollowUps(updatedFollowUps);
                                        Alert.alert(
                                            "Success",
                                            "Follow-up marked as complete",
                                        );
                                    } catch (error) {
                                        Alert.alert(
                                            "Error",
                                            "Failed to update follow-up",
                                        );
                                    }
                                },
                            },
                        ]);
                    }}
                    style={{ marginLeft: 15 }}>
                    <MaterialIcons name="update" size={20} color="#2563eb" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const EnquiryItem = ({ item }) => (
        <View style={styles.listItem}>
            <View style={styles.listItemLeft}>
                <View style={styles.statusDot} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemSub}>{item.product}</Text>
                </View>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity
                    onPress={() =>
                        Alert.alert("View", "Viewing enquiry details")
                    }>
                    <Ionicons name="eye-outline" size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() =>
                        Alert.alert("Follow-up", "Adding new follow-up...")
                    }
                    style={{ marginLeft: 15 }}>
                    <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color="#10b981"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    // --- MAIN RENDER ---
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SideMenu />

            {/* --- TOP HEADER --- */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <Ionicons name="menu" size={28} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons
                            name="notifications-outline"
                            size={24}
                            color="#1e293b"
                        />
                        {notifications > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {notifications}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileBtn}>
                        <Ionicons
                            name="person-circle-outline"
                            size={28}
                            color="#1e293b"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }>
                {/* --- SECTION 5: QUICK SEARCH (Moved up for accessibility) --- */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        placeholder="Search Customer / Mobile..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    {searching && (
                        <ActivityIndicator size="small" color="#2563eb" />
                    )}
                </View>

                {/* --- SECTION 1: QUICK ACTIONS --- */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                    <QuickActionCard
                        title="Add Enquiry"
                        icon="add-circle"
                        color="#2563eb"
                        bgColor="#dbeafe"
                        onPress={async () => {
                            Alert.alert(
                                "Add Enquiry",
                                "This would open a form to add a new enquiry",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Simulate Add",
                                        onPress: async () => {
                                            try {
                                                await API.addEnquiry({
                                                    name: "New Customer",
                                                    product: "Test Product",
                                                    status: "New",
                                                });
                                                // Refresh data
                                                fetchData();
                                                Alert.alert(
                                                    "Success",
                                                    "Enquiry added successfully",
                                                );
                                            } catch (error) {
                                                Alert.alert(
                                                    "Error",
                                                    "Failed to add enquiry",
                                                );
                                            }
                                        },
                                    },
                                ],
                            );
                        }}
                    />
                    <QuickActionCard
                        title="My Follow-ups"
                        icon="call"
                        color="#f59e0b"
                        bgColor="#fef3c7"
                        count={followUps.length}
                        onPress={() => handleQuickAction("My Follow-ups")}
                    />
                    <QuickActionCard
                        title="Enquiry List"
                        icon="list"
                        color="#64748b"
                        bgColor="#f1f5f9"
                        onPress={() => handleQuickAction("Enquiry List")}
                    />
                    <QuickActionCard
                        title="Reports"
                        icon="pie-chart"
                        color="#7c3aed"
                        bgColor="#ede9fe"
                        onPress={() => handleQuickAction("Reports")}
                    />
                </View>

                {/* --- SECTION 2: SUMMARY CARDS --- */}
                <Text style={styles.sectionTitle}>Status Overview</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.summaryScroll}>
                    <SummaryCard
                        title="New"
                        count={counts.new}
                        color="#d97706"
                        bgColor="#fef3c7"
                    />
                    <SummaryCard
                        title="In Progress"
                        count={counts.inProgress}
                        color="#2563eb"
                        bgColor="#dbeafe"
                    />
                    <SummaryCard
                        title="Converted"
                        count={counts.converted}
                        color="#059669"
                        bgColor="#d1fae5"
                    />
                    <SummaryCard
                        title="Closed"
                        count={counts.closed}
                        color="#64748b"
                        bgColor="#f1f5f9"
                    />
                </ScrollView>

                {/* --- SECTION 3: TODAY'S FOLLOW-UPS --- */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's Follow-ups</Text>
                    <TouchableOpacity
                        onPress={() =>
                            handleQuickAction("View All Follow-ups")
                        }>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2563eb" />
                        <Text style={styles.loadingText}>Loading data...</Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {Array.isArray(
                            searchResults ? searchResults.followUps : followUps,
                        ) &&
                            (searchResults
                                ? searchResults.followUps
                                : followUps
                            )
                                .slice(0, 5)
                                .map((item) => (
                                    <FollowUpItem key={item.id} item={item} />
                                ))}
                        {(!Array.isArray(
                            searchResults ? searchResults.followUps : followUps,
                        ) ||
                            (searchResults
                                ? searchResults.followUps
                                : followUps
                            ).length === 0) && (
                            <Text style={styles.emptyText}>
                                No follow-ups scheduled for today.
                            </Text>
                        )}
                    </View>
                )}

                {/* --- SECTION 4: RECENT ENQUIRIES --- */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Enquiries</Text>
                    <TouchableOpacity
                        onPress={() => handleQuickAction("View All Enquiries")}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2563eb" />
                        <Text style={styles.loadingText}>Loading data...</Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {Array.isArray(
                            searchResults ? searchResults.enquiries : enquiries,
                        ) &&
                            (searchResults
                                ? searchResults.enquiries
                                : enquiries
                            ).map((item) => (
                                <EnquiryItem key={item.id} item={item} />
                            ))}
                        {(!Array.isArray(
                            searchResults ? searchResults.enquiries : enquiries,
                        ) ||
                            (searchResults
                                ? searchResults.enquiries
                                : enquiries
                            ).length === 0) && (
                            <Text style={styles.emptyText}>
                                No enquiries found.
                            </Text>
                        )}
                    </View>
                )}

                {/* --- SECTION 6: QUICK IMPORT / EXPORT --- */}
                <View style={styles.ieContainer}>
                    <TouchableOpacity
                        style={styles.ieBtn}
                        onPress={() =>
                            Alert.alert("Import", "Opening Import Wizard...")
                        }>
                        <MaterialIcons
                            name="file-upload"
                            size={20}
                            color="#fff"
                        />
                        <Text style={styles.ieBtnText}>Import Data</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.ieBtn, { backgroundColor: "#64748b" }]}
                        onPress={() =>
                            Alert.alert("Export", "Generating Excel...")
                        }>
                        <MaterialIcons
                            name="file-download"
                            size={20}
                            color="#fff"
                        />
                        <Text style={styles.ieBtnText}>Export Data</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    // Header
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#fff",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1e293b",
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconBtn: {
        marginRight: 15,
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: -2,
        right: -2,
        backgroundColor: "#ef4444",
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    badgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },

    // Scroll Content
    scrollView: {
        padding: 20,
    },

    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: "#64748b",
        fontSize: 14,
    },

    // Search
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    searchInput: {
        marginLeft: 10,
        flex: 1,
        fontSize: 14,
        color: "#334155",
    },

    // Section Titles
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: 12,
        marginTop: 10,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
    },
    viewAllText: {
        color: "#2563eb",
        fontWeight: "600",
        fontSize: 13,
    },

    // Quick Actions Grid
    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    quickCard: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    quickCardTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#334155",
    },
    badgeSmall: {
        backgroundColor: "#ef4444",
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: "auto",
    },
    badgeSmallText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },

    // Summary Cards (Horizontal)
    summaryScroll: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    summaryCard: {
        width: 100,
        borderRadius: 12,
        padding: 15,
        marginRight: 15,
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
    },
    summaryCount: {
        fontSize: 24,
        fontWeight: "bold",
    },
    summaryTitle: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },

    // Lists (Follow-ups / Enquiries)
    listContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 5,
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 2,
    },
    listItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    missedItem: {
        backgroundColor: "#fef2f2",
        borderLeftWidth: 3,
        borderLeftColor: "#ef4444",
    },
    listItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    typeIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#3b82f6",
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
    },
    itemSub: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 2,
    },
    itemActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    emptyText: {
        textAlign: "center",
        padding: 20,
        color: "#94a3b8",
        fontSize: 13,
    },

    // Import/Export
    ieContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 30,
    },
    ieBtn: {
        flex: 1,
        backgroundColor: "#2563eb",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        borderRadius: 12,
        marginHorizontal: 5,
    },
    ieBtnText: {
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 8,
    },

    // Side Menu / Drawer
    menuOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    menuContent: {
        backgroundColor: "#fff",
        width: width * 0.75,
        height: "100%",
        paddingTop: 40,
    },
    menuHeader: {
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        paddingBottom: 20,
        marginBottom: 10,
    },
    profileCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#cbd5e1",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    profileName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1e293b",
    },
    profileRole: {
        fontSize: 12,
        color: "#64748b",
    },
    menuList: {
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
    },
    menuItemText: {
        fontSize: 16,
        marginLeft: 15,
        fontWeight: "500",
    },
});
