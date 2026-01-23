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
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as enquiryService from "../services/enquiryService";
import * as followupService from "../services/followupService";

// --- MAIN APP ---
export default function App() {
    // Navigation State
    const [screen, setScreen] = useState("ENQUIRY_LIST"); // ENQUIRY_LIST, ADD_ENQ, ADD_FOLLOWUP, MY_FOLLOWUPS

    // Data State (Initialized empty, fetched from API)
    const [enquiries, setEnquiries] = useState([]);
    const [followUps, setFollowUps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [followUpForm, setFollowUpForm] = useState({
        date: "",
        time: "",
        type: "Call",
        remarks: "",
        nextAction: "Interested",
        isNextRequired: false,
        nextDate: "",
    });

    // My Followups Tab State
    const [activeTab, setActiveTab] = useState("Today"); // Today, Upcoming, Missed, Completed

    // Import/Export Modal State
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [importDataPreview, setImportDataPreview] = useState([]);

    // --- EFFECTS ---

    // 1. Fetch initial data on load
    useEffect(() => {
        fetchEnquiries();
        fetchFollowUps("Today");
        // Set initial date for form
        const today = new Date().toISOString().split("T")[0];
        setFollowUpForm((prev) => ({ ...prev, date: today }));
    }, []);

    // 2. Refetch follow-ups when Tab changes
    useEffect(() => {
        fetchFollowUps(activeTab);
    }, [activeTab]);

    // --- LOGIC HELPERS ---

    const getStatusColor = (status) => {
        switch (status) {
            case "New":
                return { bg: "#fef3c7", text: "#d97706" };
            case "In Progress":
                return { bg: "#dbeafe", text: "#2563eb" };
            case "Converted":
                return { bg: "#d1fae5", text: "#059669" };
            case "Closed":
                return { bg: "#f1f5f9", text: "#64748b" };
            case "Missed":
                return { bg: "#fee2e2", text: "#dc2626" };
            default:
                return { bg: "#f3f4f6", text: "#374151" };
        }
    };

    const getFilteredFollowUps = () => {
        // Filtering is now handled by the server, but we keep this helper for UI calculations if needed
        return followUps;
    };

    // --- API HANDLERS ---
    // API: Fetch All Enquiries
    const fetchEnquiries = async () => {
        try {
            const data = await enquiryService.getAllEnquiries();
            setEnquiries(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching enquiries:", error);
            Alert.alert("Error", "Could not connect to server");
            setIsLoading(false);
        }
    };

    // API: Fetch Follow-ups (With Tab)
    const fetchFollowUps = async (tab) => {
        try {
            const data = await followupService.getFollowUps(tab);
            setFollowUps(data);
        } catch (error) {
            console.error("Error fetching follow-ups:", error);
        }
    };

    // API: Start Follow-up (Fetches Enq Details for Auto-fill)
    const handleStartFollowUp = async (enq) => {
        try {
            // 1. Fetch detailed data for this Enquiry
            const data = await enquiryService.getEnquiryById(enq.id);

            // 2. Set Enquiry for Form Auto-fill
            setSelectedEnquiry(data);

            // 3. Reset Form
            setFollowUpForm({
                date: new Date().toISOString().split("T")[0],
                time: "",
                type: "Call",
                remarks: "",
                nextAction: "Interested",
                isNextRequired: false,
                nextDate: "",
            });
            setScreen("ADD_FOLLOWUP");
        } catch (error) {
            Alert.alert("Error", "Could not load enquiry details");
        }
    };

    // API: Save Follow-up
    const handleSaveFollowUp = async (addNext = false) => {
        // Validation
        if (!followUpForm.remarks) {
            Alert.alert("Required", "Please enter Discussion / Remarks");
            return;
        }
        if (followUpForm.isNextRequired && !followUpForm.nextDate) {
            Alert.alert("Required", "Please select Next Follow-up Date");
            return;
        }

        try {
            // Prepare Payload
            const payload = {
                ...followUpForm,
                enqNo: selectedEnquiry.enqNo,
                name: selectedEnquiry.name,
            };

            // POST to API
            await followupService.createFollowUp(payload);

            // Backend automatically updated Enquiry Status.
            // Now refresh lists to reflect changes.
            await fetchEnquiries();
            await fetchFollowUps(activeTab); // Refresh current tab

            if (addNext) {
                Alert.alert("Success", "Follow-up saved. Ready for next.");
                setFollowUpForm((prev) => ({
                    ...prev,
                    remarks: "",
                    time: "",
                }));
            } else {
                setScreen("MY_FOLLOWUPS");
            }
        } catch (error) {
            console.error(error);
            Alert.alert(
                "Error",
                "Network error. Please check your connection.",
            );
        }
    };

    const handleImportSimulate = () => {
        const mockData = [
            {
                enqNo: "ENQ-999",
                name: "Valid User",
                mobile: "9988776655",
                error: false,
            },
            {
                enqNo: "ENQ-",
                name: "Error Missing No",
                mobile: "123",
                error: true,
            },
            {
                enqNo: "ENQ-888",
                name: "Another User",
                mobile: "5544332211",
                error: false,
            },
        ];
        setImportDataPreview(mockData);
        setShowImportModal(true);
    };

    // --- RENDER SUB-COMPONENTS ---

    const TopBar = ({ title, showBack = false }) => (
        <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
                {showBack && (
                    <TouchableOpacity
                        onPress={() => setScreen("ENQUIRY_LIST")}
                        style={{ marginRight: 10 }}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                )}
                <Text style={styles.topBarTitle}>{title}</Text>
            </View>
            <View style={styles.topBarRight}>
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={handleImportSimulate}>
                    <Ionicons name="download-outline" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => setShowExportModal(true)}>
                    <MaterialIcons name="upload" size={22} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const FollowUpForm = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}>
            <TopBar title="Add Follow-up" showBack />

            <ScrollView
                style={styles.formContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}>
                {/* Auto-filled Section */}
                <View style={styles.card}>
                    <Text style={styles.cardHeaderLabel}>
                        Enquiry Details (Auto-filled)
                    </Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Enquiry No</Text>
                        <TextInput
                            style={[styles.input, styles.inputReadOnly]}
                            value={selectedEnquiry?.enqNo}
                            editable={false}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Customer Name</Text>
                        <TextInput
                            style={[styles.input, styles.inputReadOnly]}
                            value={selectedEnquiry?.name}
                            editable={false}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mobile No</Text>
                        <TextInput
                            style={[styles.input, styles.inputReadOnly]}
                            value={selectedEnquiry?.mobile}
                            editable={false}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Product Name</Text>
                        <TextInput
                            style={[styles.input, styles.inputReadOnly]}
                            value={selectedEnquiry?.product}
                            editable={false}
                        />
                    </View>
                </View>

                {/* User Input Section */}
                <View style={styles.card}>
                    <Text style={styles.cardHeaderLabel}>
                        Follow-up Details
                    </Text>

                    <View style={styles.rowInputs}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Follow-up Date *</Text>
                            <TextInput
                                style={styles.input}
                                value={followUpForm.date}
                                onChangeText={(t) =>
                                    setFollowUpForm({
                                        ...followUpForm,
                                        date: t,
                                    })
                                }
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#94a3b8"
                                selectionColor="#2563eb"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Time</Text>
                            <TextInput
                                style={styles.input}
                                value={followUpForm.time}
                                onChangeText={(t) =>
                                    setFollowUpForm({
                                        ...followUpForm,
                                        time: t,
                                    })
                                }
                                placeholder="HH:MM"
                                placeholderTextColor="#94a3b8"
                                selectionColor="#2563eb"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Follow-up Type</Text>
                    <View style={styles.chipContainer}>
                        {["Call", "WhatsApp", "Visit"].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.chip,
                                    followUpForm.type === type &&
                                        styles.chipActive,
                                ]}
                                onPress={() =>
                                    setFollowUpForm({
                                        ...followUpForm,
                                        type: type,
                                    })
                                }>
                                <Text
                                    style={[
                                        styles.chipText,
                                        followUpForm.type === type &&
                                            styles.chipTextActive,
                                    ]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Discussion / Remarks *</Text>
                        <TextInput
                            style={[
                                styles.input,
                                { height: 80, textAlignVertical: "top" },
                            ]}
                            value={followUpForm.remarks}
                            onChangeText={(t) =>
                                setFollowUpForm({ ...followUpForm, remarks: t })
                            }
                            placeholder="Enter details..."
                            multiline
                            placeholderTextColor="#94a3b8"
                            selectionColor="#2563eb"
                        />
                    </View>

                    <Text style={styles.label}>Next Action</Text>
                    <View style={styles.chipContainer}>
                        {[
                            "Interested",
                            "Need Time",
                            "Not Interested",
                            "Converted",
                        ].map((action) => (
                            <TouchableOpacity
                                key={action}
                                style={[
                                    styles.chipSmall,
                                    followUpForm.nextAction === action &&
                                        styles.chipActive,
                                ]}
                                onPress={() =>
                                    setFollowUpForm({
                                        ...followUpForm,
                                        nextAction: action,
                                    })
                                }>
                                <Text
                                    style={[
                                        styles.chipTextSmall,
                                        followUpForm.nextAction === action &&
                                            styles.chipTextActive,
                                    ]}>
                                    {action}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.label}>
                            Next Follow-up Required?
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.toggle,
                                followUpForm.isNextRequired
                                    ? styles.toggleActive
                                    : styles.toggleInactive,
                            ]}
                            onPress={() =>
                                setFollowUpForm({
                                    ...followUpForm,
                                    isNextRequired:
                                        !followUpForm.isNextRequired,
                                })
                            }>
                            <Text style={styles.toggleText}>
                                {followUpForm.isNextRequired ? "YES" : "NO"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {followUpForm.isNextRequired && (
                        <View style={[styles.inputGroup, { marginTop: 10 }]}>
                            <Text style={styles.label}>
                                Next Follow-up Date
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={followUpForm.nextDate}
                                onChangeText={(t) =>
                                    setFollowUpForm({
                                        ...followUpForm,
                                        nextDate: t,
                                    })
                                }
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#94a3b8"
                                selectionColor="#2563eb"
                            />
                        </View>
                    )}
                </View>

                <View style={styles.stickyButtons}>
                    <TouchableOpacity
                        style={styles.btnCancel}
                        onPress={() => setScreen("ENQUIRY_LIST")}>
                        <Text style={styles.btnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnSave}
                        onPress={() => handleSaveFollowUp(false)}>
                        <Text style={styles.btnSaveText}>Save Follow-up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnSave, styles.btnSaveNext]}
                        onPress={() => handleSaveFollowUp(true)}>
                        <Ionicons name="add" size={20} color="white" />
                        <Text style={styles.btnSaveText}>Save & Next</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );

    const MyFollowUpsList = () => (
        <View style={{ flex: 1 }}>
            <TopBar title="My Follow-ups" showBack />

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {["Today", "Upcoming", "Missed", "Completed"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tab,
                            activeTab === tab && styles.tabActive,
                        ]}
                        onPress={() => setActiveTab(tab)}>
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab && styles.tabTextActive,
                            ]}>
                            {tab}
                        </Text>
                        {activeTab === tab && (
                            <View style={styles.tabIndicator} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={followUps}
                keyExtractor={(item, index) =>
                    item?.id ? item.id.toString() : `item-${index}`
                }
                contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
                ListEmptyComponent={
                    <Text
                        style={{
                            textAlign: "center",
                            marginTop: 50,
                            color: "gray",
                        }}>
                        {isLoading
                            ? "Loading..."
                            : `No ${activeTab.toLowerCase()} follow-ups`}
                    </Text>
                }
                renderItem={({ item }) => {
                    const colors = getStatusColor(
                        item.nextAction === "Converted" ? "Converted" : "New",
                    );
                    return (
                        <View style={styles.listCard}>
                            <View style={styles.listHeader}>
                                <View>
                                    <Text style={styles.enqNo}>
                                        {item.enqNo}
                                    </Text>
                                    <Text style={styles.subText}>
                                        {item.name}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.badge,
                                        { backgroundColor: colors.bg },
                                    ]}>
                                    <Text
                                        style={[
                                            styles.badgeText,
                                            { color: colors.text },
                                        ]}>
                                        {item.nextAction}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.listBody}>
                                <View style={styles.rowIcon}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={16}
                                        color="#64748b"
                                    />
                                    <Text style={styles.bodyText}>
                                        {item.date} at {item.time || "--:--"}
                                    </Text>
                                </View>
                                <View style={styles.rowIcon}>
                                    <Ionicons
                                        name="call-outline"
                                        size={16}
                                        color="#64748b"
                                    />
                                    <Text style={styles.bodyText}>
                                        {item.type}
                                    </Text>
                                </View>
                                <Text
                                    style={styles.remarksText}
                                    numberOfLines={2}>
                                    "{item.remarks}"
                                </Text>
                            </View>

                            <View style={styles.listFooter}>
                                <TouchableOpacity style={styles.actionIcon}>
                                    <Ionicons
                                        name="eye-outline"
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionIcon}>
                                    <Ionicons
                                        name="create-outline"
                                        size={20}
                                        color="#f59e0b"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionIcon}>
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color="#ef4444"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );

    const EnquiryList = () => (
        <View style={{ flex: 1 }}>
            <TopBar title="Enquiry Management" />

            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#94a3b8" />
                <TextInput
                    placeholder="Search Enquiries..."
                    style={styles.searchInput}
                />
            </View>

            <FlatList
                data={enquiries}
                keyExtractor={(item, index) =>
                    item?.id ? item.id.toString() : `item-${index}`
                }
                contentContainerStyle={{ padding: 15 }}
                refreshing={isLoading}
                onRefresh={fetchEnquiries}
                ListEmptyComponent={
                    <Text
                        style={{
                            textAlign: "center",
                            marginTop: 50,
                            color: "gray",
                        }}>
                        {isLoading ? "Loading..." : "No enquiries found"}
                    </Text>
                }
                renderItem={({ item }) => {
                    const colors = getStatusColor(item.status);
                    return (
                        <View style={styles.listCard}>
                            <View style={styles.listHeader}>
                                <Text style={styles.enqNo}>{item.enqNo}</Text>
                                <View
                                    style={[
                                        styles.badge,
                                        { backgroundColor: colors.bg },
                                    ]}>
                                    <Text
                                        style={[
                                            styles.badgeText,
                                            { color: colors.text },
                                        ]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.mainName}>{item.name}</Text>
                            <Text style={styles.subText}>
                                {item.product} • ₹{item.value}
                            </Text>

                            <View style={styles.listFooter}>
                                <TouchableOpacity
                                    style={styles.btnSmall}
                                    onPress={() => handleStartFollowUp(item)}>
                                    <Ionicons
                                        name="timer-outline"
                                        size={16}
                                        color="#2563eb"
                                    />
                                    <Text style={styles.btnSmallText}>
                                        Follow-up
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionIcon}>
                                    <Ionicons
                                        name="create-outline"
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionIcon}>
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color="#ef4444"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() =>
                    Alert.alert("Module 1", "Add Enquiry Form here")
                }>
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );

    // --- RENDER ---
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Main Content Router */}
            {screen === "ENQUIRY_LIST" && <EnquiryList />}
            {screen === "ADD_FOLLOWUP" && <FollowUpForm />}
            {screen === "MY_FOLLOWUPS" && <MyFollowUpsList />}

            {/* --- IMPORT PREVIEW MODAL --- */}
            <Modal visible={showImportModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Preview Import
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowImportModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.helperText}>
                            Rows with errors are highlighted in red.
                        </Text>

                        <ScrollView
                            style={{ flex: 1, width: "100%" }}
                            keyboardShouldPersistTaps="handled">
                            {importDataPreview.map((row, idx) => (
                                <View
                                    key={idx}
                                    style={[
                                        styles.importRow,
                                        row.error && {
                                            backgroundColor: "#fee2e2",
                                            borderColor: "#ef4444",
                                        },
                                    ]}>
                                    <Text style={styles.importCell}>
                                        {row.enqNo}
                                    </Text>
                                    <Text style={styles.importCell}>
                                        {row.name}
                                    </Text>
                                    <Text style={styles.importCell}>
                                        {row.mobile}
                                    </Text>
                                    {row.error && (
                                        <Ionicons
                                            name="warning"
                                            size={16}
                                            color="red"
                                        />
                                    )}
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.btnModalSecondary}
                                onPress={() => setShowImportModal(false)}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.btnModalPrimary}
                                onPress={() => {
                                    setShowImportModal(false);
                                    Alert.alert("Import", "Valid data saved!");
                                }}>
                                <Text
                                    style={{
                                        color: "white",
                                        fontWeight: "bold",
                                    }}>
                                    Save Valid Rows
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- EXPORT MODAL --- */}
            <Modal visible={showExportModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.smallModal}>
                        <Text style={styles.modalTitle}>Export Options</Text>

                        <View style={styles.exportOption}>
                            <Text style={styles.exportLabel}>Date Range</Text>
                            <View style={styles.rowInputs}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="From"
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="To"
                                />
                            </View>
                        </View>

                        <View style={styles.exportOption}>
                            <Text style={styles.exportLabel}>Type</Text>
                            <View style={styles.chipContainer}>
                                <TouchableOpacity style={styles.chip}>
                                    <Text style={styles.chipText}>
                                        Enquiries
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.chip, styles.chipActive]}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            styles.chipTextActive,
                                        ]}>
                                        Follow-ups
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.btnModalSecondary}
                                onPress={() => setShowExportModal(false)}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.btnModalPrimary}
                                onPress={() => {
                                    setShowExportModal(false);
                                    Alert.alert(
                                        "Export",
                                        "File downloaded as Excel",
                                    );
                                }}>
                                <Text
                                    style={{
                                        color: "white",
                                        fontWeight: "bold",
                                    }}>
                                    Export
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },

    // Top Bar
    topBar: {
        backgroundColor: "#2563eb",
        paddingVertical: 15,
        paddingHorizontal: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    topBarLeft: { flexDirection: "row", alignItems: "center" },
    topBarTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    topBarRight: { flexDirection: "row" },
    iconBtn: { marginLeft: 15 },

    // Common List
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        margin: 15,
        padding: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    searchInput: { marginLeft: 10, flex: 1 },
    listCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    listHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    enqNo: { fontWeight: "bold", color: "#1e293b" },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 11, fontWeight: "bold" },
    mainName: { fontSize: 16, fontWeight: "600", color: "#334155" },
    subText: { fontSize: 13, color: "#64748b", marginTop: 2 },
    listFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        paddingTop: 10,
    },
    btnSmall: {
        flexDirection: "row",
        backgroundColor: "#eff6ff",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginRight: "auto",
    },
    btnSmallText: {
        color: "#2563eb",
        fontSize: 12,
        fontWeight: "bold",
        marginLeft: 4,
    },
    actionIcon: { padding: 6, marginLeft: 5 },
    fab: {
        position: "absolute",
        bottom: 25,
        right: 20,
        backgroundColor: "#10b981",
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.3,
    },

    // Form
    formContainer: { flex: 1, padding: 15, paddingBottom: 100 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        elevation: 1,
    },
    cardHeaderLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#64748b",
        marginBottom: 10,
        textTransform: "uppercase",
    },
    inputGroup: { marginBottom: 12 },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#334155",
        marginBottom: 6,
    },
    input: {
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: "#334155",
    },
    inputReadOnly: { backgroundColor: "#f1f5f9", color: "#94a3b8" },
    rowInputs: { flexDirection: "row", gap: 10 },

    // Chips (Radio)
    chipContainer: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 15,
        flexWrap: "wrap",
    },
    chip: {
        backgroundColor: "#f1f5f9",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "transparent",
    },
    chipActive: { backgroundColor: "#eff6ff", borderColor: "#2563eb" },
    chipText: { color: "#64748b", fontSize: 13, fontWeight: "500" },
    chipTextActive: { color: "#2563eb", fontWeight: "bold" },
    chipSmall: { paddingVertical: 6, paddingHorizontal: 12 },

    // Toggle Switch
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 10,
    },
    toggle: {
        width: 60,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
    },
    toggleInactive: { backgroundColor: "#cbd5e1" },
    toggleActive: { backgroundColor: "#10b981" },
    toggleText: { fontSize: 12, fontWeight: "bold", color: "#fff" },

    // Buttons
    stickyButtons: { flexDirection: "row", gap: 10, marginTop: 10 },
    btnCancel: {
        flex: 1,
        backgroundColor: "#f1f5f9",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    btnCancelText: { color: "#64748b", fontWeight: "bold" },
    btnSave: {
        flex: 1.2,
        backgroundColor: "#2563eb",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    btnSaveText: { color: "#fff", fontWeight: "bold" },
    btnSaveNext: { backgroundColor: "#10b981" },

    // My Followups Tabs
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "#fff",
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
    tabActive: { borderBottomWidth: 2, borderBottomColor: "#2563eb" },
    tabText: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
    tabTextActive: { color: "#2563eb" },
    tabIndicator: {
        position: "absolute",
        bottom: -1,
        width: "100%",
        height: 2,
        backgroundColor: "#2563eb",
    },

    // Followup List Item specifics
    listBody: { marginTop: 8 },
    rowIcon: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    bodyText: { marginLeft: 8, fontSize: 13, color: "#475569" },
    remarksText: {
        marginTop: 8,
        fontStyle: "italic",
        color: "#64748b",
        fontSize: 12,
        backgroundColor: "#f8fafc",
        padding: 8,
        borderRadius: 6,
    },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "#fff",
        height: "80%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    smallModal: {
        backgroundColor: "#fff",
        margin: 30,
        borderRadius: 15,
        padding: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
    helperText: { fontSize: 12, color: "#ef4444", marginBottom: 10 },

    // Import Preview Rows
    importRow: {
        flexDirection: "row",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        alignItems: "center",
    },
    importCell: { flex: 1, fontSize: 13, color: "#334155" },

    exportOption: { marginBottom: 20 },
    exportLabel: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#475569",
    },

    modalFooter: { flexDirection: "row", gap: 10, marginTop: 20 },
    btnModalSecondary: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        alignItems: "center",
    },
    btnModalPrimary: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#2563eb",
        alignItems: "center",
    },
});
