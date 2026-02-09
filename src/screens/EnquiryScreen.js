import React, { useState, useEffect, useRef } from "react";
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
    ActivityIndicator,
    Dimensions,
    StatusBar,
    Animated,
    Easing,
    Platform,
    Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as enquiryService from "../services/enquiryService";
import { API_URL as GLOBAL_API_URL } from "../services/apiConfig";

// --- CONFIGURATION ---
const API_URL = `${GLOBAL_API_URL}/enquiries`;
const { width, height } = Dimensions.get("window");

const ENQUIRY_TYPE_OPTIONS = ["Normal", "High", "Medium"];
const LEAD_SOURCE_OPTIONS = [
    "Friends",
    "Employee Referral",
    "Job Portal",
    "Social Media",
    "Consultancy",
    "Company Website",
];

// --- THEME: SOFT MODERN (OPTIMIZED) ---
const COLORS = {
    bgApp: "#F1F5F9", // Slightly darker than pure white for contrast
    bgCard: "#FFFFFF",

    primary: "#6366F1", // Indigo
    primaryLight: "#EEF2FF",

    secondary: "#EC4899", // Pink

    textMain: "#1E293B",
    textMuted: "#64748B",
    textLight: "#94A3B8",

    border: "#F1F5F9",

    // Status
    statusNew: { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" },
    statusProgress: { bg: "#FEF9C3", text: "#854D0E", border: "#FDE047" },
    statusConverted: { bg: "#F3E8FF", text: "#6B21A8", border: "#D8B4FE" },
    statusClosed: { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" },
    // gentle card variants for visually distinguishing items
    cardVariants: ["#FFFFFF", "#FBFBFF", "#FFFBF0", "#F7FFF9", "#F5F8FF"],
};

// --- ANIMATION HOOK ---
const useFadeIn = (delay = 0) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(15)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                delay: delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay: delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }),
        ]).start();
    }, []);

    return { opacity, translateY };
};

// Helper: format a Date or date-string to local YYYY-MM-DD (avoids UTC shifts)
const toLocalIso = (d) => {
    const date = d ? new Date(d) : new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

// --- REDESIGNED LIST ITEM (COMPACT) ---
const CompactCard = ({
    item,
    index,
    onShowDetails,
    onEdit,
    onDelete,
    onFollowUp,
    onCall,
    onWhatsApp,
}) => {
    const { opacity, translateY } = useFadeIn(index * 30);
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () =>
        Animated.spring(scaleValue, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    const handlePressOut = () =>
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();

    const initials = item.name ? item.name.substring(0, 2).toUpperCase() : "NA";
    const bgColor = COLORS.cardVariants[index % COLORS.cardVariants.length];
    // derive a display date for the card (createdAt/date/enqDate or from ObjectId)
    const getItemDate = (it) => {
        if (!it) return null;
        if (it.createdAt) return toLocalIso(it.createdAt);
        if (it.date) return toLocalIso(it.date);
        if (it.enqDate) return toLocalIso(it.enqDate);
        if (it._id && it._id.length >= 8) {
            try {
                const hex = it._id.substring(0, 8);
                const ts = parseInt(hex, 16) * 1000;
                return toLocalIso(new Date(ts));
            } catch (e) {
                return null;
            }
        }
        return null;
    };
    const rawDate = getItemDate(item);
    const dateLabel = rawDate ? new Date(rawDate).toLocaleDateString() : "";

    return (
        <Animated.View
            style={[
                styles.cardWrapper,
                { opacity, transform: [{ translateY }, { scale: scaleValue }] },
            ]}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => onShowDetails(item)}
                style={[styles.card, { backgroundColor: bgColor }]}>
                {/* Top Section: Avatar, Name, Status */}
                <View style={styles.cardTopRow}>
                    <View style={styles.avatarSmall}>
                        <Text style={styles.avatarTextSmall}>{initials}</Text>
                    </View>
                    <View style={styles.nameBlock}>
                        <Text style={styles.cardName} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={styles.cardMeta}>
                            {item.enqNo || `ID: ${item._id?.substr(-4)}`}
                        </Text>
                        {dateLabel ? (
                            <Text style={styles.cardDate}>{dateLabel}</Text>
                        ) : null}
                    </View>
                    {/* status removed per user request */}
                </View>

                {/* Middle Section: Product Info */}
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons
                            name="cube-outline"
                            size={14}
                            color={COLORS.textLight}
                        />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {item.product}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons
                            name="call-outline"
                            size={14}
                            color={COLORS.textLight}
                        />
                        <Text style={styles.infoText}>{item.mobile}</Text>
                    </View>
                </View>

                {/* Bottom Section: Action Strip */}
                <View style={styles.actionStrip}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onCall(item.mobile)}>
                        <Ionicons name="call" size={18} color="#10B981" />
                        <Text style={styles.actionBtnText}>Call</Text>
                    </TouchableOpacity>
                    <View style={styles.actionDivider} />
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onWhatsApp(item.mobile)}>
                        <Ionicons
                            name="logo-whatsapp"
                            size={18}
                            color="#25D366"
                        />
                        <Text style={styles.actionBtnText}>Chat</Text>
                    </TouchableOpacity>
                    <View style={styles.actionDivider} />
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onEdit(item)}>
                        <Ionicons
                            name="create-outline"
                            size={18}
                            color={COLORS.primary}
                        />
                        <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <View style={styles.actionDivider} />
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onFollowUp(item)}>
                        <MaterialIcons
                            name="follow-the-signs"
                            size={18}
                            color={COLORS.primary}
                        />
                        <Text style={styles.actionBtnText}>Follow</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- MAIN SCREEN ---
