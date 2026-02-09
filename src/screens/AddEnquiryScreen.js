import React, { useState, useEffect, useRef } from "react";
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
    Modal,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Dimensions,
    Animated,
    Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL as GLOBAL_API_URL } from "../services/apiConfig";

// --- CONFIGURATION ---
const API_URL = `${GLOBAL_API_URL}/enquiries`;

const ENQUIRY_TYPE_OPTIONS = ["Normal", "High", "Medium"];
const LEAD_SOURCE_OPTIONS = [
    "Friends",
    "Employee Referral",
    "Job Portal",
    "Social Media",
    "Consultancy",
    "Company Website",
];

// --- NEW THEME: VIBRANT CLAY ---
const THEME = {
    bg: "#F8F9FC", // Very light grey/white
    surface: "#FFFFFF",

    primary: "#6366F1", // Indigo
    accent: "#EC4899", // Pink
    gradientStart: "#8B5CF6", // Violet
    gradientEnd: "#EC4899", // Pink

    textMain: "#1E293B", // Dark Slate
    textSec: "#64748B", // Grey
    textLight: "#94A3B8", // Light Grey

    shadowColorPrimary: "rgba(99, 102, 241, 0.4)",
    shadowColorAccent: "rgba(236, 72, 153, 0.4)",

    border: "#E2E8F0",
};

// --- ANIMATED BACKGROUND COMPONENT ---
const ClayBackground = () => {
    const spinValue = useRef(new Animated.Value(0)).current;
    const moveValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 20000,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(moveValue, {
                    toValue: 20,
                    duration: 4000,
                    useNativeDriver: true,
                }),
                Animated.timing(moveValue, {
                    toValue: -20,
                    duration: 4000,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View style={StyleSheet.absoluteFillObject}>
            <View style={StyleSheet.absoluteFillObject} />

            {/* Animated Blob 1 */}
            <Animated.View
                style={[
                    styles.blobLarge,
                    {
                        top: -100,
                        right: -100,
                        backgroundColor: "rgba(139, 92, 246, 0.15)", // Violet tint
                        transform: [{ rotate: spin }],
                    },
                ]}
            />

            {/* Animated Blob 2 */}
            <Animated.View
                style={[
                    styles.blobMedium,
                    {
                        bottom: -50,
                        left: -50,
                        backgroundColor: "rgba(236, 72, 153, 0.15)", // Pink tint
                        transform: [{ translateY: moveValue }],
                    },
                ]}
            />

            {/* Pattern overlay */}
            <View style={styles.gridPattern} />
        </View>
    );
};

// --- COMPONENT: CLAY INPUT (Card Style) ---
const ClayInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    iconName,
    keyboardType,
    style,
}) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={[styles.inputCard, style]}>
            <View style={styles.inputHeader}>
                <Ionicons
                    name={iconName}
                    size={20}
                    color={focused ? THEME.primary : THEME.textSec}
                />
                <Text
                    style={[
                        styles.inputLabel,
                        { color: focused ? THEME.primary : THEME.textMain },
                    ]}>
                    {label}
                </Text>
            </View>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={THEME.textLight}
                keyboardType={keyboardType}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={styles.textInput}
                cursorColor={THEME.primary}
            />
        </View>
    );
};

