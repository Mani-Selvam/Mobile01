import React, { useState, useMemo } from "react";
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
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// --- MOCK DATA (Simulated Database) ---
const MOCK_ENQUIRIES = [
    {
        id: 1,
        name: "Rahul Sharma",
        product: "iPhone 15",
        status: "New",
        date: "2023-10-25",
        value: 75000,
    },
    {
        id: 2,
        name: "Priya Singh",
        product: "Samsung S24",
        status: "In Progress",
        date: "2023-10-25",
        value: 65000,
    },
    {
        id: 3,
        name: "Amit Verma",
        product: "MacBook Air",
        status: "Converted",
        date: "2023-10-24",
        value: 95000,
    },
    {
        id: 4,
        name: "Sneha Gupta",
        product: "iPad Pro",
        status: "Closed",
        date: "2023-10-20",
        value: 45000,
    },
    {
        id: 5,
        name: "Vikram Malhotra",
        product: "OnePlus 12",
        status: "New",
        date: "2023-10-25",
        value: 55000,
    },
    {
        id: 6,
        name: "John Doe",
        product: "iPhone 14",
        status: "Converted",
        date: "2023-10-22",
        value: 60000,
    },
];

const MOCK_FOLLOWUPS = [
    {
        id: 101,
        name: "Rahul Sharma",
        type: "Call",
        date: "2023-10-25",
        time: "10:00 AM",
        status: "Completed",
        isMissed: false,
    },
    {
        id: 102,
        name: "Priya Singh",
        type: "Visit",
        date: "2023-10-25",
        time: "11:30 AM",
        status: "Pending",
        isMissed: false,
    },
    {
        id: 103,
        name: "Amit Verma",
        type: "WhatsApp",
        date: "2023-10-25",
        time: "09:00 AM",
        status: "Pending",
        isMissed: true,
    }, // Missed
    {
        id: 104,
        name: "John Doe",
        type: "Call",
        date: "2023-10-26",
        time: "02:00 PM",
        status: "Pending",
        isMissed: false,
    },
    {
        id: 105,
        name: "Sarah Smith",
        type: "Call",
        date: "2023-10-24",
        time: "04:30 PM",
        status: "Completed",
        isMissed: false,
    },
];

