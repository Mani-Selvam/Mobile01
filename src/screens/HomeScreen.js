import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useCallback, useLayoutEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import * as enquiryService from "../services/enquiryService";
import * as followupService from "../services/followupService";

const { width } = Dimensions.get("window");

// 🌈 PREMIUM LIGHT PALETTE
const COLORS = {
    bg: "#FFFFFF",
    bgLight: "#F8FAFC",
    bgCard: "#FFFFFF",
    primary: "#6C5DD3",
    primaryLight: "#8B7FE8",
    secondary: "#4ECDC4",
    accent: "#FF6B9D",
    success: "#00D9A3",
    warning: "#FFB800",
    danger: "#FF5757",
    purple: ["#7F7FD5", "#86A8E7", "#91EAE4"],
    pink: ["#FF6B9D", "#C86DD7", "#7F7FD5"],
    blue: ["#667EEA", "#764BA2"],
    green: ["#00D9A3", "#4ECDC4"],
    orange: ["#FFB800", "#FF6B9D"],
    text: "#1A202C",
    textDim: "#4A5568",
    textMuted: "#718096",
    glass: "rgba(108, 93, 211, 0.05)",
    glassBorder: "rgba(108, 93, 211, 0.1)",
    shadow: "rgba(0, 0, 0, 0.08)",
};

// MenuItem Component (Refactored outside)
const MenuItem = ({ icon, label, onPress, color = COLORS.text }) => (
    <TouchableOpacity
        style={menuStyles.menuItem}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Ionicons name={icon} size={22} color={color} />
        <Text style={[menuStyles.menuItemText, { color }]}>{label}</Text>
    </TouchableOpacity>
);

// Side Menu Component (Refactored outside)
const SideMenu = ({ visible, onClose, navigation, user, onLogout }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <TouchableOpacity
            style={menuStyles.menuOverlay}
            activeOpacity={1}
            onPress={onClose}>
            <TouchableOpacity
                activeOpacity={1}
                style={menuStyles.menuContent}
                onPress={(e) => e.stopPropagation()}>
                <LinearGradient
                    colors={COLORS.purple}
                    style={menuStyles.menuHeader}
                >
                    <View style={menuStyles.profileCircle}>
                        <Text style={menuStyles.profileInitial}>
                            {(user && user.name) ? user.name[0].toUpperCase() : 'M'}
                        </Text>
                    </View>
                    <Text style={menuStyles.profileName}>{user?.name || 'Manager'}</Text>
                    <Text style={menuStyles.profileRole}>{user?.email || 'Sales Manager'}</Text>
                </LinearGradient>

                <ScrollView style={menuStyles.menuList}>
                    <MenuItem
                        icon="home-outline"
                        label="Dashboard"
                        onPress={() => {
                            onClose();
                            navigation.navigate("Home");
                        }}
                    />
                    <MenuItem
                        icon="people-outline"
                        label="Enquiries"
                        onPress={() => {
                            onClose();
                            navigation.navigate("Enquiry");
                        }}
                    />
                    <MenuItem
                        icon="call-outline"
                        label="Follow-ups"
                        onPress={() => {
                            onClose();
                            navigation.navigate("FollowUp");
                        }}
                    />
                    <MenuItem
                        icon="link-outline"
                        label="Lead Sources"
                        onPress={() => {
                            onClose();
                            navigation.navigate("LeadSourceScreen");
                        }}
                    />
                    <MenuItem
                        icon="people-circle-outline"
                        label="Staff Management"
                        onPress={() => {
                            onClose();
                            navigation.navigate("StaffScreen");
                        }}
                    />
                    <MenuItem
                        icon="bar-chart-outline"
                        label="Reports"
                        onPress={() => {
                            onClose();
                            navigation.navigate("Report");
                        }}
                    />
                    <MenuItem
                        icon="settings-outline"
                        label="Settings"
                        onPress={() => {
                            onClose();
                        }}
                    />

                    {/* Divider */}
                    <View style={menuStyles.divider} />

                    <MenuItem
                        icon="log-out-outline"
                        label="Logout"
                        color="#ef4444"
                        onPress={onLogout}
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
            </TouchableOpacity>
        </TouchableOpacity>
    </Modal>
);

