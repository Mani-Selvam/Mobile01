import React, { useState, useEffect, useCallback } from "react";
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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as enquiryService from "../services/enquiryService";

// --- CONFIGURATION ---
// CHANGE THIS URL based on how you are running the app:
// 1. Real Device: Use your PC's WiFi IP (e.g., http://192.168.1.5:5000)
// 2. Android Emulator: http://10.0.2.2:5000
// 3. iOS Simulator: http://localhost:5000
const API_URL = "http://192.168.1.33:5000/api/enquiries";

// --- SUB-COMPONENTS (Moved outside App for stability) ---

// 1. FormInput (Removed Memo to fix focus issue)
const FormInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    readOnly = false,
}) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
            {label} <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
            style={[styles.input, readOnly && styles.inputReadOnly]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            editable={!readOnly}
            placeholderTextColor="#94a3b8"
            selectionColor="#2563eb"
            multiline={false}
            maxLength={500}
            // IMPORTANT: ensure unique key if list of inputs,
            // but since this is a single component, simple usage is fine.
        />
    </View>
);

// 2. AddEnquiryForm (Simplified, no Memo)
const AddEnquiryForm = ({
    formData,
    handleFormFieldChange,
    onBack,
    onSave,
}) => {
    // Create stable handlers here to avoid prop mismatch issues
    const updateField = (field) => (text) => handleFormFieldChange(field, text);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}>
            <View style={styles.subHeader}>
                <TouchableOpacity onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.subHeaderTitle}>Add Enquiry</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.formContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}>
                {/* Auto Fields */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>System Details</Text>
                </View>
                <View style={styles.formRow}>
                    <View style={styles.flex1}>
                        <FormInput
                            label="Enquiry No"
                            value="Auto Generated"
                            readOnly
                        />
                    </View>
                    <View style={styles.flex1}>
                        <FormInput
                            label="Date"
                            value={formData.date}
                            readOnly
                        />
                    </View>
                </View>
                <FormInput label="Enquiry By" value={formData.enqBy} readOnly />

                {/* User Inputs */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Customer Details</Text>
                </View>

                <View style={styles.formRow}>
                    <View style={styles.flex1}>
                        <FormInput
                            label="Enquiry Type"
                            value={formData.enqType}
                            onChangeText={updateField("enqType")}
                            placeholder="Select Type"
                        />
                    </View>
                    <View style={styles.flex1}>
                        <FormInput
                            label="Lead Source"
                            value={formData.source}
                            onChangeText={updateField("source")}
                            placeholder="Source"
                        />
                    </View>
                </View>

                <FormInput
                    label="Customer Name"
                    value={formData.name}
                    onChangeText={updateField("name")}
                    placeholder="Full Name"
                />
                <FormInput
                    label="Mobile No"
                    value={formData.mobile}
                    onChangeText={updateField("mobile")}
                    placeholder="10 Digit Mobile"
                    keyboardType="numeric"
                />
                <FormInput
                    label="Alt. Mobile"
                    value={formData.altMobile}
                    onChangeText={updateField("altMobile")}
                    placeholder="Alternate Mobile"
                    keyboardType="numeric"
                />
                <FormInput
                    label="Address"
                    value={formData.address}
                    onChangeText={updateField("address")}
                    placeholder="Full Address"
                />

                <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Product Details</Text>
                </View>

                <FormInput
                    label="Product Name"
                    value={formData.product}
                    onChangeText={updateField("product")}
                    placeholder="Product"
                />
                <View style={styles.formRow}>
                    <View style={styles.flex1}>
                        <FormInput
                            label="Variant"
                            value={formData.variant}
                            onChangeText={updateField("variant")}
                            placeholder="Model"
                        />
                    </View>
                    <View style={styles.flex1}>
                        <FormInput
                            label="Color"
                            value={formData.color}
                            onChangeText={updateField("color")}
                            placeholder="Color"
                        />
                    </View>
                </View>

                <FormInput
                    label="Approx. Cost (Lead Value)"
                    value={formData.cost}
                    onChangeText={updateField("cost")}
                    placeholder="0.00"
                    keyboardType="numeric"
                />
                <FormInput
                    label="Payment Method"
                    value={formData.paymentMethod}
                    onChangeText={updateField("paymentMethod")}
                    placeholder="Cash / Credit"
                />

                <View style={styles.formButtons}>
                    <TouchableOpacity
                        style={styles.btnSecondary}
                        onPress={onBack}>
                        <Text style={styles.btnSecondaryText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnPrimary}
                        onPress={onSave}>
                        <Ionicons name="save-outline" size={20} color="#fff" />
                        <Text style={styles.btnPrimaryText}>Save Enquiry</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [screen, setScreen] = useState("list"); // 'list' or 'add'
    const [enquiries, setEnquiries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        enqNo: "",
        date: "",
        enqBy: "Admin User",
        enqType: "",
        source: "",
        name: "",
        mobile: "",
        altMobile: "",
        address: "",
        product: "",
        variant: "",
        color: "",
        cost: "",
        paymentMethod: "",
    });

    // Modal State
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);

    // --- EFFECTS ---

    // 1. Fetch data on load, and whenever Search or Filter changes
    useEffect(() => {
        fetchEnquiries();
        // Set initial date for form
        const today = new Date().toISOString().split("T")[0];
        setFormData((prev) => ({ ...prev, date: today }));
    }, [searchQuery, filterStatus]);

    // --- HANDLERS ---

    // API: Fetch Enquiries
    const fetchEnquiries = async () => {
        try {
            const data = await enquiryService.getAllEnquiries();
            setEnquiries(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            Alert.alert("Error", "Could not connect to server");
            setIsLoading(false);
        }
    };

    // Memoized form field update handler
    const handleFormFieldChange = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleResetForm = () => {
        setFormData({
            enqNo: "", // Server will generate this
            date: new Date().toISOString().split("T")[0],
            enqBy: "Admin User",
            enqType: "",
            source: "",
            name: "",
            mobile: "",
            altMobile: "",
            address: "",
            product: "",
            variant: "",
            color: "",
            cost: "",
            paymentMethod: "",
        });
    };

    const handleAddEnquiryPress = () => {
        handleResetForm();
        setScreen("add");
    };

    // API: Save Enquiry
    const handleSaveEnquiry = async () => {
        // Basic Validation
        if (
            !formData.name ||
            !formData.mobile ||
            !formData.product ||
            !formData.cost
        ) {
            Alert.alert("Error", "Please fill all required fields (*)");
            return;
        }

        try {
            console.log("Saving enquiry with data:", formData);

            // Convert cost to number for API consistency
            const payload = {
                name: formData.name,
                mobile: formData.mobile,
                product: formData.product,
                cost: parseFloat(formData.cost) || 0,
            };

            console.log("Sending payload:", payload);

            // Use direct fetch to test (bypass axios/service)
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            console.log("Response status:", response.status);
            const newEnquiry = await response.json();
            console.log("Response data:", newEnquiry);

            if (response.ok) {
                console.log("Enquiry saved successfully:", newEnquiry);

                // Add to new enquiry to top of list locally (Optimistic UI)
                setEnquiries([newEnquiry, ...enquiries]);

                // Reset form
                handleResetForm();

                // Show success and follow-up popup
                setShowFollowUpModal(true);
                Alert.alert("Success", "Enquiry saved successfully!");
            } else {
                console.error("Failed to save:", newEnquiry);
                Alert.alert(
                    "Error",
                    newEnquiry.message || "Failed to save enquiry",
                );
            }
        } catch (error) {
            console.error("Save enquiry error:", error);
            console.error("Error message:", error.message);

            Alert.alert(
                "Error",
                error.message || "Failed to save enquiry. Please try again.",
            );
        }
    };

    const handleFollowUpResponse = (response) => {
        setShowFollowUpModal(false);
        if (response === "no") {
            setScreen("list");
        } else {
            // Logic to navigate to Follow-up screen would go here
            Alert.alert("Success", "Navigate to Follow-up Screen");
            setScreen("list");
        }
    };

    // API: Delete Enquiry
    const handleDelete = (id) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this enquiry?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const deleteUrl = `${API_URL}/${id}`;
                            await fetch(deleteUrl, { method: "DELETE" });

                            // Remove from local state
                            setEnquiries(enquiries.filter((e) => e.id !== id));
                        } catch (error) {
                            Alert.alert("Error", "Could not delete item");
                        }
                    },
                },
            ],
        );
    };

    // --- RENDERERS ---

    const getStatusColor = (status) => {
        switch (status) {
            case "New":
                return "#dbeafe";
            case "In Progress":
                return "#fef3c7";
            case "Converted":
                return "#d1fae5";
            case "Closed":
                return "#f1f5f9";
            default:
                return "#e2e8f0";
        }
    };

    const getStatusTextColor = (status) => {
        switch (status) {
            case "New":
                return "#1e40af";
            case "In Progress":
                return "#92400e";
            case "Converted":
                return "#065f46";
            case "Closed":
                return "#475569";
            default:
                return "#475569";
        }
    };

    // --- COMPONENTS ---

    const ListItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.enqNo}>{item.enqNo}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>
                <View
                    style={[
                        styles.badge,
                        { backgroundColor: getStatusColor(item.status) },
                    ]}>
                    <Text
                        style={[
                            styles.badgeText,
                            { color: getStatusTextColor(item.status) },
                        ]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.row}>
                    <Text style={styles.label}>Customer:</Text>
                    <Text style={styles.value}>{item.name}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Mobile:</Text>
                    <Text style={styles.value}>{item.mobile}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Product:</Text>
                    <Text style={styles.value}>{item.product}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Lead Value:</Text>
                    <Text style={styles.valuePrice}>₹{item.cost}</Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="eye-outline" size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={20} color="#f59e0b" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                    <MaterialIcons
                        name="follow-the-signs"
                        size={20}
                        color="#10b981"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    // --- MAIN RETURN ---

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* --- LIST SCREEN --- */}
            {screen === "list" && (
                <View style={styles.flex1}>
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <Text style={styles.topBarTitle}>Enquiries</Text>
                        <View style={styles.topBarActions}>
                            <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={handleAddEnquiryPress}>
                                <Ionicons
                                    name="add-circle"
                                    size={24}
                                    color="#fff"
                                />
                                <Text style={styles.iconBtnText}>Add</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn}>
                                <Ionicons
                                    name="download-outline"
                                    size={20}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn}>
                                <Ionicons
                                    name="share-social-outline"
                                    size={20}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Filters & Search */}
                    <View style={styles.filtersContainer}>
                        <View style={styles.searchRow}>
                            <Ionicons name="search" size={20} color="#64748b" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search Name / Mobile..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <View style={styles.filterRow}>
                            <TouchableOpacity
                                style={styles.filterChip}
                                onPress={() => setFilterStatus("All")}>
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        filterStatus === "All" && {
                                            color: "#2563eb",
                                        },
                                    ]}>
                                    All Status ▼
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.filterChip}
                                onPress={() => setFilterStatus("New")}>
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        filterStatus === "New" && {
                                            color: "#d97706",
                                        },
                                    ]}>
                                    New ▼
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.filterChip}
                                onPress={() => setFilterStatus("In Progress")}>
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        filterStatus === "In Progress" && {
                                            color: "#2563eb",
                                        },
                                    ]}>
                                    In Progress ▼
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Enquiry List */}
                    <FlatList
                        data={enquiries}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={ListItem}
                        contentContainerStyle={styles.listContent}
                        refreshing={isLoading}
                        onRefresh={fetchEnquiries}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                {isLoading
                                    ? "Loading..."
                                    : "No enquiries found"}
                            </Text>
                        }
                    />
                </View>
            )}

            {/* --- ADD ENQUIRY SCREEN --- */}
            {screen === "add" && (
                <AddEnquiryForm
                    formData={formData}
                    handleFormFieldChange={handleFormFieldChange}
                    onBack={() => setScreen("list")}
                    onSave={handleSaveEnquiry}
                />
            )}

            {/* --- FOLLOW UP MODAL --- */}
            <Modal visible={showFollowUpModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalIconContainer}>
                            <Ionicons
                                name="timer-outline"
                                size={40}
                                color="#2563eb"
                            />
                        </View>
                        <Text style={styles.modalTitle}>Follow-up?</Text>
                        <Text style={styles.modalMessage}>
                            Do you want to add a follow-up for this enquiry?
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnNo]}
                                onPress={() => handleFollowUpResponse("no")}>
                                <Text style={styles.modalBtnNoText}>
                                    No, Go to List
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnYes]}
                                onPress={() => handleFollowUpResponse("yes")}>
                                <Text style={styles.modalBtnYesText}>
                                    Yes, Add Follow-up
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
    flex1: { flex: 1 },
    container: { flex: 1, backgroundColor: "#f1f5f9" },

    // List Screen
    topBar: {
        backgroundColor: "#2563eb",
        paddingVertical: 15,
        paddingHorizontal: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 4,
    },
    topBarTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    topBarActions: { flexDirection: "row", alignItems: "center" },
    iconBtn: { flexDirection: "row", alignItems: "center", marginLeft: 15 },
    iconBtnText: { color: "#fff", marginLeft: 5, fontWeight: "600" },

    filtersContainer: { padding: 15, backgroundColor: "#fff" },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f5f9",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    searchInput: { flex: 1, padding: 10, color: "#333" },
    filterRow: { flexDirection: "row", justifyContent: "space-between" },
    filterChip: {
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderColor: "#e2e8f0",
        borderWidth: 1,
    },
    filterChipText: { fontSize: 12, color: "#64748b", fontWeight: "600" },

    listContent: { padding: 15 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    enqNo: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
    date: { fontSize: 12, color: "#64748b", marginTop: 2 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 11, fontWeight: "bold" },
    cardBody: { marginBottom: 10 },
    row: { flexDirection: "row", marginBottom: 6 },
    label: { width: 80, color: "#64748b", fontSize: 13 },
    value: { flex: 1, color: "#1e293b", fontSize: 14, fontWeight: "500" },
    valuePrice: { flex: 1, color: "#10b981", fontSize: 14, fontWeight: "bold" },
    cardActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        paddingTop: 10,
    },
    actionBtn: { marginLeft: 15 },
    emptyText: {
        textAlign: "center",
        marginTop: 50,
        color: "#94a3b8",
        fontSize: 16,
    },

    // Add Form Screen
    subHeader: {
        backgroundColor: "#2563eb",
        paddingVertical: 15,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    subHeaderTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    formContainer: { padding: 20, flex: 1 },
    sectionTitleContainer: { marginBottom: 10, marginTop: 10 },
    sectionTitle: {
        color: "#2563eb",
        fontSize: 16,
        fontWeight: "bold",
        textTransform: "uppercase",
    },

    formRow: { flexDirection: "row", justifyContent: "space-between" },
    flex1: { flex: 1, marginRight: 10 },

    inputGroup: { marginBottom: 15 },
    inputLabel: {
        fontSize: 14,
        color: "#334155",
        marginBottom: 5,
        fontWeight: "600",
    },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: "#1e293b",
    },
    inputReadOnly: { backgroundColor: "#f1f5f9", color: "#64748b" },

    formButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 20,
        marginBottom: 40,
    },
    btnSecondary: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        marginRight: 10,
        backgroundColor: "#fff",
    },
    btnSecondaryText: { color: "#64748b", fontWeight: "bold" },
    btnPrimary: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2563eb",
        padding: 12,
        borderRadius: 8,
    },
    btnPrimaryText: { color: "#fff", fontWeight: "bold", marginLeft: 5 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalCard: {
        backgroundColor: "#fff",
        width: "85%",
        borderRadius: 15,
        padding: 25,
        alignItems: "center",
    },
    modalIconContainer: {
        backgroundColor: "#dbeafe",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    modalMessage: {
        textAlign: "center",
        color: "#64748b",
        marginBottom: 25,
        fontSize: 14,
    },
    modalActions: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
    },
    modalBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    modalBtnNo: { backgroundColor: "#f1f5f9", marginRight: 10 },
    modalBtnNoText: { color: "#475569", fontWeight: "bold" },
    modalBtnYes: { backgroundColor: "#2563eb", marginLeft: 10 },
    modalBtnYesText: { color: "#fff", fontWeight: "bold" },
});
