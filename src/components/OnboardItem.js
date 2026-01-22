import { View, StyleSheet, Image, Animated, Dimensions } from "react-native"; // eslint-disable-line no-unused-vars

const { width } = Dimensions.get("window");

export default function OnboardItem({ item, scrollX, index }) {
    // 1. Parallax Calculation for Image
    // The image moves slower than the text to create depth
    const inputRange = [
        (index - 1) * width,
        index * width,
        (index + 1) * width,
    ];

    const translateImage = scrollX.interpolate({
        inputRange,
        outputRange: [width * 0.3, 0, -width * 0.3], // Image moves 30% less than screen
    });

    const opacityText = scrollX.interpolate({
        inputRange,
        outputRange: [0, 1, 0], // Text fades in/out based on scroll
    });

    const translateYText = scrollX.interpolate({
        inputRange,
        outputRange: [20, 0, 20], // Text moves up slightly when active
    });

    return (
        <View style={styles.container}>
            {/* Hero Image with Parallax */}
            <View style={styles.imageWrapper}>
                <Animated.Image
                    source={item.image}
                    style={[
                        styles.image,
                        {
                            transform: [{ translateX: translateImage }],
                        },
                    ]}
                    resizeMode="cover"
                />
                {/* Inner Gradient Overlay for better text contrast if needed */}
                <View style={styles.imageOverlay} />
            </View>

            {/* Text Content (Bottom) */}
            <View style={styles.textContainer}>
                <Animated.Text
                    style={[
                        styles.title,
                        {
                            opacity: opacityText,
                            transform: [{ translateY: translateYText }],
                        },
                    ]}>
                    {item.title}
                </Animated.Text>

                <Animated.Text
                    style={[
                        styles.subtitle,
                        {
                            opacity: opacityText,
                            transform: [{ translateY: translateYText }],
                        },
                    ]}>
                    {item.subtitle}
                </Animated.Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width, // Full screen width
        height: Dimensions.get("window").height,
        justifyContent: "center",
        alignItems: "center",
        // Padding bottom for the button area
        paddingBottom: 100,
    },
    imageWrapper: {
        width: "80%",
        height: "35%",
        borderRadius: 40, // Very modern "Card" look
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 15,
        marginTop: 50,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    image: {
        width: "100%", // Wider than container for parallax effect
        height: "100%",
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.1)", // Slight darkening
    },
    textContainer: {
        width: "85%",
        alignItems: "center", // Centered text
        marginTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 16,
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#A0A0A0",
        textAlign: "center",
        lineHeight: 24,
        fontWeight: "500",
    },
});