export default function ReportScreen() {
    const [activeTab, setActiveTab] = useState("enquiry"); // 'enquiry' | 'followup' | 'conversion'
    const [dateRange, setDateRange] = useState("Today");
    const [detailFilter, setDetailFilter] = useState("all"); // To filter list when cards are tapped
    const [showExportModal, setShowExportModal] = useState(false);

    // --- LOGIC ENGINE ---

    // 1. Calculate Enquiry Stats
    const enquiryStats = {
        new: MOCK_ENQUIRIES.filter((e) => e.status === "New").length,
        inProgress: MOCK_ENQUIRIES.filter((e) => e.status === "In Progress")
            .length,
        converted: MOCK_ENQUIRIES.filter((e) => e.status === "Converted")
            .length,
        closed: MOCK_ENQUIRIES.filter((e) => e.status === "Closed").length,
    };

    // 2. Calculate Follow-up Stats
    const followUpStats = {
        today: MOCK_FOLLOWUPS.filter((f) => f.date === "2023-10-25").length, // Mock "Today"
        upcoming: MOCK_FOLLOWUPS.filter((f) => f.date > "2023-10-25").length, // Mock "Future"
        missed: MOCK_FOLLOWUPS.filter((f) => f.isMissed).length,
        completed: MOCK_FOLLOWUPS.filter((f) => f.status === "Completed")
            .length,
    };

    // 3. Calculate Conversion Stats
    const totalEnq = MOCK_ENQUIRIES.length;
    const conversionRate =
        totalEnq > 0
            ? Math.round((enquiryStats.converted / totalEnq) * 100)
            : 0;

    // 4. Prepare List Data based on Tab + Detail Filter
    const displayData = useMemo(() => {
        let data = [];

        if (activeTab === "enquiry") {
            data = MOCK_ENQUIRIES;
            if (detailFilter !== "all") {
                data = data.filter(
                    (e) =>
                        e.status.toLowerCase().replace(" ", "") ===
                        detailFilter,
                );
            }
        } else if (activeTab === "followup") {
            data = MOCK_FOLLOWUPS;
            if (detailFilter === "today")
                data = data.filter((f) => f.date === "2023-10-25");
            if (detailFilter === "missed")
                data = data.filter((f) => f.isMissed);
            if (detailFilter === "completed")
                data = data.filter((f) => f.status === "Completed");
            if (detailFilter === "upcoming")
                data = data.filter((f) => f.date > "2023-10-25");
        } else if (activeTab === "conversion") {
            // Conversion tab usually shows converted enquiries list
            data = MOCK_ENQUIRIES.filter((e) => e.status === "Converted");
        }
        return data;
    }, [activeTab, detailFilter]);

    // --- RENDER HELPERS ---

    const StatCard = ({ title, count, color, filterKey, icon }) => (
        <TouchableOpacity
            style={[styles.statCard, { borderLeftColor: color }]}
            onPress={() => setDetailFilter(filterKey)}
            activeOpacity={0.8}>
            <View style={styles.statHeader}>
                <Text style={styles.statTitle}>{title}</Text>
                <View
                    style={[styles.iconBg, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={icon} size={18} color={color} />
                </View>
            </View>
            <Text style={[styles.statCount, { color }]}>{count}</Text>
            {detailFilter === filterKey && (
                <View style={styles.activeIndicator}>
                    <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#10b981"
                    />
                    <Text style={styles.activeText}>Showing</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const ListHeader = () => {
        let title = "";
        if (activeTab === "enquiry") title = "Enquiry Details";
        if (activeTab === "followup") title = "Follow-up Log";
        if (activeTab === "conversion") title = "Converted Deals";

        return (
            <View style={styles.listHeaderSection}>
                <Text style={styles.listTitle}>{title}</Text>
                <TouchableOpacity onPress={() => setDetailFilter("all")}>
                    <Text style={styles.clearFilter}>Clear Filter</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const RenderItem = ({ item }) => {
        // Enquiry Item
        if (activeTab !== "followup") {
            return (
                <View style={styles.itemRow}>
                    <View>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemSub}>
                            {item.product} • ₹{item.value}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.badge,
                            {
                                backgroundColor:
                                    item.status === "Converted"
                                        ? "#d1fae5"
                                        : "#f1f5f9",
                            },
                        ]}>
                        <Text style={styles.badgeText}>{item.status}</Text>
                    </View>
                </View>
            );
        }
        // Follow-up Item
        else {
            return (
                <View
                    style={[
                        styles.itemRow,
                        item.isMissed && {
                            backgroundColor: "#fef2f2",
                            borderLeftWidth: 3,
                            borderLeftColor: "#ef4444",
                        },
                    ]}>
                    <View>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={styles.rowIcon}>
                            <Ionicons
                                name="call-outline"
                                size={12}
                                color="#64748b"
                            />
                            <Text style={styles.itemSub}>
                                {item.type} • {item.time}
                            </Text>
                        </View>
                    </View>
                    {item.isMissed ? (
                        <Ionicons name="warning" size={20} color="#ef4444" />
                    ) : (
                        <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#10b981"
                        />
                    )}
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* TOP HEADER */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => Alert.alert("Back")}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Reports</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}>
                {/* SECTION 1: REPORT TYPE SELECTOR */}
                <View style={styles.tabsContainer}>
                    {[
                        {
                            id: "enquiry",
                            label: "Enquiry",
                            icon: "document-text-outline",
                        },
                        {
                            id: "followup",
                            label: "Follow-up",
                            icon: "call-outline",
                        },
                        {
                            id: "conversion",
                            label: "Conversion",
                            icon: "cash-outline",
                        },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.tab,
                                activeTab === tab.id && styles.tabActive,
                            ]}
                            onPress={() => {
                                setActiveTab(tab.id);
                                setDetailFilter("all");
                            }}>
                            <Ionicons
                                name={tab.icon}
                                size={18}
                                color={
                                    activeTab === tab.id ? "#fff" : "#64748b"
                                }
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab.id &&
                                        styles.tabTextActive,
                                ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* SECTION 2: DATE FILTER */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dateFilterScroll}>
                    {["Today", "Yesterday", "This Week", "This Month"].map(
                        (range) => (
                            <TouchableOpacity
                                key={range}
                                style={[
                                    styles.dateChip,
                                    dateRange === range &&
                                        styles.dateChipActive,
                                ]}
                                onPress={() => setDateRange(range)}>
                                <Text
                                    style={[
                                        styles.dateChipText,
                                        dateRange === range &&
                                            styles.dateChipTextActive,
                                    ]}>
                                    {range}
                                </Text>
                            </TouchableOpacity>
                        ),
                    )}
                    <TouchableOpacity style={styles.dateChipCustom}>
                        <Ionicons name="calendar" size={16} color="#2563eb" />
                        <Text style={styles.dateChipText}>Custom</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* SECTION 3: SUMMARY CARDS */}
                <View style={styles.gridContainer}>
                    {/* ENQUIRY CARDS */}
                    {activeTab === "enquiry" && (
                        <>
                            <StatCard
                                title="New Enquiries"
                                count={enquiryStats.new}
                                color="#f59e0b"
                                filterKey="new"
                                icon="add-circle"
                            />
                            <StatCard
                                title="In Progress"
                                count={enquiryStats.inProgress}
                                color="#3b82f6"
                                filterKey="inprogress"
                                icon="time"
                            />
                            <StatCard
                                title="Converted"
                                count={enquiryStats.converted}
                                color="#10b981"
                                filterKey="converted"
                                icon="checkmark-circle"
                            />
                            <StatCard
                                title="Closed"
                                count={enquiryStats.closed}
                                color="#64748b"
                                filterKey="closed"
                                icon="close-circle"
                            />
                        </>
                    )}

                    {/* FOLLOW-UP CARDS */}
                    {activeTab === "followup" && (
                        <>
                            <StatCard
                                title="Today's Tasks"
                                count={followUpStats.today}
                                color="#2563eb"
                                filterKey="today"
                                icon="calendar"
                            />
                            <StatCard
                                title="Upcoming"
                                count={followUpStats.upcoming}
                                color="#8b5cf6"
                                filterKey="upcoming"
                                icon="arrow-forward"
                            />
                            <StatCard
                                title="Missed"
                                count={followUpStats.missed}
                                color="#ef4444"
                                filterKey="missed"
                                icon="warning"
                            />
                            <StatCard
                                title="Completed"
                                count={followUpStats.completed}
                                color="#10b981"
                                filterKey="completed"
                                icon="checkmark-done"
                            />
                        </>
                    )}

                    {/* CONVERSION CARDS */}
                    {activeTab === "conversion" && (
                        <>
                            <StatCard
                                title="Total Enquiries"
                                count={totalEnq}
                                color="#64748b"
                                filterKey="all"
                                icon="pie-chart"
                            />
                            <StatCard
                                title="Converted Deals"
                                count={enquiryStats.converted}
                                color="#10b981"
                                filterKey="all"
                                icon="trophy"
                            />
                            <View
                                style={[
                                    styles.statCard,
                                    styles.wideCard,
                                    { borderLeftColor: "#10b981" },
                                ]}>
                                <Text style={styles.statTitle}>
                                    Conversion Rate
                                </Text>
                                <Text
                                    style={[
                                        styles.statCount,
                                        { color: "#10b981", fontSize: 32 },
                                    ]}>
                                    {conversionRate}%
                                </Text>
                                <Text style={styles.statSub}>Target: 15%</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* SECTION 4: DETAILED LIST */}
                <ListHeader />
                <View style={styles.listContainer}>
                    <FlatList
                        data={displayData}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={RenderItem}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                No records found for this filter.
                            </Text>
                        }
                        scrollEnabled={false} // Parent ScrollView handles scroll
                    />
                </View>

                {/* Extra Space for FAB */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* SECTION 5: EXPORT FLOATING BUTTON */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowExportModal(true)}>
                <Ionicons name="share-social" size={24} color="#fff" />
                <Text style={styles.fabText}>Export</Text>
            </TouchableOpacity>

            {/* EXPORT MODAL */}
            <Modal visible={showExportModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Export Report</Text>
                        <Text style={styles.modalSub}>
                            Exporting data for:{" "}
                            <Text style={{ fontWeight: "bold" }}>
                                {activeTab.toUpperCase()}
                            </Text>{" "}
                            ({dateRange})
                        </Text>

                        <View style={styles.exportRow}>
                            <TouchableOpacity
                                style={styles.exportBtn}
                                onPress={() => {
                                    setShowExportModal(false);
                                    Alert.alert(
                                        "Success",
                                        "Excel file downloaded",
                                    );
                                }}>
                                <MaterialIcons
                                    name="table-chart"
                                    size={32}
                                    color="#10b981"
                                />
                                <Text style={styles.exportBtnText}>Excel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.exportBtn}
                                onPress={() => {
                                    setShowExportModal(false);
                                    Alert.alert(
                                        "Success",
                                        "PDF file downloaded",
                                    );
                                }}>
                                <MaterialIcons
                                    name="picture-as-pdf"
                                    size={32}
                                    color="#ef4444"
                                />
                                <Text style={styles.exportBtnText}>PDF</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setShowExportModal(false)}>
                            <Text style={styles.closeBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },

    // Header
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#fff",
        elevation: 2,
    },
    topBarTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },

    // Tab Selector
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "#e2e8f0",
        margin: 15,
        padding: 4,
        borderRadius: 12,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    tabText: {
        marginLeft: 5,
        fontSize: 13,
        fontWeight: "600",
        color: "#64748b",
    },
    tabTextActive: { color: "#1e293b" },

    // Date Filter
    dateFilterScroll: { paddingHorizontal: 15, marginBottom: 10 },
    dateChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    dateChipActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
    dateChipText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#64748b",
        marginLeft: 4,
    },
    dateChipTextActive: { color: "#fff" },
    dateChipCustom: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },

    // Grid Cards
    scrollView: { flex: 1 },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 10,
        justifyContent: "space-between",
    },
    statCard: {
        width: "48%",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    wideCard: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    statTitle: { fontSize: 13, fontWeight: "600", color: "#64748b" },
    iconBg: { padding: 5, borderRadius: 8 },
    statCount: { fontSize: 28, fontWeight: "bold" },
    statSub: { fontSize: 11, color: "#94a3b8" },
    activeIndicator: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    activeText: {
        fontSize: 10,
        color: "#10b981",
        marginLeft: 4,
        fontWeight: "bold",
    },

    // List Section
    listHeaderSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        marginTop: 10,
        marginBottom: 5,
    },
    listTitle: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
    clearFilter: { fontSize: 12, color: "#2563eb", fontWeight: "600" },

    listContainer: {
        backgroundColor: "#fff",
        margin: 15,
        borderRadius: 12,
        padding: 10,
        minHeight: 200,
        elevation: 1,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    itemName: { fontSize: 15, fontWeight: "600", color: "#334155" },
    itemSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
    rowIcon: { flexDirection: "row", alignItems: "center", marginTop: 4 },

    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 11, fontWeight: "bold", color: "#475569" },

    emptyText: { textAlign: "center", marginTop: 40, color: "#94a3b8" },

    // Floating Button
    fab: {
        position: "absolute",
        bottom: 25,
        right: 20,
        backgroundColor: "#1e293b",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.3,
    },
    fabText: { color: "#fff", fontWeight: "bold", marginLeft: 8, fontSize: 14 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        width: "80%",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
    modalSub: {
        fontSize: 13,
        color: "#64748b",
        marginBottom: 20,
        textAlign: "center",
    },
    exportRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    exportBtn: {
        flex: 1,
        alignItems: "center",
        padding: 15,
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        marginHorizontal: 5,
    },
    exportBtnText: { marginTop: 5, fontWeight: "bold", color: "#475569" },
    closeBtn: {
        width: "100%",
        padding: 12,
        backgroundColor: "#f1f5f9",
        borderRadius: 8,
        alignItems: "center",
    },
    closeBtnText: { color: "#64748b", fontWeight: "600" },
});
