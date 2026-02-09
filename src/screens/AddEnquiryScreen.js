import React, { useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    FlatList,
    Modal,
    Dimensions,
    TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL as GLOBAL_API_URL } from "../services/apiConfig";

// --- CONFIGURATION ---
const API_URL = `${GLOBAL_API_URL}/enquiries`;

// OPTIONS
const ENQUIRY_TYPE_OPTIONS = ["Normal", "High", "Medium"];
const LEAD_SOURCE_OPTIONS = [
    "Friends",
    "Employee Referral",
    "Job Portal",
    "Social Media",
    "Consultancy",
    "Company Website",
];

// --- IOS PREMIUM DESIGN SYSTEM ---
const COLORS = {
    // Palette: Modern Indigo & Slate
    primary: "#4F46E5", // Indigo 600
    primaryDark: "#4338CA", // Indigo 700
    primaryLight: "#818CF8", // Indigo 400

    // Backgrounds
    background: "#F1F5F9", // Cool Gray 100 (Backdrop)
    surface: "#FFFFFF", // Pure White (Card)

    // Inputs
    inputBg: "#F8FAFC", // Slate 50
    border: "#E2E8F0", // Slate 200

    // Typography
    textTitle: "#0F172A", // Slate 900
    textBody: "#334155", // Slate 700
    textMuted: "#94A3B8", // Slate 400
    textPlaceholder: "#CBD5E1", // Slate 300

    // Functional
    danger: "#EF4444",

    // Shadows
    shadowSoft: {
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    shadowCard: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
};

// --- REUSABLE UI COMPONENTS ---

// 1. Premium Input Field
const FormInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    isRequired = true,
    iconName,
}) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
            {label} {isRequired && <Text style={styles.requiredStar}>*</Text>}
        </Text>
        <View style={styles.inputWrapper}>
            {iconName && (
                <Ionicons
                    name={iconName}
                    size={22}
                    color={COLORS.textMuted}
                    style={styles.inputIcon}
                />
            )}
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textPlaceholder}
                keyboardType={keyboardType}
                autoCapitalize="words"
                cursorColor={COLORS.primary}
            />
        </View>
    </View>
);

