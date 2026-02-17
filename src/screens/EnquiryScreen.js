import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Image,
    LayoutAnimation,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { API_URL as GLOBAL_API_URL } from "../services/apiConfig";
import * as enquiryService from "../services/enquiryService";
import { getImageUrl } from "../utils/imageHelper";

// --- CONFIGURATION ---
const API_URL = `${GLOBAL_API_URL}/enquiries`;
const { width, height } = Dimensions.get("window");

// --- MODERN THEME COLORS ---
const COLORS = {
    bgApp: "#F1F5F9",
    bgCard: "#FFFFFF",

    primary: "#6366F1", // Indigo 500
    primaryDark: "#4F46E5", // Indigo 600
    primaryLight: "#EEF2FF",

    secondary: "#F43F5E", // Rose 500
    accent: "#8B5CF6", // Violet 500

    textMain: "#0F172A", // Slate 900
    textMuted: "#475569", // Slate 600
    textLight: "#94A3B8", // Slate 400

    border: "#E2E8F0",

    success: "#10B981",
    whatsapp: "#25D366",
    danger: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",

    gradients: {
        primary: ["#6366F1", "#8B5CF6"],
        success: ["#10B981", "#059669"],
        danger: ["#EF4444", "#DC2626"],
        info: ["#3B82F6", "#2563EB"],
        header: ["#1E293B", "#0F172A"],
    }
};

// --- ANIMATION HOOK ---
const useFadeIn = (delay = 0) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 600,
                delay: delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 600,
                delay: delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    return { opacity, translateY };
};

// Helper: format a Date or date-string to local YYYY-MM-DD
const toLocalIso = (d) => {
    const date = d ? new Date(d) : new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

// --- MODERN CARD COMPONENT ---
const ModernCard = React.memo(({
    item,
    index,
    onShowDetails,
    onEdit,
    onDelete,
    onFollowUp,
    onCall,
    onWhatsApp,
}) => {
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
    const dateLabel = rawDate
        ? new Date(rawDate).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
        })
        : "";

    // Priority color mapping
    const getPriorityColor = (type) => {
        const t = (type || "").toLowerCase();
        if (t.includes("hot") || t.includes("high")) return COLORS.danger;
        if (t.includes("warm") || t.includes("medium")) return COLORS.warning;
        return COLORS.info;
    };

    const priorityColor = getPriorityColor(item.enqType);

    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
                type: "timing",
                duration: 300,
                delay: index * 50, // Reduced delay for snappier feel
            }}
            style={styles.cardWrapper}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => onShowDetails(item)}
                style={[styles.cardContainer, { borderLeftColor: priorityColor, borderLeftWidth: 5 }]}
            >
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                    {/* Header: Avatar + Info */}
                    <View style={styles.cardHeader}>
                        <View style={[styles.avatarContainer, item.image && { backgroundColor: "transparent", overflow: "hidden" }]}>
                            {item.image ? (
                                <Image
                                    source={{ uri: getImageUrl(item.image) }}
                                    style={{ width: "100%", height: "100%" }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <LinearGradient
                                    colors={COLORS.gradients.primary}
                                    style={styles.avatarGradient}
                                >
                                    <Text style={styles.avatarText}>{initials}</Text>
                                </LinearGradient>
                            )}
                        </View>

                        <View style={styles.cardInfo}>
                            <View style={styles.nameRow}>
                                <Text style={styles.cardName} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                {dateLabel && (
                                    <View style={styles.dateBadge}>
                                        <Text style={styles.dateText}>
                                            {dateLabel}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.subInfoRow}>
                                <Ionicons name="phone-portrait-outline" size={12} color={COLORS.textLight} />
                                <Text style={styles.cardSubtext}>
                                    {item.mobile}
                                </Text>
                                <View style={styles.dotSeparator} />
                                <Text style={styles.cardSubtext}>
                                    {item.enqNo || `ID: ${item._id?.substr(-4)}`}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Product Details */}
                    <View style={styles.productSection}>
                        <View style={styles.productTag}>
                            <Ionicons
                                name="briefcase-outline"
                                size={14}
                                color={COLORS.primary}
                            />
                            <Text style={styles.productText} numberOfLines={1}>
                                {item.product || "General Enquiry"}
                            </Text>
                        </View>
                        {item.enqType && (
                            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + "20" }]}>
                                <Text style={[styles.priorityText, { color: priorityColor }]}>
                                    {item.enqType}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Action Bar */}
                    <View style={styles.actionBar}>
                        <View style={styles.actionLeft}>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: COLORS.success + "15" }]}
                                onPress={() => onCall(item.mobile)}>
                                <Ionicons name="call" size={18} color={COLORS.success} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: COLORS.whatsapp + "15" }]}
                                onPress={() => onWhatsApp(item.mobile)}>
                                <Ionicons name="logo-whatsapp" size={18} color={COLORS.whatsapp} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.actionRight}>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: COLORS.info + "15" }]}
                                onPress={() => onEdit(item)}>
                                <Ionicons name="create-outline" size={18} color={COLORS.info} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: COLORS.danger + "15" }]}
                                onPress={() => onDelete(item._id)}>
                                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </MotiView>
    );
});

