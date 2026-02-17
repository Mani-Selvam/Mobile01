import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import * as followupService from "../services/followupService";
import { getImageUrl } from "../utils/imageHelper";

// --- THEME & CONSTANTS ---
const { width } = Dimensions.get("window");
const COLORS = {
    bgApp: "#F1F5F9", // Slate 100
    bgCard: "#FFFFFF",
    primary: "#6366F1", // Indigo 500
    primaryDark: "#4338CA",
    secondary: "#F43F5E", // Rose 500
    textMain: "#1E293B", // Slate 800
    textSec: "#64748B", // Slate 500
    textLight: "#94A3B8", // Slate 400
    border: "#E2E8F0",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    gradients: {
        header: ["#1E293B", "#0F172A"], // Dark Slate
        primary: ["#6366F1", "#8B5CF6"], // Indigo -> Violet
        danger: ["#EF4444", "#DC2626"], // Red
        warning: ["#F59E0B", "#D97706"], // Amber
    }
};

const DURATION_OPTIONS = [
    { label: "Today", value: "Today", icon: "today-outline" },
    { label: "This Week", value: "This Week", icon: "calendar-outline" },
    { label: "This Month", value: "This Month", icon: "calendar-number-outline" },
    { label: "This Year", value: "This Year", icon: "layers-outline" },
    { label: "All Time", value: "All Time", icon: "infinite-outline" },
];