// 2. Premium Dropdown (Simulating iOS Picker)
const FormDropdown = ({
    label,
    value,
    onChangeText,
    options,
    isRequired = true,
    iconName,
    placeholder = "Select an option",
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label}{" "}
                {isRequired && <Text style={styles.requiredStar}>*</Text>}
            </Text>

            <TouchableOpacity
                style={styles.inputWrapper}
                activeOpacity={0.8}
                onPress={() => setShowDropdown(true)}>
                {iconName && (
                    <Ionicons
                        name={iconName}
                        size={22}
                        color={COLORS.textMuted}
                        style={styles.inputIcon}
                    />
                )}
                <Text
                    style={[
                        styles.inputText,
                        !value && styles.inputPlaceholder,
                    ]}>
                    {value || placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={COLORS.textMuted}
                />
            </TouchableOpacity>

            <Modal
                visible={showDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDropdown(false)}>
                <TouchableWithoutFeedback
                    onPress={() => setShowDropdown(false)}>
                    <View style={styles.actionSheetOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.actionSheet}>
                                <View style={styles.actionSheetIndicator} />
                                <Text style={styles.actionSheetTitle}>
                                    Select {label}
                                </Text>
                                <FlatList
                                    data={options}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    contentContainerStyle={
                                        styles.actionSheetContent
                                    }
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.actionSheetItem,
                                                value === item &&
                                                    styles.actionSheetItemSelected,
                                            ]}
                                            onPress={() => {
                                                onChangeText(item);
                                                setShowDropdown(false);
                                            }}>
                                            <Text
                                                style={[
                                                    styles.actionSheetItemText,
                                                    value === item &&
                                                        styles.actionSheetItemSelectedText,
                                                ]}>
                                                {item}
                                            </Text>
                                            {value === item && (
                                                <Ionicons
                                                    name="checkmark"
                                                    size={22}
                                                    color={COLORS.primary}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                />
                                <TouchableOpacity
                                    style={styles.actionSheetCancel}
                                    onPress={() => setShowDropdown(false)}>
                                    <Text style={styles.actionSheetCancelText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

// --- MAIN SCREEN COMPONENT ---
export default function AddEnquiryScreen({ route, navigation }) {
    const [formData, setFormData] = useState({
        enqType: "",
        source: "",
        name: "",
        mobile: "",
        altMobile: "",
        address: "",
        product: "",
        cost: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const updateField = (field) => (text) => {
        setFormData((prev) => ({ ...prev, [field]: text }));
    };

    const handleSaveEnquiry = async () => {
        if (!formData.name || !formData.mobile || !formData.product) {
            Alert.alert(
                "Missing Information",
                "Please complete all required fields marked with *.",
            );
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                name: formData.name,
                mobile: formData.mobile,
                product: formData.product,
                enqType: formData.enqType,
                source: formData.source,
                altMobile: formData.altMobile,
                address: formData.address,
                cost: parseFloat(formData.cost) || 0,
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const newEnquiry = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Enquiry created successfully!", [
                    {
                        text: "OK",
                        onPress: () => {
                            navigation.goBack();
                            if (route.params?.onEnquirySaved) {
                                route.params.onEnquirySaved(newEnquiry);
                            }
                        },
                    },
                ]);
            } else {
                Alert.alert(
                    "Error",
                    newEnquiry.message || "Failed to save enquiry.",
                );
            }
        } catch (error) {
            Alert.alert("Error", "Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}>
                {/* --- CLEAN HEADER --- */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleCancel}
                        style={styles.headerBtn}>
                        <Ionicons
                            name="close"
                            size={28}
                            color={COLORS.textTitle}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSaveEnquiry}
                        style={styles.headerBtn}
                        disabled={isLoading}>
                        <Text style={styles.headerBtnText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">
                    {/* --- FLOATING CARD CONTAINER --- */}
                    <View style={styles.card}>
                        {/* Card Header */}
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>New Enquiry</Text>
                            <Text style={styles.cardSubtitle}>
                                Enter the lead details below to add to your
                                pipeline.
                            </Text>
                        </View>

                        {/* Form Sections */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>
                                Lead Information
                            </Text>

                            <View style={styles.rowInputs}>
                                <View style={styles.halfWidth}>
                                    <FormDropdown
                                        label="Type"
                                        value={formData.enqType}
                                        onChangeText={updateField("enqType")}
                                        options={ENQUIRY_TYPE_OPTIONS}
                                        iconName="layers-outline"
                                    />
                                </View>
                                <View style={styles.halfWidth}>
                                    <FormDropdown
                                        label="Source"
                                        value={formData.source}
                                        onChangeText={updateField("source")}
                                        options={LEAD_SOURCE_OPTIONS}
                                        iconName="people-outline"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>
                                Customer Details
                            </Text>

                            <FormInput
                                label="Full Name"
                                value={formData.name}
                                onChangeText={updateField("name")}
                                placeholder="e.g. Sarah Connor"
                                iconName="person-outline"
                            />
                            <FormInput
                                label="Mobile Number"
                                value={formData.mobile}
                                onChangeText={updateField("mobile")}
                                placeholder="10 digit number"
                                keyboardType="numeric"
                                iconName="call-outline"
                            />
                            <FormInput
                                label="Alternate Mobile"
                                value={formData.altMobile}
                                onChangeText={updateField("altMobile")}
                                placeholder="Optional"
                                keyboardType="numeric"
                                iconName="call-outline"
                                isRequired={false}
                            />
                            <FormInput
                                label="Address"
                                value={formData.address}
                                onChangeText={updateField("address")}
                                placeholder="Street address, City..."
                                iconName="location-outline"
                                isRequired={false}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>
                                Product & Value
                            </Text>

                            <FormInput
                                label="Product / Service"
                                value={formData.product}
                                onChangeText={updateField("product")}
                                placeholder="What are they interested in?"
                                iconName="cube-outline"
                            />
                            <FormInput
                                label="Estimated Value (₹)"
                                value={formData.cost}
                                onChangeText={updateField("cost")}
                                placeholder="0.00"
                                keyboardType="numeric"
                                isRequired={false}
                                iconName="cash-outline"
                            />
                        </View>

                        {/* Bottom Spacing for Scroll */}
                        <View style={{ height: 20 }} />
                    </View>

                    {/* --- PRIMARY ACTION BUTTON --- */}
                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            isLoading && styles.buttonDisabled,
                        ]}
                        onPress={handleSaveEnquiry}
                        activeOpacity={0.9}
                        disabled={isLoading}>
                        <Text style={styles.primaryButtonText}>
                            {isLoading ? "Saving..." : "Create Enquiry"}
                        </Text>
                    </TouchableOpacity>

                    {/* Extra padding for bottom scroll area */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// --- IOS PREMIUM STYLESHEET ---
const styles = StyleSheet.create({});
