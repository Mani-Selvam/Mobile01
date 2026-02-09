import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    ScrollView,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as enquiryService from "../services/enquiryService";
import * as followupService from "../services/followupService";
import AddFollowUpScreen from "./AddFollowUpScreen";

const { width, height } = Dimensions.get("window");

// --- THEME: CLEAN MODERN LIGHT ---
const THEME = {
    bg: "#F3F4F6", // Light Gray Background
    card: "#FFFFFF", // White Card

    primary: "#3B82F6", // Bright Blue
    primaryLight: "#EFF6FF", // Light Blue Background
    primaryText: "#1D4ED8", // Dark Blue Text

    success: "#10B981", // Emerald
    successLight: "#D1FAE5",

    warning: "#F59E0B", // Amber
    warningLight: "#FEF3C7",

    danger: "#EF4444", // Red
    dangerLight: "#FEE2E2",

    textMain: "#111827", // Almost Black
    textSec: "#6B7280", // Gray
    textLight: "#9CA3AF", // Light Gray

    border: "#E5E7EB", // Border Gray
    shadow: "rgba(0, 0, 0, 0.05)",
};

// --- MAIN APP ---
export default function App() {
    const [screen, setScreen] = useState("ENQUIRY_LIST");
    const [previousScreen, setPreviousScreen] = useState("ENQUIRY_LIST");

    const [enquiries, setEnquiries] = useState([]);
    const [followUps, setFollowUps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [followUpForm, setFollowUpForm] = useState({
        date: "",
        time: "",
        type: "WhatsApp",
        remarks: "",
        nextAction: "Interested",
        isNextRequired: false,
        nextDate: "",
    });

    const [activeTab, setActiveTab] = useState("Today");

    const [showEditModal, setShowEditModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editStatus, setEditStatus] = useState("Followup");
    const [editRemarks, setEditRemarks] = useState("");
    const [editNextDate, setEditNextDate] = useState("");
    const [editAmount, setEditAmount] = useState("");

    // --- EFFECTS ---
    useEffect(() => {
        fetchEnquiries();
        fetchFollowUps("Today");
    }, []);

    useEffect(() => {
        fetchFollowUps(activeTab);
    }, [activeTab]);

    // --- HELPERS ---
    const getStatusColor = (status) => {
        switch (status) {
            case "New":
                return {
                    bg: THEME.warningLight,
                    text: THEME.warning,
                    border: THEME.warning,
                };
            case "In Progress":
                return {
                    bg: THEME.primaryLight,
                    text: THEME.primaryText,
                    border: THEME.primary,
                };
            case "Converted":
                return {
                    bg: THEME.successLight,
                    text: THEME.success,
                    border: THEME.success,
                };
            case "Closed":
                return {
                    bg: THEME.bg,
                    text: THEME.textSec,
                    border: THEME.border,
                };
            default:
                return {
                    bg: THEME.bg,
                    text: THEME.textSec,
                    border: THEME.border,
                };
        }
    };

    // --- API HANDLERS ---
    const fetchEnquiries = async () => {
        try {
            const data = await enquiryService.getAllEnquiries();
            setEnquiries(data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    const fetchFollowUps = async (tab) => {
        try {
            const data = await followupService.getFollowUps(tab);
            setFollowUps(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleStartFollowUp = async (enq) => {
        try {
            const data = await enquiryService.getEnquiryById(enq.id);
            setSelectedEnquiry(data);
            setScreen("ADD_FOLLOWUP");
        } catch (error) {
            Alert.alert("Error", "Could not load details");
        }
    };

    const handleOpenEdit = (item) => {
        setEditItem(item);
        setEditRemarks(item.remarks || "");
        setEditStatus("Followup");
        setEditNextDate("");
        setEditAmount("");
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editItem) return;
        try {
            const validStatuses = ["Followup", "Sales", "Drop"];
            if (!validStatuses.includes(editStatus)) {
                return Alert.alert("Error", "Please select a valid status");
            }
            if (editStatus === "Followup" && !editNextDate) {
                return Alert.alert("Required", "Enter next follow-up date");
            }
            if (editStatus === "Sales" && !editAmount) {
                return Alert.alert("Required", "Enter amount");
            }

            let remarksValue = editRemarks;
            if (editStatus === "Sales") {
                remarksValue = editRemarks
                    ? `${editRemarks} | Sales: ₹${editAmount}`
                    : `Sales: ₹${editAmount}`;
            }

            const newFollowUp = {
                enqNo: editItem.enqNo,
                name: editItem.name,
                date: editStatus === "Followup" ? editNextDate : editItem.date,
                time: "",
                type: "WhatsApp",
                remarks: remarksValue,
                nextAction: editStatus,
            };

            await followupService.createFollowUp(newFollowUp);
            setShowEditModal(false);
            setEditRemarks("");
            setEditNextDate("");
            setEditAmount("");
            setEditStatus("Followup");
            fetchFollowUps(activeTab);
            Alert.alert("Success", "Follow-up updated successfully");
        } catch (e) {
            console.error("Create follow-up error:", e);
            Alert.alert("Error", e.response?.data?.message || "Could not save");
        }
    };

    // --- SUB-COMPONENTS ---

    // 1. Clean Header
    const TopBar = ({ title, showBack = false, onBack }) => (
        <View style={lightStyles.headerContainer}>
            <View style={lightStyles.header}>
                <View style={lightStyles.headerLeft}>
                    {showBack && (
                        <TouchableOpacity
                            onPress={
                                onBack || (() => setScreen("ENQUIRY_LIST"))
                            }
                            style={lightStyles.backBtn}>
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color={THEME.textMain}
                            />
                        </TouchableOpacity>
                    )}
                    <Text style={lightStyles.headerTitle}>{title}</Text>
                </View>
                <View style={lightStyles.headerRight}>
                    <TouchableOpacity
                        style={lightStyles.iconBtn}
                        onPress={() => {
                            setPreviousScreen(screen);
                            setScreen("NEXT_FOLLOWUP");
                        }}>
                        <Ionicons
                            name="calendar-outline"
                            size={22}
                            color={THEME.textMain}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // 2. Enquiry List Screen
    const EnquiryList = () => (
        <View style={{ flex: 1, backgroundColor: THEME.bg }}>
            <TopBar title="Dashboard" />

            {/* Search Bar */}
            <View style={lightStyles.searchContainer}>
                <Ionicons name="search" size={20} color={THEME.textLight} />
                <TextInput
                    placeholder="Search name, mobile..."
                    style={lightStyles.searchInput}
                    placeholderTextColor={THEME.textLight}
                />
            </View>

            <FlatList
                data={enquiries}
                keyExtractor={(item, index) =>
                    item?.id ? item.id.toString() : `item-${index}`
                }
                contentContainerStyle={lightStyles.listPadding}
                refreshing={isLoading}
                onRefresh={fetchEnquiries}
                ListEmptyComponent={
                    <View style={lightStyles.emptyContainer}>
                        <MaterialIcons
                            name="inbox"
                            size={50}
                            color={THEME.border}
                        />
                        <Text style={lightStyles.emptyText}>
                            No enquiries found
                        </Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const colors = getStatusColor(item.status);
                    return (
                        <View style={lightStyles.card}>
                            <View style={lightStyles.cardHeader}>
                                <View style={lightStyles.cardInfo}>
                                    <Text style={lightStyles.enqNo}>
                                        {item.enqNo}
                                    </Text>
                                    <Text style={lightStyles.cardName}>
                                        {item.name}
                                    </Text>
                                    <View style={lightStyles.metaRow}>
                                        <Ionicons
                                            name="cube-outline"
                                            size={14}
                                            color={THEME.textLight}
                                        />
                                        <Text style={lightStyles.metaText}>
                                            {item.product}
                                        </Text>
                                    </View>
                                </View>
                                <View style={lightStyles.cardActions}>
                                    <TouchableOpacity
                                        style={lightStyles.btnIcon}
                                        onPress={() => handleOpenEdit(item)}>
                                        <Ionicons
                                            name="create-outline"
                                            size={20}
                                            color={THEME.textSec}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }}
            />

            <TouchableOpacity
                style={lightStyles.fab}
                onPress={() =>
                    Alert.alert("Module 1", "Navigate to Add Enquiry")
                }>
                <Ionicons name="add" size={28} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    // 3. Next Follow-ups Calendar View
    const NextFollowUpsList = () => {
        // Group follow-ups by date
        const groupedByDate = followUps.reduce((acc, item) => {
            const date = item.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {});

        const sortedDates = Object.keys(groupedByDate).sort();

        return (
            <View style={{ flex: 1, backgroundColor: THEME.bg }}>
                <TopBar
                    title="Next Follow-ups"
                    showBack
                    onBack={() => setScreen(previousScreen)}
                />
                <FlatList
                    data={sortedDates}
                    keyExtractor={(date) => date}
                    contentContainerStyle={lightStyles.calendarPadding}
                    ListEmptyComponent={
                        <View style={lightStyles.emptyContainer}>
                            <Text style={lightStyles.emptyText}>
                                No follow-ups scheduled
                            </Text>
                        </View>
                    }
                    renderItem={({ item: date }) => (
                        <View style={lightStyles.dateSection}>
                            <View style={lightStyles.dateHeader}>
                                <Ionicons
                                    name="calendar"
                                    size={18}
                                    color={THEME.primary}
                                />
                                <Text style={lightStyles.dateTitle}>
                                    {date}
                                </Text>
                                <Text style={lightStyles.dateCount}>
                                    {groupedByDate[date].length} follow-up(s)
                                </Text>
                            </View>
                            {groupedByDate[date].map((item, idx) => (
                                <View
                                    key={idx}
                                    style={lightStyles.followupItem}>
                                    <View style={lightStyles.followupLeft}>
                                        <Text style={lightStyles.followupName}>
                                            {item.name}
                                        </Text>
                                        <Text
                                            style={lightStyles.followupRemarks}>
                                            {item.remarks}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={lightStyles.followupBtn}
                                        onPress={() => handleOpenEdit(item)}>
                                        <Ionicons
                                            name="create-outline"
                                            size={18}
                                            color={THEME.primary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                />
            </View>
        );
    };

    // 4. My Follow-ups Screen (Timeline)
    const MyFollowUpsList = () => (
        <View style={{ flex: 1, backgroundColor: THEME.bg }}>
            <TopBar title="My Follow-ups" showBack />

            {/* Tabs */}
            <View style={lightStyles.tabsContainer}>
                {["Today", "Upcoming", "Missed", "Completed"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            lightStyles.tab,
                            activeTab === tab && lightStyles.tabActive,
                        ]}
                        onPress={() => setActiveTab(tab)}>
                        <Text
                            style={[
                                lightStyles.tabText,
                                activeTab === tab && lightStyles.tabTextActive,
                            ]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={followUps}
                keyExtractor={(item, index) =>
                    item?._id ? item._id.toString() : `item-${index}`
                }
                contentContainerStyle={lightStyles.timelinePadding}
                ListEmptyComponent={
                    <View style={lightStyles.emptyContainer}>
                        <Text style={lightStyles.emptyText}>
                            No {activeTab.toLowerCase()} follow-ups
                        </Text>
                    </View>
                }
                renderItem={({ item, index }) => {
                    const colors = getStatusColor(
                        item.nextAction === "Converted" ? "Converted" : "New",
                    );
                    return (
                        <View style={lightStyles.timelineItem}>
                            <View style={lightStyles.timelineTrack}>
                                <View
                                    style={[
                                        lightStyles.timelineDot,
                                        {
                                            backgroundColor: colors.border,
                                            borderColor: THEME.card,
                                        },
                                    ]}
                                />
                                {index !== followUps.length - 1 && (
                                    <View style={lightStyles.timelineLine} />
                                )}
                            </View>
                            <View style={lightStyles.timelineCard}>
                                <View style={lightStyles.timelineHeader}>
                                    <Text style={lightStyles.timelineDate}>
                                        {item.date} • {item.time}
                                    </Text>
                                    <View
                                        style={[
                                            lightStyles.pill,
                                            { backgroundColor: colors.bg },
                                        ]}>
                                        <Text
                                            style={[
                                                lightStyles.pillText,
                                                { color: colors.text },
                                            ]}>
                                            {item.type}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={lightStyles.timelineName}>
                                    {item.name}
                                </Text>
                                <Text style={lightStyles.timelineRemarks}>
                                    {item.remarks}
                                </Text>
                                <TouchableOpacity
                                    style={lightStyles.editLink}
                                    onPress={() => handleOpenEdit(item)}>
                                    <Text style={lightStyles.editLinkText}>
                                        Update Status
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );

    return (
        <SafeAreaView style={lightStyles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.card} />

            {screen === "ENQUIRY_LIST" && <EnquiryList />}
            {screen === "ADD_FOLLOWUP" && (
                <AddFollowUpScreen
                    selectedEnquiry={selectedEnquiry}
                    onBack={() => setScreen("ENQUIRY_LIST")}
                    onSuccess={() => {
                        setScreen("MY_FOLLOWUPS");
                        fetchFollowUps(activeTab);
                    }}
                />
            )}
            {screen === "MY_FOLLOWUPS" && <MyFollowUpsList />}
            {screen === "NEXT_FOLLOWUP" && <NextFollowUpsList />}

            {/* Edit Follow-up Modal */}
            <Modal visible={showEditModal} transparent animationType="fade">
                <View style={lightStyles.modalOverlay}>
                    <View style={lightStyles.centerModal}>
                        <View style={lightStyles.modalHeader}>
                            <Text style={lightStyles.sheetTitle}>
                                Update Status
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowEditModal(false)}>
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color={THEME.textMain}
                                />
                            </TouchableOpacity>
                        </View>

                        {editItem && (
                            <ScrollView>
                                <View style={lightStyles.infoBlock}>
                                    <Text style={lightStyles.infoLabel}>
                                        Date
                                    </Text>
                                    <Text style={lightStyles.infoValue}>
                                        {editItem.date}
                                    </Text>
                                </View>
                                <View style={lightStyles.inputGroup}>
                                    <Text style={lightStyles.inputLabel}>
                                        Remarks
                                    </Text>
                                    <TextInput
                                        value={editRemarks}
                                        onChangeText={setEditRemarks}
                                        placeholder="Add any notes or remarks..."
                                        style={[
                                            lightStyles.modalInput,
                                            {
                                                height: 100,
                                                textAlignVertical: "top",
                                            },
                                        ]}
                                        multiline
                                    />
                                </View>

                                <Text style={lightStyles.sectionLabel}>
                                    Select Action
                                </Text>
                                <View style={lightStyles.chipGroup}>
                                    {["Followup", "Sales", "Drop"].map(
                                        (status) => (
                                            <TouchableOpacity
                                                key={status}
                                                onPress={() =>
                                                    setEditStatus(status)
                                                }
                                                style={[
                                                    lightStyles.optionCard,
                                                    editStatus === status &&
                                                        lightStyles.optionCardActive,
                                                ]}>
                                                <View
                                                    style={[
                                                        lightStyles.radioCircle,
                                                        editStatus === status &&
                                                            lightStyles.radioCircleActive,
                                                    ]}
                                                />
                                                <Text
                                                    style={[
                                                        lightStyles.optionText,
                                                        editStatus === status &&
                                                            lightStyles.optionTextActive,
                                                    ]}>
                                                    {status}
                                                </Text>
                                            </TouchableOpacity>
                                        ),
                                    )}
                                </View>

                                {editStatus === "Followup" && (
                                    <View style={lightStyles.inputGroup}>
                                        <Text style={lightStyles.inputLabel}>
                                            Next Date
                                        </Text>
                                        <TextInput
                                            value={editNextDate}
                                            onChangeText={setEditNextDate}
                                            placeholder="YYYY-MM-DD"
                                            style={lightStyles.modalInput}
                                        />
                                    </View>
                                )}

                                {editStatus === "Sales" && (
                                    <View style={lightStyles.inputGroup}>
                                        <Text style={lightStyles.inputLabel}>
                                            Amount (₹)
                                        </Text>
                                        <TextInput
                                            value={editAmount}
                                            onChangeText={setEditAmount}
                                            keyboardType="numeric"
                                            placeholder="0.00"
                                            style={lightStyles.modalInput}
                                        />
                                    </View>
                                )}

                                <View style={lightStyles.sheetFooter}>
                                    <TouchableOpacity
                                        style={lightStyles.btnSecondary}
                                        onPress={() => setShowEditModal(false)}>
                                        <Text
                                            style={
                                                lightStyles.btnSecondaryText
                                            }>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={lightStyles.btnPrimary}
                                        onPress={handleSaveEdit}>
                                        <Text
                                            style={lightStyles.btnPrimaryText}>
                                            Save
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// --- LIGHT MODERN STYLES ---
const lightStyles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: THEME.bg },

    // Header
    headerContainer: {
        backgroundColor: THEME.card,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
        zIndex: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    headerLeft: { flexDirection: "row", alignItems: "center" },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: THEME.textMain,
        marginLeft: 8,
    },
    headerRight: { flexDirection: "row" },
    backBtn: { padding: 4, marginRight: 4 },
    iconBtn: { padding: 8 },

    // Search
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: THEME.card,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 2,
    },
    searchInput: {
        marginLeft: 8,
        flex: 1,
        fontSize: 15,
        color: THEME.textMain,
    },

    // List
    listPadding: { paddingHorizontal: 16, paddingBottom: 80 },
    emptyContainer: { alignItems: "center", marginTop: 60 },
    emptyText: { color: THEME.textSec, marginTop: 12, fontSize: 14 },

    // Card Design
    card: {
        backgroundColor: THEME.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    cardInfo: { flex: 1 },
    enqNo: {
        fontSize: 12,
        color: THEME.textSec,
        fontWeight: "600",
        marginBottom: 4,
    },
    cardName: {
        fontSize: 17,
        fontWeight: "700",
        color: THEME.textMain,
        marginBottom: 6,
    },
    metaRow: { flexDirection: "row", alignItems: "center" },
    metaText: { fontSize: 13, color: THEME.textSec, marginLeft: 4 },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },

    cardActions: {
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: THEME.bg,
        paddingTop: 12,
    },
    btnPrimary: {
        flexDirection: "row",
        backgroundColor: THEME.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
        marginRight: 8,
    },
    btnPrimaryText: {
        color: "#fff",
        fontWeight: "600",
        marginLeft: 4,
        fontSize: 13,
    },
    btnIcon: { padding: 6, borderRadius: 8, backgroundColor: THEME.bg },

    fab: {
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: THEME.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: THEME.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },

    // Tabs
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: THEME.card,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabActive: { borderBottomColor: THEME.primary },
    tabText: { fontSize: 14, fontWeight: "500", color: THEME.textSec },
    tabTextActive: { color: THEME.primary, fontWeight: "700" },

    // Timeline
    timelinePadding: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 80,
    },
    timelineItem: { flexDirection: "row", marginBottom: 24 },
    timelineTrack: { alignItems: "center", marginRight: 12 },
    timelineDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 3,
        zIndex: 2,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: THEME.border,
        position: "absolute",
        top: 14,
        bottom: -24,
    },
    timelineCard: {
        flex: 1,
        backgroundColor: THEME.card,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: THEME.border,
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    timelineHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    timelineDate: { fontSize: 12, color: THEME.textSec, fontWeight: "600" },
    pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    pillText: { fontSize: 10, fontWeight: "700" },
    timelineName: {
        fontSize: 15,
        fontWeight: "700",
        color: THEME.textMain,
        marginBottom: 4,
    },
    timelineRemarks: {
        fontSize: 13,
        color: THEME.textSec,
        lineHeight: 20,
        marginBottom: 12,
    },
    editLink: { alignSelf: "flex-start" },
    editLinkText: { fontSize: 12, color: THEME.primary, fontWeight: "600" },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    bottomSheet: {
        backgroundColor: THEME.card,
        width: "100%",
        height: "70%",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        position: "absolute",
        bottom: 0,
    },
    centerModal: {
        backgroundColor: THEME.card,
        width: "90%",
        borderRadius: 20,
        padding: 24,
        maxHeight: "80%",
    },
    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
    },
    sheetTitle: { fontSize: 18, fontWeight: "700", color: THEME.textMain },

    // Import Row
    importRow: {
        flexDirection: "row",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
        alignItems: "center",
    },
    importCell: { flex: 1, fontSize: 14, color: THEME.textMain },
    importError: { backgroundColor: THEME.dangerLight },

    // Edit Modal Specifics
    infoBlock: { marginBottom: 16 },
    infoLabel: {
        fontSize: 12,
        color: THEME.textSec,
        fontWeight: "600",
        marginBottom: 4,
    },
    infoValue: { fontSize: 14, color: THEME.textMain, lineHeight: 20 },

    sectionLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: THEME.textMain,
        marginBottom: 12,
    },
    chipGroup: { flexDirection: "row", gap: 12, marginBottom: 16 },
    optionCard: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.bg,
    },
    optionCardActive: {
        borderColor: THEME.primary,
        backgroundColor: THEME.primaryLight,
    },
    radioCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: THEME.textSec,
        marginRight: 8,
    },
    radioCircleActive: {
        borderColor: THEME.primary,
        backgroundColor: THEME.primary,
    },
    optionText: { fontSize: 14, color: THEME.textSec, fontWeight: "500" },
    optionTextActive: { color: THEME.primaryText, fontWeight: "700" },

    inputGroup: { marginBottom: 16 },
    inputLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: THEME.textMain,
        marginBottom: 6,
    },
    modalInput: {
        backgroundColor: THEME.bg,
        borderWidth: 1,
        borderColor: THEME.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: THEME.textMain,
    },

    sheetFooter: { flexDirection: "row", gap: 12, marginTop: 10 },
    btnSecondary: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    btnSecondaryText: {
        color: THEME.textMain,
        fontWeight: "600",
        fontSize: 14,
    },
    btnPrimary: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        backgroundColor: THEME.primary,
        alignItems: "center",
    },
    btnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 14 },

    exportRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    exportLabel: {
        width: 60,
        fontSize: 14,
        color: THEME.textSec,
        fontWeight: "500",
    },

    // Calendar View Styles
    calendarPadding: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 80,
    },
    dateSection: {
        marginBottom: 24,
        backgroundColor: THEME.card,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: THEME.border,
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    dateHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: THEME.primaryLight,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
        gap: 8,
    },
    dateTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: THEME.primaryText,
        flex: 1,
    },
    dateCount: {
        fontSize: 12,
        color: THEME.textSec,
        fontWeight: "600",
    },
    followupItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
    },
    followupLeft: {
        flex: 1,
    },
    followupName: {
        fontSize: 14,
        fontWeight: "700",
        color: THEME.textMain,
        marginBottom: 2,
    },
    followupRemarks: {
        fontSize: 12,
        color: THEME.textSec,
        lineHeight: 16,
    },
    followupBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: THEME.primaryLight,
    },
});