export default function EnquiryListScreen({ navigation }) {
    const [enquiries, setEnquiries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [detailsModal, setDetailsModal] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [userName, setUserName] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // FAB Animation
    const fabScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        fetchEnquiries();
        const unsubscribe = navigation.addListener("focus", () =>
            fetchEnquiries(),
        );
        // load logged-in user name from storage
        const loadUser = async () => {
            try {
                const u = await AsyncStorage.getItem("user");
                if (u) {
                    const parsed = JSON.parse(u);
                    setUserName(
                        parsed.name ||
                            parsed.fullName ||
                            parsed.username ||
                            null,
                    );
                    // default to today (local date)
                    setSelectedDate(toLocalIso(new Date()));
                }
            } catch (err) {
                console.warn("Error loading user from storage:", err);
            }
        };
        loadUser();
        return unsubscribe;
    }, [navigation]);

    const animateFab = () => {
        Animated.sequence([
            Animated.timing(fabScale, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(fabScale, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const fetchEnquiries = async () => {
        try {
            const data = await enquiryService.getAllEnquiries();
            setEnquiries(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setIsLoading(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert("Delete Enquiry", "This action cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
                    setEnquiries(enquiries.filter((e) => e._id !== id));
                },
            },
        ]);
    };

    const handleShowDetails = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setDetailsModal(true);
    };

    const handleCallEnquiry = (phone) =>
        phone && Linking.openURL(`tel:${phone}`);
    const handleWhatsApp = (phone) => {
        if (!phone) return;
        Linking.openURL(
            `whatsapp://send?phone=${phone.replace(/\D/g, "")}`,
        ).catch(() => Alert.alert("Error", "WhatsApp not installed"));
    };
    const handleEditEnquiry = (enquiry) =>
        navigation.navigate("AddEnquiry", { enquiry });
    const handleAddFollowUp = (enquiry) =>
        Alert.alert("Follow Up", `Start follow-up for ${enquiry.name}?`);

    const filteredData = enquiries.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.mobile.includes(searchQuery);
        if (!selectedDate) return matchesSearch;
        // determine item date: createdAt, date, or derive from ObjectId (local ISO)
        const getItemDate = (it) => {
            if (!it) return null;
            if (it.createdAt) return toLocalIso(it.createdAt);
            if (it.date) return toLocalIso(it.date);
            if (it.enqDate) return toLocalIso(it.enqDate);
            // derive from Mongo ObjectId if possible
            if (it._id && it._id.length >= 8) {
                try {
                    const hex = it._id.substring(0, 8);
                    const ts = parseInt(hex, 16) * 1000;
                    return toLocalIso(new Date(ts));
                } catch (e) {
                    return null;
                }
            }
            return null;
        };

        const itemDate = getItemDate(item);
        return matchesSearch && itemDate === selectedDate;
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgApp} />

            {/* MODAL */}
            <Modal
                visible={detailsModal}
                transparent
                animationType="fade"
                onRequestClose={() => setDetailsModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Details</Text>
                            <TouchableOpacity
                                onPress={() => setDetailsModal(false)}>
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color={COLORS.textMain}
                                />
                            </TouchableOpacity>
                        </View>
                        {selectedEnquiry && (
                            <ScrollView
                                contentContainerStyle={styles.modalBody}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.dLabel}>Name</Text>
                                    <Text style={styles.dValue}>
                                        {selectedEnquiry.name}
                                    </Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.dLabel}>Mobile</Text>
                                    <Text style={styles.dValue}>
                                        {selectedEnquiry.mobile}
                                    </Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.dLabel}>Product</Text>
                                    <Text style={styles.dValue}>
                                        {selectedEnquiry.product}
                                    </Text>
                                </View>
                                {/* status hidden per user request */}
                                {selectedEnquiry.cost && (
                                    <View style={styles.detailItem}>
                                        <Text style={styles.dLabel}>Cost</Text>
                                        <Text style={styles.dValue}>
                                            ₹{selectedEnquiry.cost}
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[
                                    styles.mBtn,
                                    { backgroundColor: "#10B981" },
                                ]}
                                onPress={() =>
                                    handleCallEnquiry(selectedEnquiry?.mobile)
                                }>
                                <Ionicons
                                    name="call"
                                    color="#fff"
                                    size={20}
                                    style={{ marginRight: 5 }}
                                />
                                <Text style={styles.mBtnText}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.mBtn,
                                    { backgroundColor: "#25D366" },
                                ]}
                                onPress={() =>
                                    handleWhatsApp(selectedEnquiry?.mobile)
                                }>
                                <Ionicons
                                    name="logo-whatsapp"
                                    color="#fff"
                                    size={20}
                                    style={{ marginRight: 5 }}
                                />
                                <Text style={styles.mBtnText}>WhatsApp</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* HEADER AREA */}
            <View style={styles.headerSection}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.headerTitle}>
                            {userName ? userName : "Leads Manager"}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.notifIcon}>
                        <Ionicons
                            name="notifications-outline"
                            size={22}
                            color={COLORS.textMain}
                        />
                        <View style={styles.notifDot} />
                    </TouchableOpacity>
                </View>

                {/* SEARCH */}
                <View style={styles.searchBar}>
                    <Ionicons
                        name="search"
                        size={18}
                        color={COLORS.textLight}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor={COLORS.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity
                        onPress={() => setDatePickerVisible(true)}
                        style={styles.calendarBtn}
                        accessibilityLabel="Select date">
                        <Ionicons
                            name="calendar"
                            size={20}
                            color={COLORS.primary}
                        />
                    </TouchableOpacity>
                </View>

                {/* filters removed per user request */}
            </View>

            {/* LIST */}
            <FlatList
                data={filteredData}
                keyExtractor={(item) =>
                    item._id?.toString() || item.id?.toString()
                }
                renderItem={({ item, index }) => (
                    <CompactCard
                        item={item}
                        index={index}
                        onShowDetails={handleShowDetails}
                        onEdit={handleEditEnquiry}
                        onDelete={handleDelete}
                        onFollowUp={handleAddFollowUp}
                        onCall={handleCallEnquiry}
                        onWhatsApp={handleWhatsApp}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshing={isLoading}
                onRefresh={fetchEnquiries}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="file-tray-outline"
                            size={50}
                            color={COLORS.textLight}
                        />
                        <Text style={styles.emptyText}>No enquiries found</Text>
                    </View>
                }
            />

            <Animated.View style={{ transform: [{ scale: fabScale }] }}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => {
                        animateFab();
                        navigation.navigate("AddEnquiry", {
                            onEnquirySaved: fetchEnquiries,
                        });
                    }}>
                    <Ionicons name="add" size={26} color="#FFF" />
                </TouchableOpacity>
            </Animated.View>

            {/* DATE PICKER MODAL (calendar grid) */}
            <Modal
                visible={datePickerVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setDatePickerVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalCard,
                            { width: "92%", maxHeight: "75%" },
                        ]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => {
                                    const y = calendarMonth.getFullYear();
                                    const m = calendarMonth.getMonth();
                                    setCalendarMonth(new Date(y, m - 1, 1));
                                }}>
                                <Ionicons
                                    name="chevron-back"
                                    size={22}
                                    color={COLORS.textMain}
                                />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {calendarMonth.toLocaleString(undefined, {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    const y = calendarMonth.getFullYear();
                                    const m = calendarMonth.getMonth();
                                    setCalendarMonth(new Date(y, m + 1, 1));
                                }}>
                                <Ionicons
                                    name="chevron-forward"
                                    size={22}
                                    color={COLORS.textMain}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{ padding: 12 }}>
                            <TouchableOpacity
                                style={[
                                    styles.filterPill,
                                    { marginBottom: 10 },
                                ]}
                                onPress={() => {
                                    setSelectedDate(null);
                                    setDatePickerVisible(false);
                                }}>
                                <Text
                                    style={[
                                        styles.filterText,
                                        { color: COLORS.textMain },
                                    ]}>
                                    Show All Dates
                                </Text>
                            </TouchableOpacity>

                            {/* Weekday labels (Mon..Sun) */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    paddingHorizontal: 6,
                                    marginBottom: 8,
                                }}>
                                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(
                                    (d) => (
                                        <Text
                                            key={d}
                                            style={{
                                                width: (width * 0.92 - 24) / 7,
                                                textAlign: "center",
                                                color: COLORS.textMuted,
                                                fontWeight: "700",
                                            }}>
                                            {d}
                                        </Text>
                                    ),
                                )}
                            </View>

                            {/* Calendar grid */}
                            {(() => {
                                const y = calendarMonth.getFullYear();
                                const m = calendarMonth.getMonth();
                                // start with Monday as first column
                                const firstDayIndex =
                                    (new Date(y, m, 1).getDay() + 6) % 7; // 0..6
                                const daysInMonth = new Date(
                                    y,
                                    m + 1,
                                    0,
                                ).getDate();
                                const prevMonthDays = new Date(
                                    y,
                                    m,
                                    0,
                                ).getDate();
                                const cells = [];
                                for (let i = 0; i < 42; i++) {
                                    const dayNum = i - firstDayIndex + 1;
                                    let inMonth = true;
                                    let display = dayNum;
                                    let cellDate = null;
                                    if (dayNum <= 0) {
                                        inMonth = false;
                                        display = prevMonthDays + dayNum;
                                    } else if (dayNum > daysInMonth) {
                                        inMonth = false;
                                        display = dayNum - daysInMonth;
                                    } else {
                                        cellDate = new Date(y, m, dayNum);
                                    }

                                    const iso = cellDate
                                        ? toLocalIso(cellDate)
                                        : null;
                                    const isSelected =
                                        iso && selectedDate === iso;

                                    cells.push(
                                        <TouchableOpacity
                                            key={`c-${i}`}
                                            disabled={!inMonth}
                                            onPress={() => {
                                                if (!inMonth) return;
                                                const isoSel = toLocalIso(
                                                    new Date(y, m, display),
                                                );
                                                setSelectedDate(isoSel);
                                                setDatePickerVisible(false);
                                            }}
                                            style={{
                                                width: (width * 0.92 - 24) / 7,
                                                height: 44,
                                                justifyContent: "center",
                                                alignItems: "center",
                                                marginBottom: 6,
                                            }}>
                                            <View
                                                style={
                                                    isSelected
                                                        ? {
                                                              width: 36,
                                                              height: 36,
                                                              borderRadius: 18,
                                                              backgroundColor:
                                                                  "#111",
                                                              justifyContent:
                                                                  "center",
                                                              alignItems:
                                                                  "center",
                                                          }
                                                        : {}
                                                }>
                                                <Text
                                                    style={
                                                        isSelected
                                                            ? {
                                                                  color: "#fff",
                                                                  fontWeight:
                                                                      "800",
                                                              }
                                                            : {
                                                                  color: inMonth
                                                                      ? COLORS.textMain
                                                                      : COLORS.textLight,
                                                              }
                                                    }>
                                                    {display}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>,
                                    );
                                }

                                // render rows of 7
                                const rows = [];
                                for (let r = 0; r < 6; r++) {
                                    rows.push(
                                        <View
                                            key={`r-${r}`}
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                paddingHorizontal: 6,
                                            }}>
                                            {cells.slice(r * 7, r * 7 + 7)}
                                        </View>,
                                    );
                                }
                                return rows;
                            })()}
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// --- STYLES (OPTIMIZED FOR SPACE & LOOK) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgApp },

    // Header & Search
    headerSection: {
        paddingTop:
            Platform.OS === "android" ? StatusBar.currentHeight + 15 : 15,
        paddingHorizontal: 20,
        paddingBottom: 10,
        backgroundColor: "#FFF",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    greeting: { fontSize: 13, color: COLORS.textMuted, fontWeight: "600" },
    headerTitle: { fontSize: 22, color: COLORS.textMain, fontWeight: "800" },
    notifIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.bgApp,
        justifyContent: "center",
        alignItems: "center",
    },
    notifDot: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.secondary,
    },

    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.bgApp,
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: COLORS.textMain,
    },
    calendarBtn: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        marginLeft: 6,
        borderRadius: 8,
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
    },

    // COMPACT FILTERS (Space Saver)
    filterScroll: { maxHeight: 40 }, // Restrict height
    filterContent: { alignItems: "center", paddingRight: 20 },
    filterPill: {
        height: 28, // Reduced height
        paddingHorizontal: 14, // Reduced padding
        borderRadius: 14,
        backgroundColor: COLORS.bgApp,
        marginRight: 8,
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "transparent",
    },
    filterPillActive: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    filterText: { fontSize: 12, fontWeight: "600", color: COLORS.textMuted },
    filterTextActive: { color: "#FFF", fontWeight: "700" },

    // List
    listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    emptyState: { alignItems: "center", marginTop: 60 },
    emptyText: { color: COLORS.textLight, marginTop: 10, fontSize: 14 },

    // REDESIGNED CARD
    cardWrapper: { marginBottom: 12 },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },

    // Card Top
    cardTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    avatarSmall: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.primaryLight,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    avatarTextSmall: { fontSize: 14, fontWeight: "800", color: COLORS.primary },
    nameBlock: { flex: 1 },
    cardName: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 2,
    },
    cardMeta: { fontSize: 11, color: COLORS.textLight },
    statusBadgeSmall: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        minWidth: 60,
        alignItems: "center",
    },
    statusTextSmall: {
        fontSize: 10,
        fontWeight: "800",
        textTransform: "uppercase",
    },

    // Card Middle
    infoRow: {
        flexDirection: "row",
        marginBottom: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#F8FAFC",
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 15,
        flex: 1,
    },
    infoText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 4,
        fontWeight: "500",
    },

    // Card Bottom Action Strip
    actionStrip: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    actionBtnText: {
        fontSize: 11,
        fontWeight: "700",
        marginLeft: 4,
        color: COLORS.textMuted,
    },
    actionDivider: { width: 1, height: 14, backgroundColor: "#E2E8F0" },

    // FAB
    fab: {
        position: "absolute",
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: COLORS.primary,
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalCard: {
        width: "85%",
        backgroundColor: "#FFF",
        borderRadius: 20,
        maxHeight: "70%",
        elevation: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textMain },
    modalBody: { padding: 16 },
    detailItem: {
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: "600" },
    dValue: { fontSize: 14, color: COLORS.textMain, fontWeight: "600" },
    modalFooter: {
        flexDirection: "row",
        padding: 16,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    mBtn: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 10,
        borderRadius: 10,
    },
    mBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
    cardDate: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
});