export default function ReportScreen() {
    const [activeTab, setActiveTab] = useState("Pending");
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Duration Filter
    const [duration, setDuration] = useState("This Month");
    const [showDurationPicker, setShowDurationPicker] = useState(false);

    // --- LOGIC ---
    const isDateInDuration = (dateString, durationType) => {
        if (!dateString) return false;
        if (durationType === "All Time") return true;

        const date = new Date(dateString);
        const now = new Date();
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (durationType === "Today") return d.getTime() === n.getTime();

        if (durationType === "This Week") {
            const day = n.getDay() || 7;
            if (day !== 1) n.setHours(-24 * (day - 1));
            const startOfWeek = n;
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            return d >= startOfWeek && d <= endOfWeek;
        }

        if (durationType === "This Month") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        if (durationType === "This Year") return date.getFullYear() === now.getFullYear();

        return true;
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const serviceTab = activeTab === "Dropped" ? "Dropped" : "All";
            const response = await followupService.getFollowUps(serviceTab, 1, 1000);

            let fetchedData = Array.isArray(response) ? response : (response?.data || []);

            // 1. Filter by Tab
            if (activeTab === "Pending") {
                fetchedData = fetchedData.filter(item => {
                    const status = (item.status || "").toLowerCase();
                    const action = (item.nextAction || "").toLowerCase();
                    const enqStatus = (item.enqId?.status || "").toLowerCase();
                    const isDropped = status.includes("drop") || action.includes("drop") || enqStatus === "dropped";
                    const isSale = status === "completed" || action === "sales" || enqStatus === "converted" || enqStatus === "closed";
                    return !isDropped && !isSale;
                });
            }

            // 2. Filter by Duration
            fetchedData = fetchedData.filter(item => isDateInDuration(item.date, duration));

            // 3. Sort
            fetchedData.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return activeTab === "Pending" ? dateA - dateB : dateB - dateA;
            });

            setData(fetchedData);
        } catch (error) {
            console.error("Report Fetch Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [activeTab, duration])
    );

    // --- COMPONENTS ---

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <LinearGradient colors={COLORS.gradients.header} style={styles.headerGradient}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Report Center</Text>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setShowDurationPicker(true)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
                            style={styles.filterBtnGradient}
                        >
                            <Ionicons name="calendar" size={16} color="#FFF" style={{ marginRight: 6 }} />
                            <Text style={styles.filterBtnText}>{duration}</Text>
                            <Ionicons name="chevron-down" size={14} color="#CBD5E1" style={{ marginLeft: 4 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Tabs inside Header for integrated look */}
                <View style={styles.tabsWrapper}>
                    <View style={styles.tabsContainer}>
                        {["Pending", "Dropped"].map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                                    onPress={() => setActiveTab(tab)}
                                    activeOpacity={0.9}
                                >
                                    {isActive && (
                                        <MotiView
                                            from={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ type: "timing", duration: 200 }}
                                            style={StyleSheet.absoluteFillObject}
                                        >
                                            <LinearGradient
                                                colors={COLORS.gradients.primary}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.tabActiveBg}
                                            />
                                        </MotiView>
                                    )}
                                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                        {tab}
                                    </Text>
                                    {isActive && (
                                        <View style={styles.activeDot} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    const renderCard = ({ item, index }) => {
        const getEnquiryDate = () => {
            if (item.enqId?.date) return item.enqId.date;
            if (item.enqId?.createdAt) return item.enqId.createdAt.split("T")[0];
            return "N/A";
        };

        const enquiryDate = getEnquiryDate();
        const initials = item.name ? item.name.substring(0, 2).toUpperCase() : "NA";
        const isPending = activeTab === "Pending";

        // Resolve Image
        const rawImage = item.enqId?.image;
        const imageUrl = rawImage ? getImageUrl(rawImage) : null;

        return (
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 350, delay: index * 50 }}
                style={styles.cardContainer}
            >
                <View style={styles.cardMain}>
                    {/* Left: Avatar or Image */}
                    <View style={styles.avatarCol}>
                        {imageUrl ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.avatar}
                                resizeMode="cover"
                            />
                        ) : (
                            <LinearGradient
                                colors={isPending ? COLORS.gradients.warning : COLORS.gradients.danger}
                                style={styles.avatar}
                            >
                                <Text style={styles.avatarText}>{initials}</Text>
                            </LinearGradient>
                        )}
                        <View style={styles.connectorLine} />
                    </View>

                    {/* Right: Content */}
                    <View style={styles.contentCol}>
                        {/* Top Row: Name & Badge */}
                        <View style={styles.cardHeaderRow}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                            <View style={[
                                styles.badge,
                                isPending ? { backgroundColor: "#FFF7ED" } : { backgroundColor: "#FEF2F2" }
                            ]}>
                                <Text style={[
                                    styles.badgeText,
                                    isPending ? { color: COLORS.warning } : { color: COLORS.danger }
                                ]}>
                                    {isPending ? "PENDING" : "DROPPED"}
                                </Text>
                            </View>
                        </View>

                        {/* Mobile Row */}
                        <View style={styles.mobileRow}>
                            <Ionicons name="call-outline" size={14} color={COLORS.textSec} />
                            <Text style={styles.mobileText}>{item.mobile}</Text>
                        </View>

                        {/* Drop Reason if Dropped */}
                        {!isPending && item.remarks && (
                            <View style={styles.reasonBox}>
                                <Text style={styles.reasonLabel}>Reason:</Text>
                                <Text style={styles.reasonVal} numberOfLines={2}>{item.remarks}</Text>
                            </View>
                        )}

                        {/* Divider */}
                        <View style={styles.dashedDivider} />

                        {/* Dates Grid */}
                        <View style={styles.datesGrid}>
                            <View style={styles.dateItem}>
                                <Text style={styles.dateLabel}>Enquiry Date</Text>
                                <View style={styles.dateValueRow}>
                                    <Ionicons name="calendar-outline" size={12} color={COLORS.textSec} />
                                    <Text style={styles.dateValue}>{enquiryDate}</Text>
                                </View>
                            </View>

                            <View style={[styles.dateItem, { alignItems: "flex-end" }]}>
                                <Text style={styles.dateLabel}>
                                    {isPending ? "Next Follow-up" : "Dropped Date"}
                                </Text>
                                <View style={styles.dateValueRow}>
                                    <Ionicons
                                        name={isPending ? "alarm-outline" : "close-circle-outline"}
                                        size={12}
                                        color={isPending ? COLORS.primary : COLORS.danger}
                                    />
                                    <Text style={[
                                        styles.dateValue,
                                        isPending ? { color: COLORS.primary, fontWeight: "700" } : { color: COLORS.textMain }
                                    ]}>
                                        {item.date}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </MotiView>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

            {renderHeader()}

            <View style={styles.listWrapper}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Fetching Report...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={data}
                        keyExtractor={(item, index) => item._id || index.toString()}
                        renderItem={renderCard}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconBg}>
                                    <Ionicons name="stats-chart-outline" size={40} color={COLORS.textLight} />
                                </View>
                                <Text style={styles.emptyTitle}>No Records Found</Text>
                                <Text style={styles.emptySub}>
                                    There are no {activeTab.toLowerCase()} items for {duration.toLowerCase()}.
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Filter Modal */}
            <Modal
                visible={showDurationPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDurationPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDurationPicker(false)}
                >
                    <MotiView
                        from={{ opacity: 0, scale: 0.9, translateY: -20 }}
                        animate={{ opacity: 1, scale: 1, translateY: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                        style={styles.modalContent}
                    >
                        <Text style={styles.modalTitle}>Select Duration</Text>
                        <View style={styles.modalDivider} />
                        {DURATION_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt.value}
                                style={[
                                    styles.modalOption,
                                    duration === opt.value && styles.modalOptionActive
                                ]}
                                onPress={() => {
                                    setDuration(opt.value);
                                    setShowDurationPicker(false);
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={[
                                        styles.iconBox,
                                        duration === opt.value ? { backgroundColor: COLORS.primary } : { backgroundColor: "#F1F5F9" }
                                    ]}>
                                        <Ionicons
                                            name={opt.icon}
                                            size={18}
                                            color={duration === opt.value ? "#FFF" : COLORS.textSec}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.modalOptionText,
                                        duration === opt.value && styles.modalOptionTextActive
                                    ]}>
                                        {opt.label}
                                    </Text>
                                </View>
                                {duration === opt.value && (
                                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </MotiView>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgApp,
    },
    // Header
    headerContainer: {
        marginBottom: 10,
        backgroundColor: COLORS.bgApp,
    },
    headerGradient: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#FFF",
        letterSpacing: 0.5,
    },
    filterButton: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    filterBtnGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    filterBtnText: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "600",
    },
    // Tabs
    tabsWrapper: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 4,
    },
    tabsContainer: {
        flexDirection: "row",
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        overflow: 'hidden',
    },
    tabBtnActive: {
        // bg handled by absolute gradient
    },
    tabActiveBg: {
        flex: 1,
        borderRadius: 12,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "rgba(255,255,255,0.7)",
        zIndex: 1,
    },
    tabTextActive: {
        color: "#FFF",
        fontWeight: "700",
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#FFF",
        position: "absolute",
        bottom: 4,
        zIndex: 1,
    },

    // List
    listWrapper: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
        paddingTop: 5,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.textSec,
        fontWeight: "500",
    },

    // Card
    cardContainer: {
        marginBottom: 16,
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    cardMain: {
        backgroundColor: COLORS.bgCard,
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
    },
    avatarCol: {
        alignItems: "center",
        marginRight: 16,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    avatarText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    connectorLine: {
        flex: 1,
        width: 2,
        backgroundColor: "#F1F5F9",
        marginTop: 8,
        borderRadius: 1,
    },
    contentCol: {
        flex: 1,
        paddingTop: 2,
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 6,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.textMain,
        flex: 1,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    mobileRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    mobileText: {
        fontSize: 13,
        color: COLORS.textSec,
        marginLeft: 6,
        fontWeight: "500",
    },
    reasonBox: {
        backgroundColor: "#FEF2F2",
        padding: 8,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.danger,
        marginBottom: 8,
    },
    reasonLabel: {
        fontSize: 10,
        color: COLORS.danger,
        fontWeight: "700",
        marginBottom: 2,
    },
    reasonVal: {
        fontSize: 12,
        color: "#991B1B",
    },
    dashedDivider: {
        height: 1,
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        borderStyle: 'dashed',
        marginVertical: 10,
    },
    datesGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dateItem: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        marginBottom: 4,
        fontWeight: "500",
    },
    dateValueRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateValue: {
        fontSize: 13,
        color: COLORS.textMain,
        fontWeight: "600",
        marginLeft: 4,
    },

    // Empty State
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 60,
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 14,
        color: COLORS.textSec,
        textAlign: "center",
        paddingHorizontal: 40,
        lineHeight: 20,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)", // Darker overlay
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: width * 0.85,
        backgroundColor: "#FFF",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 16,
        textAlign: "center",
    },
    modalDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginBottom: 16,
    },
    modalOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        marginBottom: 4,
    },
    modalOptionActive: {
        backgroundColor: "#F0F9FF",
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    modalOptionText: {
        fontSize: 15,
        color: COLORS.textMain,
        fontWeight: "500",
    },
    modalOptionTextActive: {
        fontWeight: "700",
        color: COLORS.primary,
    },
});