export default function HomeScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Debug: Log user data
    console.log('HomeScreen user data:', user);

    const [stats, setStats] = useState({
        totalEnquiry: 0,
        todayEnquiry: 0,
        todayFollowup: 0,
        salesMonthly: 0,
        monthlyRevenue: 0,
        overallSalesAmount: 0,
        drops: 0,
        new: 0,
        ip: 0,
        conv: 0
    });
    const [todayTasks, setTodayTasks] = useState([]);
    const [showMenu, setShowMenu] = useState(false);

    // Handle logout
    const handleLogout = () => {
        setShowMenu(false);
        logout();
    };

    const fetchData = async () => {
        try {
            const [enqData, followData] = await Promise.all([
                enquiryService.getAllEnquiries(),
                followupService.getFollowUps("Today")
            ]);

            if (enqData && Array.isArray(enqData)) {
                const today = new Date().toISOString().split('T')[0];
                const todayEnq = enqData.filter(e => e && e.createdAt && e.createdAt.startsWith(today)).length;
                const converted = enqData.filter(e => e && e.status === "Converted");
                const drops = enqData.filter(e => e && (e.status === "Closed" || e.status === "Dropped" || e.status === "Drop")).length;

                const parseVal = (v) => {
                    if (!v) return 0;
                    if (typeof v === 'number') return v;
                    return Number(v.toString().replace(/[^0-9.]/g, '')) || 0;
                };

                const totalSales = converted.reduce((sum, e) => {
                    if (!e) return sum;
                    return sum + parseVal(e.cost || e.amount || e.price);
                }, 0);

                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const monthlyConverted = converted.filter(e => {
                    if (!e) return false;
                    const d = new Date(e.conversionDate || e.updatedAt || e.createdAt || e.date);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                });

                const monthlyRev = monthlyConverted.reduce((sum, e) => {
                    if (!e) return sum;
                    const val = Number(e.cost) || Number(e.amount) || Number(e.price) || 0;
                    return sum + val;
                }, 0);

                setStats({
                    totalEnquiry: enqData.length,
                    todayEnquiry: todayEnq,
                    todayFollowup: followData && Array.isArray(followData) ? followData.length : 0,
                    salesMonthly: monthlyConverted.length,
                    monthlyRevenue: monthlyRev,
                    overallSalesAmount: totalSales,
                    drops: drops,
                    new: enqData.filter(e => e && e.status === "New").length,
                    ip: enqData.filter(e => e && e.status === "In Progress").length,
                    conv: converted.length
                });
            }
            setTodayTasks(followData && Array.isArray(followData) ? followData : []);
        } catch (err) {
            console.error('HomeScreen fetchData error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
            headerLeft: () => null,
            gestureEnabled: false,
            drawerLockMode: 'locked-closed',
            swipeEnabled: false
        });
    }, [navigation]);

    useFocusEffect(useCallback(() => { fetchData(); }, []));


    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    // Calculate conversion rate
    const conversionRate = stats.totalEnquiry > 0 ? ((stats.conv / stats.totalEnquiry) * 100).toFixed(1) : 0;
    const monthlyGrowth = stats.monthlyRevenue > 0 ? "+12%" : "0%"; // Placeholder for growth calculation

    return (
        <View style={styles.container}>
            <SideMenu
                visible={showMenu}
                onClose={() => setShowMenu(false)}
                navigation={navigation}
                user={user}
                onLogout={handleLogout}
            />

            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            {/* FLOATING HEADER */}
            <LinearGradient
                colors={[COLORS.bg, COLORS.bgLight]}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.greeting}>Welcome back 👋</Text>
                            <Text style={styles.userName}>{user?.name || 'Manager'}</Text>
                        </View>
                        <TouchableOpacity style={styles.profileBtn} onPress={() => setShowMenu(true)}>
                            <LinearGradient
                                colors={COLORS.purple}
                                style={styles.profileGradient}
                            >
                                <Text style={styles.profileInitial}>
                                    {(user && user.name) ? user.name[0].toUpperCase() : 'M'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); fetchData(); }}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {/* HERO REVENUE CARD */}
                <MotiView
                    from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{ type: 'spring', damping: 15, delay: 100 }}
                >
                    <LinearGradient
                        colors={COLORS.purple}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroTop}>
                            <View>
                                <Text style={styles.heroLabel}>Total Revenue</Text>
                                <Text style={styles.heroValue}>
                                    ₹{(stats.overallSalesAmount || 0).toLocaleString('en-IN')}
                                </Text>
                                <View style={styles.heroSubRow}>
                                    <MaterialCommunityIcons name="trending-up" size={14} color="#fff" />
                                    <Text style={styles.heroGrowth}>{monthlyGrowth} this month</Text>
                                </View>
                            </View>
                            <View style={styles.heroIcon}>
                                <MaterialCommunityIcons name="cash-multiple" size={40} color="rgba(255,255,255,0.3)" />
                            </View>
                        </View>

                        <View style={styles.heroDivider} />

                        <View style={styles.heroBottom}>
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatLabel}>Monthly</Text>
                                <Text style={styles.heroStatValue}>₹{(stats.monthlyRevenue || 0).toLocaleString('en-IN')}</Text>
                            </View>
                            <View style={styles.heroDot} />
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatLabel}>Conversions</Text>
                                <Text style={styles.heroStatValue}>{stats.conv}</Text>
                            </View>
                            <View style={styles.heroDot} />
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatLabel}>Rate</Text>
                                <Text style={styles.heroStatValue}>{conversionRate}%</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </MotiView>

                {/* QUICK STATS GRID */}
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="briefcase-outline"
                        label="Total Leads"
                        value={stats.totalEnquiry}
                        gradient={COLORS.blue}
                        delay={200}
                        onPress={() => navigation.navigate("Enquiry")}
                    />
                    <StatCard
                        icon="today-outline"
                        label="Today's Leads"
                        value={stats.todayEnquiry}
                        gradient={COLORS.pink}
                        delay={250}
                    />
                    <StatCard
                        icon="calendar-outline"
                        label="Follow-ups"
                        value={stats.todayFollowup}
                        gradient={COLORS.green}
                        delay={300}
                        onPress={() => navigation.navigate("FollowUp")}
                    />
                    <StatCard
                        icon="close-circle-outline"
                        label="Dropped"
                        value={stats.drops}
                        gradient={COLORS.orange}
                        delay={350}
                    />
                </View>

                {/* PIPELINE OVERVIEW */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 400 }}
                    style={styles.section}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Pipeline Overview</Text>
                        <TouchableOpacity>
                            <Feather name="more-horizontal" size={20} color={COLORS.textDim} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pipelineGrid}>
                        <PipelineCard
                            label="New Leads"
                            value={stats.new}
                            color="#667EEA"
                            percentage={stats.totalEnquiry > 0 ? ((stats.new / stats.totalEnquiry) * 100).toFixed(0) : 0}
                        />
                        <PipelineCard
                            label="In Progress"
                            value={stats.ip}
                            color="#4ECDC4"
                            percentage={stats.totalEnquiry > 0 ? ((stats.ip / stats.totalEnquiry) * 100).toFixed(0) : 0}
                        />
                        <PipelineCard
                            label="Converted"
                            value={stats.conv}
                            color="#00D9A3"
                            percentage={stats.totalEnquiry > 0 ? ((stats.conv / stats.totalEnquiry) * 100).toFixed(0) : 0}
                        />
                        <PipelineCard
                            label="Lost"
                            value={stats.drops}
                            color="#FF5757"
                            percentage={stats.totalEnquiry > 0 ? ((stats.drops / stats.totalEnquiry) * 100).toFixed(0) : 0}
                        />
                    </View>
                </MotiView>

                {/* QUICK ACTIONS REMOVED */}

                {/* RECENT ACTIVITY */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 600 }}
                    style={styles.section}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Activity</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("FollowUp")}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {todayTasks.length > 0 ? (
                        todayTasks.slice(0, 3).map((item, idx) => (
                            <ActivityItem key={idx} item={item} delay={700 + (idx * 50)} />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="calendar-check" size={48} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>No activities scheduled for today</Text>
                        </View>
                    )}
                </MotiView>

                <View style={{ height: 40 }} />
            </ScrollView>


        </View>
    );
}