// --- COMPONENT: CLAY DROPDOWN ---
const ClayDropdown = ({ label, value, onSelect, options, iconName }) => {
    const [show, setShow] = useState(false);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShow(true)}
            style={[
                styles.inputCard,
                value ? styles.activeCard : null,
                { justifyContent: "center", height: 70 },
            ]}>
            <View style={styles.inputHeader}>
                <Ionicons
                    name={iconName}
                    size={20}
                    color={value ? THEME.primary : THEME.textSec}
                />
                <Text
                    style={[
                        styles.inputLabel,
                        { color: value ? THEME.primary : THEME.textMain },
                    ]}>
                    {label}
                </Text>
            </View>

            <View style={styles.dropdownValueContainer}>
                <Text style={styles.dropdownText}>
                    {value || "Select Option"}
                </Text>
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={THEME.textLight}
                />
            </View>

            <Modal
                visible={show}
                transparent
                animationType="fade"
                onRequestClose={() => setShow(false)}>
                <TouchableWithoutFeedback onPress={() => setShow(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.sheetContainer}>
                                <View style={styles.sheetHandle} />
                                <Text style={styles.sheetTitle}>{label}</Text>
                                <ScrollView bounces={false}>
                                    {options.map((opt, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={styles.sheetOption}
                                            onPress={() => {
                                                onSelect(opt);
                                                setShow(false);
                                            }}>
                                            <Text
                                                style={[
                                                    styles.sheetOptionText,
                                                    {
                                                        color:
                                                            value === opt
                                                                ? THEME.primary
                                                                : THEME.textMain,
                                                    },
                                                ]}>
                                                {opt}
                                            </Text>
                                            {value === opt && (
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={22}
                                                    color={THEME.primary}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </TouchableOpacity>
    );
};

// --- MAIN SCREEN ---
export default function AddEnquiryScreen({ route, navigation }) {
    const [form, setForm] = useState({
        enqType: "",
        source: "",
        name: "",
        mobile: "",
        altMobile: "",
        address: "",
        product: "",
        cost: "",
    });
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Animation for Accordion
    const heightAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(heightAnim, {
            toValue: expanded ? 1 : 0,
            duration: 300,
            useNativeDriver: false, // Height requires false
        }).start();

        Animated.timing(rotateAnim, {
            toValue: expanded ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [expanded]);

    const update = (field) => (val) => setForm((p) => ({ ...p, [field]: val }));

    const submit = async () => {
        if (!form.name || !form.mobile || !form.product)
            return Alert.alert(
                "Required",
                "Please fill Name, Mobile and Product.",
            );

        setLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, cost: Number(form.cost) || 0 }),
            });
            const data = await res.json();
            if (res.ok) {
                Alert.alert("Success", "Enquiry added!", [
                    {
                        text: "Great!",
                        onPress: () => {
                            navigation.goBack();
                            route.params?.onEnquirySaved?.(data);
                        },
                    },
                ]);
            } else {
                Alert.alert("Error", data.message || "Failed.");
            }
        } catch (e) {
            Alert.alert("Network", "Connection error.");
        } finally {
            setLoading(false);
        }
    };

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />

            <ClayBackground />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}>
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={THEME.textMain}
                        />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>New Lead</Text>
                        <View style={styles.headerDot} />
                    </View>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    {/* Intro Card */}
                    <View style={styles.introCard}>
                        <LinearGradient
                            colors={[THEME.gradientStart, THEME.gradientEnd]}
                            style={styles.introGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}>
                            <View style={styles.introContent}>
                                <View style={styles.introIconBox}>
                                    <Ionicons
                                        name="person-add"
                                        size={28}
                                        color="#FFF"
                                    />
                                </View>
                                <View>
                                    <Text style={styles.introTitle}>
                                        Create Enquiry
                                    </Text>
                                    <Text style={styles.introSub}>
                                        Enter details to proceed
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Dropdowns Row */}
                    <View style={styles.row}>
                        <ClayDropdown
                            label="Priority"
                            value={form.enqType}
                            onSelect={update("enqType")}
                            options={ENQUIRY_TYPE_OPTIONS}
                            iconName="flag"
                        />
                        <ClayDropdown
                            label="Source"
                            value={form.source}
                            onSelect={update("source")}
                            options={LEAD_SOURCE_OPTIONS}
                            iconName="people"
                        />
                    </View>

                    {/* Main Inputs */}
                    <ClayInput
                        label="Full Name"
                        value={form.name}
                        onChangeText={update("name")}
                        placeholder="e.g. John Doe"
                        iconName="person"
                    />
                    <ClayInput
                        label="Mobile Number"
                        value={form.mobile}
                        onChangeText={update("mobile")}
                        placeholder="e.g. 98765 43210"
                        keyboardType="phone-pad"
                        iconName="call"
                    />
                    <ClayInput
                        label="Product / Service"
                        value={form.product}
                        onChangeText={update("product")}
                        placeholder="e.g. Premium Plan"
                        iconName="cube"
                    />

                    {/* Expandable Accordion */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setExpanded(!expanded)}
                        style={styles.accordionTrigger}>
                        <View style={styles.accordionLeft}>
                            <View
                                style={[
                                    styles.iconCircle,
                                    {
                                        backgroundColor: expanded
                                            ? "rgba(236, 72, 153, 0.1)"
                                            : "#F1F5F9",
                                    },
                                ]}>
                                <Ionicons
                                    name={
                                        expanded
                                            ? "options"
                                            : "ellipsis-horizontal-circle"
                                    }
                                    size={20}
                                    color={
                                        expanded ? THEME.accent : THEME.textSec
                                    }
                                />
                            </View>
                            <Text style={styles.accordionText}>
                                More Details
                            </Text>
                        </View>
                        <Animated.View
                            style={{
                                transform: [{ rotate: rotateInterpolate }],
                            }}>
                            <Ionicons
                                name="chevron-down"
                                size={24}
                                color={THEME.textSec}
                            />
                        </Animated.View>
                    </TouchableOpacity>

                    <Animated.View
                        style={[
                            styles.accordionContent,
                            {
                                height: heightAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 350], // Max height estimate
                                }),
                                opacity: heightAnim,
                            },
                        ]}>
                        <ClayInput
                            label="Alt Mobile"
                            value={form.altMobile}
                            onChangeText={update("altMobile")}
                            placeholder="Optional"
                            keyboardType="phone-pad"
                            iconName="call-outline"
                        />
                        <ClayInput
                            label="Address"
                            value={form.address}
                            onChangeText={update("address")}
                            placeholder="City, State"
                            iconName="location-outline"
                        />
                        <ClayInput
                            label="Estimated Value"
                            value={form.cost}
                            onChangeText={update("cost")}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            iconName="cash"
                        />
                    </Animated.View>

                    <View style={{ height: 20 }} />
                </ScrollView>

                {/* Sticky Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={submit}
                        activeOpacity={0.85}
                        disabled={loading}
                        style={styles.btnContainer}>
                        <LinearGradient
                            colors={[THEME.gradientStart, THEME.gradientEnd]}
                            style={styles.btnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View style={styles.btnContent}>
                                    <Text style={styles.btnText}>
                                        Save Enquiry
                                    </Text>
                                    <Ionicons
                                        name="rocket"
                                        size={20}
                                        color="#fff"
                                        style={{ marginLeft: 8 }}
                                    />
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
        marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 10,
    },

    // Background Shapes
    blobLarge: {
        position: "absolute",
        width: 400,
        height: 400,
        borderRadius: 200,
    },
    blobMedium: {
        position: "absolute",
        width: 250,
        height: 250,
        borderRadius: 125,
    },
    gridPattern: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.4,
        backgroundColor: "transparent",
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", // Simple dot simulation not native, handled by opacity above
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#FFF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: THEME.border,
    },
    headerTitleContainer: { flexDirection: "row", alignItems: "center" },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: THEME.textMain,
        letterSpacing: -0.5,
    },
    headerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: THEME.accent,
        marginLeft: 8,
    },

    // Scroll
    scrollContent: { padding: 20, paddingTop: 10 },

    // Intro Card
    introCard: { marginBottom: 24, borderRadius: 24, overflow: "hidden" },
    introGradient: { padding: 20 },
    introContent: { flexDirection: "row", alignItems: "center" },
    introIconBox: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    introTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },
    introSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },

    // Row
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    rowView: { width: "48%" }, // Helper for children

    // Cards & Inputs
    inputCard: {
        backgroundColor: THEME.surface,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: THEME.border,
        // Clay Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    activeCard: {
        borderColor: THEME.primary,
        shadowColor: THEME.primary,
        shadowOpacity: 0.15,
    },
    inputHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: "700",
        marginLeft: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    textInput: {
        fontSize: 16,
        color: THEME.textMain,
        fontWeight: "500",
        paddingLeft: 28, // Align with icon space
        paddingVertical: 4,
    },
    dropdownValueContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 28,
        marginTop: 4,
    },
    dropdownText: { fontSize: 16, color: THEME.textLight, fontWeight: "500" },

    // Accordion
    accordionTrigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: THEME.surface,
        padding: 16,
        borderRadius: 20,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    accordionLeft: { flexDirection: "row", alignItems: "center" },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    accordionText: { fontSize: 15, fontWeight: "600", color: THEME.textMain },
    accordionContent: { overflow: "hidden", marginTop: 8, marginBottom: 16 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(30, 41, 59, 0.4)",
        justifyContent: "flex-end",
    },
    sheetContainer: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: 30,
        paddingTop: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 20,
        maxHeight: "70%",
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: THEME.border,
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 15,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: THEME.textMain,
        marginLeft: 24,
        marginBottom: 10,
    },
    sheetOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    sheetOptionText: { fontSize: 16, fontWeight: "500" },

    // Button
    footer: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === "ios" ? 25 : 20,
        backgroundColor: "transparent",
    },
    btnContainer: { width: "100%" },
    btnGradient: {
        borderRadius: 20,
        paddingVertical: 18,
        // Unique colored shadow
        shadowColor: THEME.gradientEnd,
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 15,
        elevation: 10,
    },
    btnContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    btnText: { color: "#FFF", fontSize: 17, fontWeight: "700" },
});
