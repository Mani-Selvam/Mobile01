import React, { useState, useEffect } from "react";
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
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as followupService from "../services/followupService";

const { width } = Dimensions.get("window");

// --- THEME ---
const THEME = {
    bgBase: "#0F172A",
    bgCard: "rgba(30, 41, 59, 0.7)",
    bgInput: "#1E293B",
    primary: "#8B5CF6",
    primaryDark: "#7C3AED",
    secondary: "#06B6D4",
    textMain: "#F8FAFC",
    textMuted: "#94A3B8",
    textLight: "#64748B",
    border: "rgba(255, 255, 255, 0.1)",
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
};

// --- STYLES ---
const glassStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bgBase,
    },
    headerContainer: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: THEME.bgCard,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: THEME.textMain,
    },
    iconBtnSmall: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        justifyContent: "center",
        alignItems: "center",
    },
    formScroll: {
        flex: 1,
        backgroundColor: THEME.bgBase,
    },
    formContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: THEME.textMuted,
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    autoFillRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        backgroundColor: THEME.bgCard,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    avatarBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "700",
        color: THEME.textMain,
    },
    autoName: {
        fontSize: 15,
        fontWeight: "600",
        color: THEME.textMain,
    },
    autoMeta: {
        fontSize: 12,
        color: THEME.textLight,
        marginTop: 4,
    },
    rowInputs: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    inputHalf: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: THEME.textMuted,
        marginBottom: 8,
    },
    input: {
        backgroundColor: THEME.bgInput,
        borderWidth: 1,
        borderColor: THEME.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: THEME.textMain,
        fontSize: 14,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: THEME.bgCard,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    chipActive: {
        backgroundColor: THEME.primary,
        borderColor: THEME.primary,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "500",
        color: THEME.textMuted,
    },
    chipTextActive: {
        color: "#fff",
    },
    chipSmall: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: THEME.bgCard,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    chipTextSmall: {
        fontSize: 11,
        fontWeight: "500",
        color: THEME.textMuted,
    },
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    switch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
    },
    switchOn: {
        backgroundColor: THEME.success,
        borderColor: THEME.success,
    },
    switchOff: {
        backgroundColor: THEME.bgCard,
        borderColor: THEME.border,
    },
    switchText: {
        fontSize: 10,
        fontWeight: "700",
        color: THEME.textMain,
    },
    stickyFooter: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 24,
        backgroundColor: THEME.bgBase,
        borderTopWidth: 1,
        borderTopColor: THEME.border,
    },
    cancelBtn: {
        flex: 0.4,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: THEME.bgCard,
        borderWidth: 1,
        borderColor: THEME.border,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: THEME.textMuted,
    },
    saveBtn: {
        flex: 0.6,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: THEME.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    saveBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#fff",
    },
    saveNextBtn: {
        flex: 0.3,
        backgroundColor: THEME.secondary,
    },
});