// 📊 STAT CARD COMPONENT
const StatCard = ({ icon, label, value, gradient, delay, onPress }) => (
    <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15, delay }}
        style={styles.statCard}
    >
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.statCardInner}
        >
            <View style={styles.statCardContent}>
                <View style={[styles.statIconBox, { backgroundColor: gradient[0] + '20' }]}>
                    <Ionicons name={icon} size={22} color={gradient[0]} />
                </View>
                <View style={styles.statInfo}>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statLabel}>{label}</Text>
                </View>
            </View>
        </TouchableOpacity>
    </MotiView>
);

// 🎯 PIPELINE CARD COMPONENT
const PipelineCard = ({ label, value, color, percentage }) => (
    <View style={styles.pipelineCard}>
        <View style={styles.pipelineTop}>
            <View style={[styles.pipelineDot, { backgroundColor: color }]} />
            <Text style={styles.pipelineLabel}>{label}</Text>
        </View>
        <Text style={styles.pipelineValue}>{value}</Text>
        <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.pipelinePercentage}>{percentage}%</Text>
    </View>
);

// ⚡ ACTION BUTTON COMPONENT
const ActionButton = ({ icon, label, gradient, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.actionButton} activeOpacity={0.8}>
        <LinearGradient
            colors={gradient}
            style={styles.actionGradient}
        >
            <Ionicons name={icon} size={24} color="#fff" />
        </LinearGradient>
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

// 📋 ACTIVITY ITEM COMPONENT
const ActivityItem = ({ item, delay }) => (
    <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ delay }}
    >
        <View style={styles.activityItem}>
            <View style={styles.activityLeft}>
                <LinearGradient
                    colors={COLORS.blue}
                    style={styles.activityAvatar}
                >
                    <Text style={styles.activityInitial}>
                        {item.name ? item.name[0].toUpperCase() : '?'}
                    </Text>
                </LinearGradient>
                <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>{item.name}</Text>
                    <Text style={styles.activityDetail}>
                        {item.type} • {item.time || 'Scheduled'}
                    </Text>
                </View>
            </View>
            <View style={[styles.activityBadge, { backgroundColor: COLORS.primary + '20' }]}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </View>
        </View>
    </MotiView>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingBottom: 20,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    greeting: {
        fontSize: 14,
        color: COLORS.textDim,
        fontWeight: '500',
    },
    userName: {
        fontSize: 24,
        color: COLORS.text,
        fontWeight: '800',
        marginTop: 4,
    },
    profileBtn: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    profileGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInitial: {
        fontSize: 20,
        color: '#fff',
        fontWeight: '800',
    },
    scroll: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },

    // HERO CARD
    heroCard: {
        borderRadius: 28,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    heroLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginBottom: 8,
    },
    heroValue: {
        fontSize: 36,
        color: '#fff',
        fontWeight: '900',
        letterSpacing: -1,
    },
    heroSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 6,
    },
    heroGrowth: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '700',
    },
    heroIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginVertical: 20,
    },
    heroBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    heroStat: {
        alignItems: 'center',
    },
    heroStatLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
        marginBottom: 4,
    },
    heroStatValue: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '800',
    },
    heroDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },

    // STATS GRID
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: (width - 52) / 2,
    },
    statCardInner: {
        backgroundColor: COLORS.bgCard,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        overflow: 'hidden',
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 2,
    },
    statCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    statIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statInfo: {
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        color: COLORS.text,
        fontWeight: '800',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textDim,
        fontWeight: '600',
    },

    // SECTION
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        color: COLORS.text,
        fontWeight: '800',
    },
    seeAll: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '700',
    },

    // PIPELINE
    pipelineGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    pipelineCard: {
        width: (width - 52) / 2,
        backgroundColor: COLORS.bgCard,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        padding: 16,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 2,
    },
    pipelineTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    pipelineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    pipelineLabel: {
        fontSize: 13,
        color: COLORS.textDim,
        fontWeight: '600',
    },
    pipelineValue: {
        fontSize: 28,
        color: COLORS.text,
        fontWeight: '900',
        marginBottom: 12,
    },
    progressBar: {
        height: 4,
        backgroundColor: COLORS.glass,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    pipelinePercentage: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '700',
    },

    // ACTIONS
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
    },
    actionGradient: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    actionLabel: {
        fontSize: 12,
        color: COLORS.textDim,
        fontWeight: '700',
        textAlign: 'center',
    },

    // ACTIVITY
    activityItem: {
        backgroundColor: COLORS.bgCard,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 1,
    },
    activityLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    activityAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityInitial: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '800',
    },
    activityInfo: {
        flex: 1,
    },
    activityName: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '700',
        marginBottom: 4,
    },
    activityDetail: {
        fontSize: 12,
        color: COLORS.textDim,
        fontWeight: '500',
    },
    activityBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // EMPTY STATE
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '600',
        marginTop: 12,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    fabGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // NAVIGATION MENU STYLES
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: Platform.OS === 'ios' ? 100 : 80,
        paddingRight: 20,
    },
    menuContainer: {
        backgroundColor: COLORS.bgCard,
        borderRadius: 20,
        width: 280,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
        overflow: 'hidden',
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.bgLight,
    },
    menuProfileCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuProfileInitial: {
        fontSize: 20,
        color: '#fff',
        fontWeight: '800',
    },
    menuUserInfo: {
        flex: 1,
    },
    menuUserName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    menuUserEmail: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    menuDivider: {
        height: 1,
        backgroundColor: COLORS.glassBorder,
        marginVertical: 8,
    },
    menuOptions: {
        paddingVertical: 8,
    },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    menuOptionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuOptionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    },
    menuLogout: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginBottom: 8,
    },
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
        shadowColor: '#000',
        shadowOffset: { width: -5, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 15,
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
    profileInitial: {
        fontSize: 28,
        color: '#fff',
        fontWeight: '800',
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
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    menuItemText: {
        marginLeft: 15,
        fontSize: 15,
        fontWeight: "700",
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.glassBorder,
        marginVertical: 12,
        marginHorizontal: 14,
    },
    logoSection: {
        marginTop: 30,
        paddingTop: 20,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: COLORS.glassBorder,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    logoText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginTop: 8,
    },
    logoSubtext: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    logoIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
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
        color: COLORS.textMuted,
        fontWeight: '500',
    },
});
