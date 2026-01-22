import React, { useRef, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    FlatList,
    Dimensions,
    StatusBar,
} from "react-native";
import OnboardItem from "../components/OnboardItem";
import { useAuth } from "../contexts/AuthContext";

const { width, height } = Dimensions.get("window");

const DATA = [
    {
        title: "Welcome to MyApp",
        subtitle:
            "Experience the next generation of digital interaction designed for you.",
        image: require("../assets/onboard1.jpg"),
    },
    {
        title: "Stay Connected",
        subtitle:
            "Seamless communication with your network anytime, anywhere in the world.",
        image: require("../assets/onboard2.jpg"),
    },
    {
        title: "Get Started Now",
        subtitle:
            "Join millions of users and unlock your full potential today.",
        image: require("../assets/onboard3.jpg"),
    },
];

export default function OnboardingScreen({ navigation }) {
    const { isLoggedIn, completeOnboarding } = useAuth();
    const flatListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);

    // Handle the "Next" button click - animates to next slide
    const viewableItemsChanged = useRef(({ viewableItems }) => {
        setCurrentIndex(viewableItems[0]?.index ?? 0);
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    // Scroll to next index
    const scrollTo = useCallback(async () => {
        if (currentIndex < DATA.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            await completeOnboarding();
            if (isLoggedIn) {
                navigation.replace("Main");
            } else {
                navigation.replace("Login");
            }
        }
    }, [currentIndex, navigation, completeOnboarding, isLoggedIn]);

    const handleSkip = async () => {
        await completeOnboarding();
        if (isLoggedIn) {
            navigation.replace("Main");
        } else {
            navigation.replace("Login");
        }
    };

    // Render Item for FlatList
    const renderItem = useCallback(
        ({ item, index }) => {
            return <OnboardItem item={item} index={index} scrollX={scrollX} />;
        },
        [scrollX]
    );

    // --- Pagination Dots Logic ---
    // This makes the dots grow and change color smoothly based on scroll position
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* --- CORNER DESIGN DECORATIONS --- */}
            {/* Top Left Blob */}
            <View style={[styles.blob, styles.topLeft]} />
            {/* Bottom Right Blob */}
            <View style={[styles.blob, styles.bottomRight]} />

            {/* Background Gradient Overlay to soften corners */}
            <View style={styles.bgOverlay} />

            {/* --- CONTENT --- */}
            <View style={styles.flatListContainer}>
                <FlatList
                    data={DATA}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.title}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false } // Native driver false for width interpolation
                    )}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={flatListRef}
                />
            </View>

            {/* --- BOTTOM CONTROLS --- */}
            <View style={styles.controlsContainer}>
                {/* Animated Dots */}
                <View style={styles.dotsContainer}>
                    {DATA.map((_, i) => {
                        const inputRange = [
                            (i - 1) * width,
                            i * width,
                            (i + 1) * width,
                        ];

                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 24, 8], // Small, Wide (Active), Small
                            extrapolate: "clamp",
                        });

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: "clamp",
                        });

                        const backgroundColor = scrollX.interpolate({
                            inputRange,
                            outputRange: ["#555", "#FFFFFF", "#555"], // Grey -> White -> Grey
                            extrapolate: "clamp",
                        });

                        return (
                            <Animated.View
                                key={`dot-${i}`}
                                style={[
                                    styles.dot,
                                    {
                                        width: dotWidth,
                                        opacity: opacity,
                                        backgroundColor,
                                    },
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Skip / Next Button */}
                <View style={styles.buttonContainer}>
                    {currentIndex !== DATA.length - 1 ? (
                        <TouchableOpacity
                            style={styles.skipBtn}
                            onPress={handleSkip}>
                            <Text style={styles.skipText}>SKIP</Text>
                        </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity
                        style={styles.nextBtn}
                        onPress={scrollTo}
                        activeOpacity={0.8}>
                        <Text style={styles.nextText}>
                            {currentIndex === DATA.length - 1
                                ? "FINISH"
                                : "NEXT"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f0f23", // Dark blue-black
        alignItems: "center",
        justifyContent: "center",
    },
    // The Corner Design Blobs
    blob: {
        position: "absolute",
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        opacity: 0.3,
        zIndex: 0,
    },
    topLeft: {
        top: -height * 0.1,
        left: -width * 0.1,
        backgroundColor: "#667eea", // Modern purple-blue
    },
    bottomRight: {
        bottom: -height * 0.1,
        right: -width * 0.1,
        backgroundColor: "#764ba2", // Modern purple
    },
    bgOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 15, 35, 0.8)", // Dark overlay
        zIndex: 1,
    },
    flatListContainer: {
        flex: 1,
        width: "100%",
        zIndex: 2, // Above background blobs
    },
    controlsContainer: {
        position: "absolute",
        bottom: height * 0.05,
        width: "100%",
        paddingHorizontal: width * 0.08,
        zIndex: 10,
        alignItems: "center",
    },
    dotsContainer: {
        flexDirection: "row",
        height: 10,
        marginBottom: height * 0.05,
        alignItems: "center",
        justifyContent: "center",
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 6,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonContainer: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
    },
    skipBtn: {
        padding: height * 0.015,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: height * 0.03,
        minWidth: width * 0.2,
        alignItems: "center",
    },
    skipText: {
        color: "#a0a0a0",
        fontSize: width * 0.035,
        fontWeight: "600",
        letterSpacing: 1,
    },
    nextBtn: {
        flex: 1,
        marginLeft: width * 0.05,
        height: height * 0.08,
        borderRadius: height * 0.04,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "#667eea",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    nextText: {
        color: "#667eea",
        fontSize: width * 0.04,
        fontWeight: "700",
        letterSpacing: 1,
    },
});