// --- MAIN SCREEN ---
export default function EnquiryListScreen({ navigation, route }) {
    const [statusFilter, setStatusFilter] = useState(route.params?.filter || null);
    const [enquiries, setEnquiries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [detailsModal, setDetailsModal] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [userName, setUserName] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // --- MENU STATE ---
    const { user, logout } = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // FAB Animation
    const fabScale = useRef(new Animated.Value(1)).current;

    const animateFab = () => {
        Animated.sequence([
            Animated.timing(fabScale, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(fabScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    useEffect(() => {
        if (Platform.OS === 'android') {
            if (UIManager.setLayoutAnimationEnabledExperimental) {
                UIManager.setLayoutAnimationEnabledExperimental(true);
            }
        }

        if (route.params?.filter) {
            setStatusFilter(route.params.filter);
        }
    }, [route.params?.filter]);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // ... (existing effects)

    useEffect(() => {
        fetchEnquiries(true);
    }, []);



    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEnquiries(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Refetch on filter change
    useEffect(() => {
        fetchEnquiries(true);
    }, [statusFilter]);

    const fetchEnquiries = async (refresh = false) => {
        if (refresh) {
            setIsLoading(true);
            setPage(1);
            setHasMore(true);
        } else {
            if (!hasMore || isLoadingMore) return;
            setIsLoadingMore(true);
        }

        try {
            const currentPage = refresh ? 1 : page;
            const currentLimit = 20;
            // console.log(`Fetching enquiries page: ${currentPage}, search: ${searchQuery}, status: ${statusFilter}`);

            const response = await enquiryService.getAllEnquiries(currentPage, currentLimit, searchQuery, statusFilter);

            let newData = [];
            let totalPages = 1;

            // Handle both legacy array and new paginated object response
            if (Array.isArray(response)) {
                newData = response;
                setHasMore(false); // Assume no more pages if legacy array
            } else if (response && response.data) {
                newData = response.data;
                totalPages = response.pagination?.pages || 1;
                setHasMore(currentPage < totalPages);
            }

            if (refresh) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setEnquiries(newData);
            } else {
                setEnquiries(prev => [...prev, ...newData]);
            }

            if (!refresh) {
                setPage(prev => prev + 1);
            } else if (newData.length > 0 && currentPage < totalPages) {
                // If we refreshed and there are more pages, prepare next page
                setPage(2);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!isLoading && !isLoadingMore && hasMore) {
            fetchEnquiries(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Enquiry",
            "Are you sure you want to delete this enquiry?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            console.log("🗑️ Deleting enquiry with ID:", id);
                            const response =
                                await enquiryService.deleteEnquiry(id);
                            console.log("✅ Delete response:", response);

                            // Optimistic UI update
                            setEnquiries((prev) => {
                                const updated = prev.filter(
                                    (e) => e._id !== id,
                                );
                                console.log(
                                    "✅ UI Updated - Remaining enquiries:",
                                    updated.length,
                                );
                                return updated;
                            });

                            // Show success message
                            Alert.alert(
                                "Success",
                                "Enquiry deleted successfully",
                            );
                        } catch (err) {
                            console.error("❌ Delete enquiry error:", err);
                            console.error("Error details:", {
                                message: err.message,
                                status: err.response?.status,
                                data: err.response?.data,
                            });

                            const errorMsg =
                                err.response?.data?.message ||
                                err.message ||
                                "Failed to delete enquiry. Please try again.";

                            Alert.alert("Delete Failed", errorMsg);
                        }
                    },
                },
            ],
        );
    };

    const handleShowDetails = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setDetailsModal(true);
    };

    const handleCall = (phone) => phone && Linking.openURL(`tel:${phone}`);
    const handleWhatsApp = (phone) => {
        if (!phone) return;
        Linking.openURL(
            `whatsapp://send?phone=${phone.replace(/\D/g, "")}`,
        ).catch(() => Alert.alert("Error", "WhatsApp not installed"));
    };
    const handleEdit = (enquiry) => {
        // Navigate to the AddEnquiry screen inside the Enquiry stack.
        // Use nested navigation format to be robust from different navigator contexts.
        try {
            navigation.navigate("AddEnquiry", {
                enquiry,
                onEnquirySaved: fetchEnquiries // Refresh list after editing
            });
        } catch (e) {
            navigation.navigate("Enquiry", {
                screen: "AddEnquiry",
                params: {
                    enquiry,
                    onEnquirySaved: fetchEnquiries // Refresh list after editing
                },
            });
        }
    };
    const handleFollowUp = (enquiry) =>
        Alert.alert("Follow Up", `Start follow-up for ${enquiry.name}?`);

    const filteredData = enquiries.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.mobile.includes(searchQuery);

        const matchesStatus = statusFilter
            ? item.status === statusFilter
            : true;

        if (!selectedDate) return matchesSearch && matchesStatus;

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

        const itemDate = getItemDate(item);
        return matchesSearch && itemDate === selectedDate;
    });

    // --- SIDE MENU COMPONENTS ---
    const SideMenu = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={menuVisible}
            onRequestClose={() => setMenuVisible(false)}>
            <TouchableOpacity
                style={menuStyles.menuOverlay}
                activeOpacity={1}
                onPressOut={() => setMenuVisible(false)}>
                <View style={menuStyles.menuContent}>
                    <LinearGradient
                        colors={COLORS.gradients.primary}
                        style={menuStyles.menuHeader}
                    >
                        <View style={menuStyles.profileCircle}>
                            <Ionicons name="person" size={40} color="#fff" />
                        </View>
                        <Text style={menuStyles.profileName}>Admin User</Text>
                        <Text style={menuStyles.profileRole}>Sales Manager</Text>
                    </LinearGradient>

                    <ScrollView style={menuStyles.menuList}>
                        <MenuItem icon="home-outline" label="Dashboard" onPress={() => { setMenuVisible(false); navigation.navigate("Home"); }} />
                        <MenuItem icon="people-outline" label="Enquiries" onPress={() => setMenuVisible(false)} />
                        <MenuItem icon="call-outline" label="Follow-ups" onPress={() => { setMenuVisible(false); navigation.navigate("FollowUp"); }} />
                        <MenuItem
                            icon="link-outline"
                            label="Lead Sources"
                            onPress={() => {
                                setMenuVisible(false);
                                navigation.navigate("LeadSourceScreen");
                            }}
                        />
                        <MenuItem
                            icon="people-circle-outline"
                            label="Staff Management"
                            onPress={() => {
                                setMenuVisible(false);
                                navigation.navigate("StaffScreen");
                            }}
                        />
                        <MenuItem icon="bar-chart-outline" label="Reports" onPress={() => { setMenuVisible(false); navigation.navigate("Report"); }} />
                        <MenuItem icon="settings-outline" label="Settings" />
                        <MenuItem
                            icon="log-out-outline"
                            label="Logout"
                            color="#ef4444"
                            onPress={handleLogout}
                        />

                        {/* Logo Section at Bottom */}
                        <View style={menuStyles.logoSection}>
                            <View style={menuStyles.logoContainer}>
                                {true ? (
                                    <Image
                                        source={require("../assets/logo.png")}
                                        style={menuStyles.logoImage}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <View style={menuStyles.logoIconCircle}>
                                        <Ionicons name="business" size={28} color="#fff" />
                                    </View>
                                )}
                                <Text style={menuStyles.logoText}>Neophore Technologies</Text>
                                <Text style={menuStyles.logoSubtext}>CRM System</Text>
                            </View>
                            <Text style={menuStyles.versionText}>v1.0.0</Text>
                        </View>
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                onPress: async () => {
                    setMenuVisible(false);
                    await logout();
                },
                style: "destructive",
            },
        ]);
    };

    const MenuItem = ({ icon, label, color = "#334155", onPress }) => (
        <TouchableOpacity style={menuStyles.menuItem} onPress={onPress}>
            <Ionicons name={icon} size={24} color={color} />
            <Text style={[menuStyles.menuItemText, { color }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>

            <SideMenu />

            {/* MODAL: DETAILS */}
            <Modal
                visible={detailsModal}
                transparent
                animationType="fade"
                onRequestClose={() => setDetailsModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Enquiry Details
                            </Text>
                            <TouchableOpacity
                                onPress={() => setDetailsModal(false)}
                                style={styles.closeBtn}>
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color={COLORS.textMain}
                                />
                            </TouchableOpacity>
                        </View>

                        {selectedEnquiry && (
                            <ScrollView
                                contentContainerStyle={styles.modalContent}>
                                <View style={styles.modalHero}>
                                    <View style={[styles.modalImageContainer, selectedEnquiry.image && { backgroundColor: "transparent", overflow: "hidden" }]}>
                                        {selectedEnquiry.image ? (
                                            <Image
                                                source={{ uri: getImageUrl(selectedEnquiry.image) }}
                                                style={styles.modalImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <LinearGradient
                                                colors={COLORS.gradients.primary}
                                                style={styles.modalAvatarGradient}
                                            >
                                                <Text style={styles.modalAvatarText}>
                                                    {selectedEnquiry.name?.substring(0, 2).toUpperCase()}
                                                </Text>
                                            </LinearGradient>
                                        )}
                                    </View>
                                    <Text style={styles.modalHeroName}>{selectedEnquiry.name}</Text>
                                    <Text style={styles.modalHeroSub}>{selectedEnquiry.mobile}</Text>
                                </View>

                                <DetailRow
                                    label="Name"
                                    value={selectedEnquiry.name}
                                />
                                <DetailRow
                                    label="Mobile"
                                    value={selectedEnquiry.mobile}
                                />
                                <DetailRow
                                    label="Product"
                                    value={selectedEnquiry.product}
                                />
                                {selectedEnquiry.cost && (
                                    <DetailRow
                                        label="Estimated Cost"
                                        value={`₹${selectedEnquiry.cost}`}
                                    />
                                )}
                                <DetailRow
                                    label="Address"
                                    value={selectedEnquiry.address || "-"}
                                />
                                <DetailRow
                                    label="Priority"
                                    value={selectedEnquiry.enqType || "Normal"}
                                />
                                <DetailRow
                                    label="Source"
                                    value={selectedEnquiry.source || "-"}
                                />
                            </ScrollView>
                        )}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[
                                    styles.modalBtn,
                                    { backgroundColor: COLORS.success },
                                ]}
                                onPress={() =>
                                    handleCall(selectedEnquiry?.mobile)
                                }>
                                <Ionicons name="call" color="#fff" size={20} />
                                <Text style={styles.modalBtnText}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalBtn,
                                    { backgroundColor: COLORS.whatsapp },
                                ]}
                                onPress={() =>
                                    handleWhatsApp(selectedEnquiry?.mobile)
                                }>
                                <Ionicons
                                    name="logo-whatsapp"
                                    color="#fff"
                                    size={20}
                                />
                                <Text style={styles.modalBtnText}>
                                    WhatsApp
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* HEADER SECTION */}
            <LinearGradient
                colors={COLORS.gradients.header}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuIconContainer}>
                            <Ionicons name="grid-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.greetingHeader}>Enquiry List</Text>
                            <Text style={styles.userNameHeader}>
                                {userName || "User"}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notifContainer}>
                        <Ionicons name="notifications-outline" size={24} color="#FFF" />
                        <View style={styles.notifBadge} />
                    </TouchableOpacity>
                </View>

                {/* STATS SECTION */}


                {/* SEARCH BAR */}
                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color={COLORS.textLight}
                        style={{ marginLeft: 15 }}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search name or phone..."
                        placeholderTextColor={COLORS.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity
                        onPress={() => setDatePickerVisible(true)}
                        style={styles.calendarTrigger}>
                        <Ionicons
                            name="calendar-outline"
                            size={20}
                            color={COLORS.primary}
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* LIST SECTION */}
            <FlatList
                data={enquiries}
                keyExtractor={(item) =>
                    item._id?.toString() || item.id?.toString()
                }
                renderItem={({ item, index }) => (
                    <ModernCard
                        item={item}
                        index={index}
                        onShowDetails={handleShowDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onFollowUp={handleFollowUp}
                        onCall={handleCall}
                        onWhatsApp={handleWhatsApp}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshing={isLoading}
                onRefresh={() => fetchEnquiries(true)} // Explicitly pass true for refresh
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={true}
                ListFooterComponent={
                    isLoadingMore ? (
                        <View style={{ paddingVertical: 20 }}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name="document-text-outline"
                                size={60}
                                color={COLORS.textLight}
                            />
                            <Text style={styles.emptyText}>No enquiries found</Text>
                        </View>
                    ) : null
                }
                showsVerticalScrollIndicator={false}
            />

            {/* FAB */}
            <Animated.View
                style={[
                    styles.fabContainer,
                    { transform: [{ scale: fabScale }] },
                ]}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => {
                        animateFab();
                        // Try direct navigation first; fallback to nested navigate
                        try {
                            navigation.navigate("AddEnquiry", {
                                onEnquirySaved: fetchEnquiries,
                            });
                        } catch (e) {
                            navigation.navigate("Enquiry", {
                                screen: "AddEnquiry",
                                params: { onEnquirySaved: fetchEnquiries },
                            });
                        }
                    }}
                    activeOpacity={0.8}>
                    <Ionicons name="add" size={28} color="#FFF" />
                </TouchableOpacity>
            </Animated.View>

            {/* DATE PICKER MODAL */}
            <Modal
                visible={datePickerVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setDatePickerVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.datePickerCard}>
                        <View style={styles.dateHeader}>
                            <TouchableOpacity
                                onPress={() => {
                                    const y = calendarMonth.getFullYear();
                                    const m = calendarMonth.getMonth();
                                    setCalendarMonth(new Date(y, m - 1, 1));
                                }}>
                                <Ionicons
                                    name="chevron-back"
                                    size={24}
                                    color={COLORS.textMain}
                                />
                            </TouchableOpacity>
                            <Text style={styles.dateTitle}>
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
                                    size={24}
                                    color={COLORS.textMain}
                                />
                            </TouchableOpacity>
                        </View>

                        <View
                            style={{
                                paddingHorizontal: 16,
                                paddingBottom: 16,
                            }}>
                            <TouchableOpacity
                                style={styles.clearDateBtn}
                                onPress={() => {
                                    setSelectedDate(null);
                                    setDatePickerVisible(false);
                                }}>
                                <Text style={styles.clearDateText}>
                                    Show All Dates
                                </Text>
                            </TouchableOpacity>

                            {/* Calendar Grid */}
                            <View style={styles.weekHeader}>
                                {["M", "T", "W", "T", "F", "S", "S"].map(
                                    (d, i) => (
                                        <Text key={i} style={styles.weekDay}>
                                            {d}
                                        </Text>
                                    ),
                                )}
                            </View>

                            <View style={styles.calendarGrid}>
                                {(() => {
                                    const y = calendarMonth.getFullYear();
                                    const m = calendarMonth.getMonth();
                                    const firstDayIndex =
                                        (new Date(y, m, 1).getDay() + 6) % 7;
                                    const daysInMonth = new Date(
                                        y,
                                        m + 1,
                                        0,
                                    ).getDate();
                                    const cells = [];

                                    // Empty cells for previous month
                                    for (let i = 0; i < firstDayIndex; i++) {
                                        cells.push(
                                            <View
                                                key={`e-${i}`}
                                                style={styles.dayCell}
                                            />,
                                        );
                                    }

                                    // Days
                                    for (let d = 1; d <= daysInMonth; d++) {
                                        const cellDate = new Date(y, m, d);
                                        const iso = toLocalIso(cellDate);
                                        const isSelected = selectedDate === iso;
                                        const isToday =
                                            toLocalIso(new Date()) === iso;

                                        cells.push(
                                            <TouchableOpacity
                                                key={d}
                                                onPress={() => {
                                                    setSelectedDate(iso);
                                                    setDatePickerVisible(false);
                                                }}
                                                style={[
                                                    styles.dayCell,
                                                    isSelected &&
                                                    styles.daySelected,
                                                    isToday &&
                                                    !isSelected &&
                                                    styles.dayToday,
                                                ]}>
                                                <Text
                                                    style={[
                                                        styles.dayText,
                                                        isSelected &&
                                                        styles.dayTextSelected,
                                                        isToday &&
                                                        !isSelected &&
                                                        styles.dayTextToday,
                                                    ]}>
                                                    {d}
                                                </Text>
                                            </TouchableOpacity>,
                                        );
                                    }
                                    return cells;
                                })()}
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// Helper for Modal Rows
const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const StatCard = ({ label, value, icon, gradient }) => (
    <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.statCardWrapper}
    >
        <LinearGradient colors={gradient} style={styles.statCard}>
            <View style={styles.statIconCircle}>
                <Ionicons name={icon} size={16} color="#FFF" />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </LinearGradient>
    </MotiView>
);

// --- STYLES ---
const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.bgApp,
    },
    headerGradient: {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
        paddingHorizontal: 20,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    greetingHeader: {
        fontSize: 14,
        color: "rgba(255,255,255,0.7)",
        fontWeight: "500",
    },
    userNameHeader: {
        fontSize: 20,
        color: "#FFF",
        fontWeight: "700",
    },
    notifContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    notifBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.secondary,
        borderWidth: 1.5,
        borderColor: COLORS.gradients.header[1],
    },
    statsScroll: {
        paddingBottom: 20,
        gap: 12,
    },
    statCardWrapper: {
        width: 110,
        marginRight: 10,
    },
    statCard: {
        padding: 12,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statIconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    statValue: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "800",
    },
    statLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 10,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        height: 50,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: COLORS.textMain,
    },
    calendarTrigger: {
        padding: 8,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 10,
        marginRight: 6,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 100,
    },
    cardWrapper: {
        marginBottom: 16,
    },
    cardContainer: {
        backgroundColor: "#FFF",
        borderRadius: 18,
        padding: 16,
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        marginRight: 12,
    },
    avatarGradient: {
        width: "100%",
        height: "100%",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "800",
    },
    cardInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    cardName: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.textMain,
        flex: 1,
    },
    dateBadge: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    dateText: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.textMuted,
    },
    subInfoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    cardSubtext: {
        fontSize: 13,
        color: COLORS.textLight,
        fontWeight: "500",
        marginLeft: 4,
    },
    dotSeparator: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: COLORS.textLight,
        marginHorizontal: 8,
    },
    productSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F8FAFC",
    },
    productTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.primaryLight,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    productText: {
        fontSize: 13,
        color: COLORS.primaryDark,
        marginLeft: 6,
        fontWeight: "700",
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: "800",
        textTransform: "uppercase",
    },
    actionBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    actionLeft: {
        flexDirection: "row",
        gap: 8,
    },
    actionRight: {
        flexDirection: "row",
        gap: 8,
    },
    actionBtn: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    fabContainer: {
        position: "absolute",
        bottom: 30,
        right: 24,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "#FFF",
        borderRadius: 24,
        maxHeight: "85%",
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#F8FAFC",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    modalContent: {
        padding: 20,
    },
    detailRow: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    detailLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        fontWeight: "700",
        textTransform: "uppercase",
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        color: COLORS.textMain,
        fontWeight: "600",
    },
    modalFooter: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 14,
        borderRadius: 12,
    },
    modalBtnText: {
        color: "#FFF",
        fontWeight: "700",
        marginLeft: 8,
    },
    datePickerCard: {
        width: "90%",
        backgroundColor: "#FFF",
        borderRadius: 24,
        paddingBottom: 20,
    },
    dateHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
    },
    dateTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    weekHeader: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
    },
    weekDay: {
        width: 36,
        textAlign: "center",
        fontSize: 12,
        fontWeight: "800",
        color: COLORS.textLight,
    },
    calendarGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    dayCell: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        margin: 2,
    },
    daySelected: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
    },
    dayToday: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 10,
    },
    dayText: {
        fontSize: 14,
        color: COLORS.textMain,
        fontWeight: "600",
    },
    dayTextSelected: {
        color: "#FFF",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 15,
        color: COLORS.textLight,
        fontWeight: "600",
    },
    modalHero: { alignItems: "center", marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    modalImageContainer: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, backgroundColor: COLORS.bgApp, justifyContent: "center", alignItems: "center" },
    modalImage: { width: "100%", height: "100%", borderRadius: 50 },
    modalAvatarGradient: { width: "100%", height: "100%", borderRadius: 50, justifyContent: "center", alignItems: "center" },
    modalAvatarText: { fontSize: 32, fontWeight: "800", color: "#FFF" },
    modalHeroName: { fontSize: 22, fontWeight: "800", color: COLORS.textMain, marginBottom: 4 },
    modalHeroSub: { fontSize: 14, color: COLORS.textLight, fontWeight: "600" },
});

const menuStyles = StyleSheet.create({
    menuOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
    },
    menuContent: {
        width: "75%",
        backgroundColor: "#fff",
        height: "100%",
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
        overflow: "hidden",
    },
    menuHeader: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 50,
        paddingBottom: 30,
        alignItems: "center",
    },
    profileCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    profileName: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "800",
    },
    profileRole: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        fontWeight: "600",
    },
    menuList: {
        padding: 15,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
    },
    menuItemText: {
        marginLeft: 15,
        fontSize: 15,
        fontWeight: "700",
    },
    logoSection: {
        marginTop: 30,
        paddingTop: 20,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    logoText: {
        fontSize: 16,
        fontWeight: '800',
        color: "#0F172A",
        marginTop: 8,
    },
    logoSubtext: {
        fontSize: 12,
        color: "#475569",
        marginTop: 2,
    },
    logoIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#6366F1",
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoImage: {
        width: 120,
        height: 40,
    },
    versionText: {
        fontSize: 11,
        color: "#475569",
        fontWeight: '500',
    },
});