// --- MAIN COMPONENT ---
export default function AddFollowUpScreen({
    selectedEnquiry,
    onBack,
    onSuccess,
}) {
    const [followUpForm, setFollowUpForm] = useState({
        date: new Date().toISOString().split("T")[0],
        time: "",
        type: "WhatsApp",
        remarks: "",
        nextAction: "Followup",
        isNextRequired: false,
        nextDate: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveFollowUp = async (addNext = false) => {
        if (!followUpForm.remarks) {
            return Alert.alert("Required", "Enter discussion points");
        }
        if (followUpForm.isNextRequired && !followUpForm.nextDate) {
            return Alert.alert("Required", "Select next date");
        }

        setIsLoading(true);
        try {
            const payload = {
                ...followUpForm,
                enqNo: selectedEnquiry.enqNo,
                name: selectedEnquiry.name,
            };
            await followupService.createFollowUp(payload);

            if (addNext) {
                Alert.alert("Success", "Saved. Ready for next.");
                setFollowUpForm((prev) => ({
                    ...prev,
                    remarks: "",
                    time: "",
                    nextAction: "Interested",
                    isNextRequired: false,
                    nextDate: "",
                }));
            } else {
                Alert.alert("Success", "Follow-up saved!");
                onSuccess?.();
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not save follow-up");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={glassStyles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={THEME.bgBase}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}>
                {/* Header */}
                <View style={glassStyles.headerContainer}>
                    <View style={glassStyles.header}>
                        <View style={glassStyles.headerLeft}>
                            <TouchableOpacity
                                onPress={onBack}
                                style={glassStyles.iconBtnSmall}>
                                <Ionicons
                                    name="arrow-back"
                                    size={22}
                                    color={THEME.textMain}
                                />
                            </TouchableOpacity>
                            <Text style={glassStyles.headerTitle}>
                                New Follow-up
                            </Text>
                        </View>
                    </View>
                </View>

                <ScrollView
                    style={glassStyles.formScroll}
                    contentContainerStyle={glassStyles.formContent}
                    keyboardShouldPersistTaps="handled">
                    {/* Auto-filled Card */}
                    <View style={glassStyles.section}>
                        <Text style={glassStyles.sectionTitle}>
                            Enquiry Info
                        </Text>
                        <View style={glassStyles.autoFillRow}>
                            <View
                                style={[
                                    glassStyles.avatarBox,
                                    { backgroundColor: THEME.bgInput },
                                ]}>
                                <Text style={glassStyles.avatarText}>
                                    {selectedEnquiry?.name
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={glassStyles.autoName}>
                                    {selectedEnquiry?.name}
                                </Text>
                                <Text style={glassStyles.autoMeta}>
                                    {selectedEnquiry?.mobile} •{" "}
                                    {selectedEnquiry?.product}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Inputs */}
                    <View style={glassStyles.section}>
                        <Text style={glassStyles.sectionTitle}>Details</Text>

                        <View style={glassStyles.rowInputs}>
                            <View style={glassStyles.inputHalf}>
                                <Text style={glassStyles.inputLabel}>Date</Text>
                                <TextInput
                                    style={glassStyles.input}
                                    value={followUpForm.date}
                                    onChangeText={(t) =>
                                        setFollowUpForm({
                                            ...followUpForm,
                                            date: t,
                                        })
                                    }
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>
                            <View style={glassStyles.inputHalf}>
                                <Text style={glassStyles.inputLabel}>Time</Text>
                                <TextInput
                                    style={glassStyles.input}
                                    value={followUpForm.time}
                                    onChangeText={(t) =>
                                        setFollowUpForm({
                                            ...followUpForm,
                                            time: t,
                                        })
                                    }
                                    placeholder="HH:MM"
                                />
                            </View>
                        </View>

                        <Text style={glassStyles.inputLabel}>Type</Text>
                        <View style={glassStyles.chipRow}>
                            {["WhatsApp", "Visit"].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        glassStyles.chip,
                                        followUpForm.type === type &&
                                            glassStyles.chipActive,
                                    ]}
                                    onPress={() =>
                                        setFollowUpForm({
                                            ...followUpForm,
                                            type: type,
                                        })
                                    }>
                                    <Text
                                        style={[
                                            glassStyles.chipText,
                                            followUpForm.type === type &&
                                                glassStyles.chipTextActive,
                                        ]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={glassStyles.inputLabel}>
                            Discussion Points
                        </Text>
                        <TextInput
                            style={[glassStyles.input, glassStyles.textArea]}
                            value={followUpForm.remarks}
                            onChangeText={(t) =>
                                setFollowUpForm({
                                    ...followUpForm,
                                    remarks: t,
                                })
                            }
                            placeholder="What was discussed?"
                            multiline
                            textAlignVertical="top"
                        />

                        <Text style={glassStyles.inputLabel}>Outcome</Text>
                        <View style={glassStyles.chipRow}>
                            {["Followup", "Sales", "Drop"].map((action) => (
                                <TouchableOpacity
                                    key={action}
                                    style={[
                                        glassStyles.chipSmall,
                                        followUpForm.nextAction === action &&
                                            glassStyles.chipActive,
                                    ]}
                                    onPress={() =>
                                        setFollowUpForm({
                                            ...followUpForm,
                                            nextAction: action,
                                        })
                                    }>
                                    <Text
                                        style={[
                                            glassStyles.chipTextSmall,
                                            followUpForm.nextAction ===
                                                action &&
                                                glassStyles.chipTextActive,
                                        ]}>
                                        {action}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={glassStyles.switchRow}>
                            <Text style={glassStyles.inputLabel}>
                                Schedule Next?
                            </Text>
                            <TouchableOpacity
                                style={[
                                    glassStyles.switch,
                                    followUpForm.isNextRequired
                                        ? glassStyles.switchOn
                                        : glassStyles.switchOff,
                                ]}
                                onPress={() =>
                                    setFollowUpForm({
                                        ...followUpForm,
                                        isNextRequired:
                                            !followUpForm.isNextRequired,
                                    })
                                }>
                                <Text style={glassStyles.switchText}>
                                    {followUpForm.isNextRequired ? "ON" : "OFF"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {followUpForm.isNextRequired && (
                            <View style={{ marginTop: 10 }}>
                                <Text style={glassStyles.inputLabel}>
                                    Next Date
                                </Text>
                                <TextInput
                                    style={glassStyles.input}
                                    value={followUpForm.nextDate}
                                    onChangeText={(t) =>
                                        setFollowUpForm({
                                            ...followUpForm,
                                            nextDate: t,
                                        })
                                    }
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>
                        )}
                    </View>

                    <View style={{ height: 20 }} />
                </ScrollView>

                <View style={glassStyles.stickyFooter}>
                    <TouchableOpacity
                        style={glassStyles.cancelBtn}
                        onPress={onBack}
                        disabled={isLoading}>
                        <Text style={glassStyles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={glassStyles.saveBtn}
                        onPress={() => handleSaveFollowUp(false)}
                        disabled={isLoading}>
                        <Text style={glassStyles.saveBtnText}>
                            {isLoading ? "Saving..." : "Save"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[glassStyles.saveBtn, glassStyles.saveNextBtn]}
                        onPress={() => handleSaveFollowUp(true)}
                        disabled={isLoading}>
                        <Ionicons name="add" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
