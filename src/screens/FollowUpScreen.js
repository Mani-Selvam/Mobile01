import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Modal,
    TextInput,
    Alert,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function FollowUpScreen() {
    // Sample data - in real app, this comes from context or props
    const [followUps, setFollowUps] = useState([
        {
            id: "1",
            enquiryId: "ENQ123456",
            customerName: "John Doe",
            mobileNumber: "9876543210",
            productName: "Solar Panel",
            date: "2024-01-25",
            time: "14:30",
            type: "Call",
            remarks: "Customer interested, asked for price quote",
            nextAction: "Interested",
            status: "Pending",
            createdAt: "2024-01-22T10:00:00Z",
        },
        {
            id: "2",
            enquiryId: "ENQ123457",
            customerName: "Jane Smith",
            mobileNumber: "9876543211",
            productName: "Water Pump",
            date: "2024-01-23",
            time: "10:00",
            type: "Visit",
            remarks: "Site survey completed, final discussion scheduled",
            nextAction: "Converted",
            status: "Completed",
            createdAt: "2024-01-20T09:00:00Z",
        },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [selectedFollowUp, setSelectedFollowUp] = useState(null);
    const [newFollowUp, setNewFollowUp] = useState({
        customerName: "",
        mobileNumber: "",
        productName: "",
        date: "",
        time: "",
        type: "Call",
        remarks: "",
        nextAction: "Interested",
    });

    const addFollowUp = () => {
        if (
            !newFollowUp.customerName ||
            !newFollowUp.date ||
            !newFollowUp.remarks
        ) {
            Alert.alert("Validation Error", "Please fill all required fields");
            return;
        }

        const followUp = {
            id: Date.now().toString(),
            enquiryId: `ENQ${Date.now().toString().slice(-6)}`,
            ...newFollowUp,
            status: "Pending",
            createdAt: new Date().toISOString(),
        };

        setFollowUps([followUp, ...followUps]);
        Alert.alert("Success", "Follow-up added successfully!");
        resetForm();
        setShowForm(false);
    };

    const resetForm = () => {
        setNewFollowUp({
            customerName: "",
            mobileNumber: "",
            productName: "",
            date: "",
            time: "",
            type: "Call",
            remarks: "",
            nextAction: "Interested",
        });
    };

    const markCompleted = (id) => {
        setFollowUps(
            followUps.map((fu) =>
                fu.id === id ? { ...fu, status: "Completed" } : fu,
            ),
        );
        Alert.alert("Success", "Follow-up marked as completed!");
    };

    const deleteFollowUp = (id) => {
        Alert.alert(
            "Delete Follow-up",
            "Are you sure you want to delete this follow-up?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {
                        setFollowUps(followUps.filter((fu) => fu.id !== id));
                        Alert.alert(
                            "Success",
                            "Follow-up deleted successfully!",
                        );
                    },
                    style: "destructive",
                },
            ],
        );
    };

    const DropdownComponent = ({ label, options, value, onChange }) => (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{value}</Text>
                <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color="#667eea"
                />
            </View>
        </View>
    );

    const renderFollowUp = ({ item }) => (
        <LinearGradient
            colors={
                item.status === "Pending"
                    ? ["rgba(255,193,7,0.1)", "rgba(255,152,0,0.1)"]
                    : ["rgba(40,167,69,0.1)", "rgba(34,197,94,0.1)"]
            }
            style={styles.followUpItem}>
            <TouchableOpacity
                onPress={() => setSelectedFollowUp(item)}
                style={styles.followUpContent}>
                <View style={styles.followUpHeader}>
                    <MaterialCommunityIcons
                        name={
                            item.type === "Call"
                                ? "phone"
                                : item.type === "WhatsApp"
                                  ? "whatsapp"
                                  : item.type === "Visit"
                                    ? "home"
                                    : item.type === "Demo"
                                      ? "presentation"
                                      : "chat"
                        }
                        size={24}
                        color={
                            item.status === "Pending" ? "#ffc107" : "#28a745"
                        }
                    />
                    <View style={styles.headerContent}>
                        <Text style={styles.customerName}>
                            {item.customerName}
                        </Text>
                        <Text style={styles.enquiryId}>{item.enquiryId}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color:
                                        item.status === "Pending"
                                            ? "#ffc107"
                                            : "#28a745",
                                },
                            ]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.followUpDetails}>
                    <View style={styles.detailRow}>
                        <MaterialIcons
                            name="date-range"
                            size={16}
                            color="#a0a0a0"
                        />
                        <Text style={styles.detailText}>
                            {item.date}
                            {item.time && ` • ${item.time}`}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <MaterialIcons
                            name="shopping-bag"
                            size={16}
                            color="#a0a0a0"
                        />
                        <Text style={styles.detailText}>
                            {item.productName}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <MaterialIcons name="phone" size={16} color="#a0a0a0" />
                        <Text style={styles.detailText}>
                            {item.mobileNumber}
                        </Text>
                    </View>
                    {item.remarks && (
                        <View style={styles.detailRow}>
                            <MaterialIcons
                                name="note"
                                size={16}
                                color="#a0a0a0"
                            />
                            <Text
                                style={[styles.detailText, styles.remarksText]}>
                                {item.remarks}
                            </Text>
                        </View>
                    )}
                    <View style={styles.actionRow}>
                        <View style={styles.actionBadge}>
                            <Text style={styles.actionLabel}>
                                Next: {item.nextAction}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            <View style={styles.followUpActions}>
                {item.status === "Pending" && (
                    <LinearGradient
                        colors={["#28a745", "#20c997"]}
                        style={styles.actionButtonGradient}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => markCompleted(item.id)}>
                            <MaterialIcons
                                name="check"
                                size={18}
                                color="#fff"
                            />
                            <Text style={styles.actionButtonText}>
                                Mark Done
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                )}
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteFollowUp(item.id)}>
                    <MaterialIcons name="delete" size={18} color="#ff6b6b" />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );

    return (
        <LinearGradient
            colors={["#0f0f23", "#1a1a2e", "#16213e"]}
            style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View
                    entering={FadeInUp.delay(100)}
                    style={styles.headerSection}>
                    <MaterialCommunityIcons
                        name="calendar-check"
                        size={32}
                        color="#667eea"
                        style={styles.headerIcon}
                    />
                    <Text style={styles.title}>Follow-Up Management</Text>
                    <Text style={styles.subtitle}>
                        Track and manage all follow-ups
                    </Text>
                </Animated.View>

                {/* Add New Follow-up Button */}
                <Animated.View
                    entering={FadeInUp.delay(150)}
                    style={styles.buttonContainer}>
                    <LinearGradient
                        colors={["#667eea", "#764ba2"]}
                        style={styles.addButtonGradient}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setShowForm(true)}>
                            <MaterialCommunityIcons
                                name="plus"
                                size={24}
                                color="#fff"
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.addButtonText}>
                                New Follow-up
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                {/* Follow-ups List */}
                <Animated.View
                    entering={FadeInUp.delay(200)}
                    style={styles.listContainer}>
                    {followUps.length > 0 ? (
                        <>
                            <View style={styles.listHeader}>
                                <Text style={styles.listTitle}>
                                    All Follow-ups ({followUps.length})
                                </Text>
                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>
                                            Pending
                                        </Text>
                                        <Text style={styles.statValue}>
                                            {
                                                followUps.filter(
                                                    (fu) =>
                                                        fu.status === "Pending",
                                                ).length
                                            }
                                        </Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>
                                            Completed
                                        </Text>
                                        <Text style={styles.statValue}>
                                            {
                                                followUps.filter(
                                                    (fu) =>
                                                        fu.status ===
                                                        "Completed",
                                                ).length
                                            }
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <FlatList
                                data={followUps}
                                renderItem={renderFollowUp}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                                style={styles.list}
                            />
                        </>
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons
                                name="calendar-blank"
                                size={48}
                                color="#667eea"
                            />
                            <Text style={styles.emptyStateText}>
                                No follow-ups yet
                            </Text>
                            <Text style={styles.emptyStateSubtext}>
                                Click "New Follow-up" to add one
                            </Text>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>

            {/* Add Follow-up Modal */}
            <Modal
                visible={showForm}
                transparent
                animationType="slide"
                onRequestClose={() => setShowForm(false)}>
                <LinearGradient
                    colors={["#0f0f23", "#1a1a2e", "#16213e"]}
                    style={styles.modalContainer}>
                    <ScrollView style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setShowForm(false);
                                resetForm();
                            }}>
                            <MaterialIcons
                                name="close"
                                size={28}
                                color="#fff"
                            />
                        </TouchableOpacity>

                        <Animated.View
                            entering={FadeInUp.delay(100)}
                            style={styles.formContainer}>
                            <View style={styles.formHeader}>
                                <MaterialCommunityIcons
                                    name="calendar-clock"
                                    size={32}
                                    color="#667eea"
                                    style={styles.formHeaderIcon}
                                />
                                <Text style={styles.formTitle}>
                                    Add New Follow-up
                                </Text>
                            </View>

                            {/* Customer Name */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>
                                    Customer Name{" "}
                                    <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputContainer}>
                                    <MaterialIcons
                                        name="person"
                                        size={20}
                                        color="#667eea"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter customer name"
                                        placeholderTextColor="#a0a0a0"
                                        value={newFollowUp.customerName}
                                        onChangeText={(text) =>
                                            setNewFollowUp({
                                                ...newFollowUp,
                                                customerName: text,
                                            })
                                        }
                                    />
                                </View>
                            </View>

                            {/* Mobile Number */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>
                                    Mobile Number{" "}
                                    <Text style={styles.optional}>
                                        (Optional)
                                    </Text>
                                </Text>
                                <View style={styles.inputContainer}>
                                    <MaterialIcons
                                        name="phone"
                                        size={20}
                                        color="#667eea"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter mobile number"
                                        placeholderTextColor="#a0a0a0"
                                        value={newFollowUp.mobileNumber}
                                        onChangeText={(text) =>
                                            setNewFollowUp({
                                                ...newFollowUp,
                                                mobileNumber: text,
                                            })
                                        }
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>

                            {/* Product Name */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>
                                    Product Name{" "}
                                    <Text style={styles.optional}>
                                        (Optional)
                                    </Text>
                                </Text>
                                <View style={styles.inputContainer}>
                                    <MaterialIcons
                                        name="shopping-bag"
                                        size={20}
                                        color="#667eea"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter product name"
                                        placeholderTextColor="#a0a0a0"
                                        value={newFollowUp.productName}
                                        onChangeText={(text) =>
                                            setNewFollowUp({
                                                ...newFollowUp,
                                                productName: text,
                                            })
                                        }
                                    />
                                </View>
                            </View>

                            {/* Date */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>
                                    Follow-up Date{" "}
                                    <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputContainer}>
                                    <MaterialIcons
                                        name="event"
                                        size={20}
                                        color="#667eea"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor="#a0a0a0"
                                        value={newFollowUp.date}
                                        onChangeText={(text) =>
                                            setNewFollowUp({
                                                ...newFollowUp,
                                                date: text,
                                            })
                                        }
                                    />
                                </View>
                            </View>

                            {/* Time */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>
                                    Follow-up Time{" "}
                                    <Text style={styles.optional}>
                                        (Optional)
                                    </Text>
                                </Text>
                                <View style={styles.inputContainer}>
                                    <MaterialIcons
                                        name="access-time"
                                        size={20}
                                        color="#667eea"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="HH:MM"
                                        placeholderTextColor="#a0a0a0"
                                        value={newFollowUp.time}
                                        onChangeText={(text) =>
                                            setNewFollowUp({
                                                ...newFollowUp,
                                                time: text,
                                            })
                                        }
                                    />
                                </View>
                            </View>

                            {/* Type */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Follow-up Type</Text>
                                <View style={styles.typeSelector}>
                                    {[
                                        "Call",
                                        "WhatsApp",
                                        "Visit",
                                        "Demo",
                                        "Discussion",
                                    ].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeOption,
                                                newFollowUp.type === type &&
                                                    styles.typeOptionActive,
                                            ]}
                                            onPress={() =>
                                                setNewFollowUp({
                                                    ...newFollowUp,
                                                    type,
                                                })
                                            }>
                                            <Text
                                                style={[
                                                    styles.typeOptionText,
                                                    newFollowUp.type === type &&
                                                        styles.typeOptionTextActive,
                                                ]}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Remarks */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>
                                    Remarks / Discussion Notes{" "}
                                    <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputContainer}>
                                    <MaterialIcons
                                        name="note"
                                        size={20}
                                        color="#667eea"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[
                                            styles.input,
                                            styles.multilineInput,
                                        ]}
                                        placeholder="What was discussed..."
                                        placeholderTextColor="#a0a0a0"
                                        value={newFollowUp.remarks}
                                        onChangeText={(text) =>
                                            setNewFollowUp({
                                                ...newFollowUp,
                                                remarks: text,
                                            })
                                        }
                                        multiline
                                        numberOfLines={4}
                                    />
                                </View>
                            </View>

                            {/* Next Action */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Next Action</Text>
                                <View style={styles.typeSelector}>
                                    {[
                                        "Interested",
                                        "Need Time",
                                        "Not Interested",
                                        "Converted",
                                    ].map((action) => (
                                        <TouchableOpacity
                                            key={action}
                                            style={[
                                                styles.typeOption,
                                                newFollowUp.nextAction ===
                                                    action &&
                                                    styles.typeOptionActive,
                                            ]}
                                            onPress={() =>
                                                setNewFollowUp({
                                                    ...newFollowUp,
                                                    nextAction: action,
                                                })
                                            }>
                                            <Text
                                                style={[
                                                    styles.typeOptionText,
                                                    newFollowUp.nextAction ===
                                                        action &&
                                                        styles.typeOptionTextActive,
                                                ]}>
                                                {action}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.formButtons}>
                                <LinearGradient
                                    colors={["#667eea", "#764ba2"]}
                                    style={[
                                        styles.formButtonGradient,
                                        styles.flex1,
                                    ]}>
                                    <TouchableOpacity
                                        style={styles.formButton}
                                        onPress={addFollowUp}>
                                        <MaterialIcons
                                            name="save"
                                            size={20}
                                            color="#fff"
                                            style={styles.buttonIcon}
                                        />
                                        <Text style={styles.formButtonText}>
                                            Save Follow-up
                                        </Text>
                                    </TouchableOpacity>
                                </LinearGradient>

                                <LinearGradient
                                    colors={["#ff6b6b", "#cc0000"]}
                                    style={[
                                        styles.formButtonGradient,
                                        styles.flex1,
                                    ]}>
                                    <TouchableOpacity
                                        style={styles.formButton}
                                        onPress={() => {
                                            setShowForm(false);
                                            resetForm();
                                        }}>
                                        <MaterialIcons
                                            name="close"
                                            size={20}
                                            color="#fff"
                                            style={styles.buttonIcon}
                                        />
                                        <Text style={styles.formButtonText}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </LinearGradient>
            </Modal>

            {/* Follow-up Detail Modal */}
            <Modal
                visible={selectedFollowUp !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedFollowUp(null)}>
                <View style={styles.detailOverlay}>
                    <LinearGradient
                        colors={["#0f0f23", "#1a1a2e"]}
                        style={styles.detailCard}>
                        <TouchableOpacity
                            style={styles.detailCloseButton}
                            onPress={() => setSelectedFollowUp(null)}>
                            <MaterialIcons
                                name="close"
                                size={28}
                                color="#fff"
                            />
                        </TouchableOpacity>

                        {selectedFollowUp && (
                            <ScrollView style={styles.detailContent}>
                                <View style={styles.detailHeader}>
                                    <Text style={styles.detailTitle}>
                                        Follow-up Details
                                    </Text>
                                </View>

                                <View style={styles.detailItemContainer}>
                                    <View style={styles.detailItemRow}>
                                        <Text style={styles.detailItemLabel}>
                                            Enquiry ID
                                        </Text>
                                        <Text style={styles.detailItemValue}>
                                            {selectedFollowUp.enquiryId}
                                        </Text>
                                    </View>

                                    <View style={styles.detailItemRow}>
                                        <Text style={styles.detailItemLabel}>
                                            Customer
                                        </Text>
                                        <Text style={styles.detailItemValue}>
                                            {selectedFollowUp.customerName}
                                        </Text>
                                    </View>

                                    <View style={styles.detailItemRow}>
                                        <Text style={styles.detailItemLabel}>
                                            Mobile
                                        </Text>
                                        <Text style={styles.detailItemValue}>
                                            {selectedFollowUp.mobileNumber}
                                        </Text>
                                    </View>

                                    <View style={styles.detailItemRow}>
                                        <Text style={styles.detailItemLabel}>
                                            Product
                                        </Text>
                                        <Text style={styles.detailItemValue}>
                                            {selectedFollowUp.productName}
                                        </Text>
                                    </View>

                                    <View style={styles.detailItemRow}>
                                        <Text style={styles.detailItemLabel}>
                                            Date & Time
                                        </Text>
                                        <Text style={styles.detailItemValue}>
                                            {selectedFollowUp.date}
                                            {selectedFollowUp.time &&
                                                ` ${selectedFollowUp.time}`}
                                        </Text>
                                    </View>

                                    <View style={styles.detailItemRow}>
                                        <Text style={styles.detailItemLabel}>
                                            Type
                                        </Text>
                                        <Text style={styles.detailItemValue}>
                                            {selectedFollowUp.type}
                                        </Text>
                                    </View>

                                    <View style={styles.detailItemRow}>
                                        <Text style={styles.detailItemLabel}>
                                            Next Action
                                        </Text>
                                        <Text style={styles.detailItemValue}>
                                            {selectedFollowUp.nextAction}
                                        </Text>
                                    </View>

                                    <View style={styles.detailItemRow}>
                                        <Text style={styles.detailItemLabel}>
                                            Status
                                        </Text>
                                        <View
                                            style={[
                                                styles.statusBadgeDetail,
                                                {
                                                    backgroundColor:
                                                        selectedFollowUp.status ===
                                                        "Pending"
                                                            ? "rgba(255,193,7,0.2)"
                                                            : "rgba(40,167,69,0.2)",
                                                },
                                            ]}>
                                            <Text
                                                style={{
                                                    color:
                                                        selectedFollowUp.status ===
                                                        "Pending"
                                                            ? "#ffc107"
                                                            : "#28a745",
                                                    fontWeight: "600",
                                                }}>
                                                {selectedFollowUp.status}
                                            </Text>
                                        </View>
                                    </View>

                                    {selectedFollowUp.remarks && (
                                        <View
                                            style={[
                                                styles.detailItemRow,
                                                styles.remarksContainer,
                                            ]}>
                                            <Text
                                                style={styles.detailItemLabel}>
                                                Discussion Notes
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.detailItemValue,
                                                    styles.remarksValue,
                                                ]}>
                                                {selectedFollowUp.remarks}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </LinearGradient>
                </View>
            </Modal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    // Container
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },

    // Header Section
    headerSection: {
        alignItems: "center",
        marginBottom: 32,
        paddingVertical: 16,
    },
    headerIcon: {
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#a0a0a0",
        textAlign: "center",
    },

    // Button Container
    buttonContainer: {
        marginBottom: 24,
    },
    addButtonGradient: {
        borderRadius: 12,
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    addButton: {
        height: 52,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },

    // List Container
    listContainer: {
        marginBottom: 32,
    },
    listHeader: {
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    statItem: {
        flex: 1,
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 6,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(102, 126, 234, 0.2)",
    },
    statLabel: {
        fontSize: 12,
        color: "#a0a0a0",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#667eea",
    },
    list: {
        flex: 1,
    },

    // Empty State
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        marginTop: 16,
        textAlign: "center",
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#a0a0a0",
        marginTop: 8,
        textAlign: "center",
    },

    // Follow-up Item
    followUpItem: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        overflow: "hidden",
    },
    followUpContent: {
        marginBottom: 12,
    },
    followUpHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    headerContent: {
        flex: 1,
        marginLeft: 12,
    },
    customerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 2,
    },
    enquiryId: {
        fontSize: 12,
        color: "#a0a0a0",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },

    // Follow-up Details
    followUpDetails: {
        marginLeft: 36,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    detailText: {
        fontSize: 13,
        color: "#a0a0a0",
        marginLeft: 8,
        flex: 1,
    },
    remarksText: {
        color: "#b0b0b0",
        fontStyle: "italic",
    },
    actionRow: {
        flexDirection: "row",
        marginTop: 8,
    },
    actionBadge: {
        backgroundColor: "rgba(102, 126, 234, 0.2)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(102, 126, 234, 0.4)",
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#667eea",
    },

    // Follow-up Actions
    followUpActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
    },
    actionButtonGradient: {
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
    },
    actionButton: {
        height: 40,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 6,
    },
    deleteButton: {
        width: 44,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        backgroundColor: "rgba(255,107,107,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,107,107,0.2)",
    },

    // Modal
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalContent: {
        flex: 1,
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    closeButton: {
        alignSelf: "flex-end",
        padding: 12,
        marginBottom: 12,
    },
    formContainer: {
        marginBottom: 24,
    },
    formHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    formHeaderIcon: {
        marginRight: 12,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff",
    },

    // Form Fields
    fieldGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 8,
    },
    required: {
        color: "#ff6b6b",
        fontWeight: "700",
    },
    optional: {
        color: "#a0a0a0",
        fontWeight: "400",
        fontSize: 12,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(102, 126, 234, 0.2)",
        paddingHorizontal: 12,
        height: 44,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    multilineInput: {
        height: 120,
        paddingVertical: 12,
        textAlignVertical: "top",
    },

    // Type/Action Selector
    typeSelector: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    typeOption: {
        flex: 1,
        minWidth: "45%",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(102, 126, 234, 0.2)",
        backgroundColor: "rgba(102, 126, 234, 0.05)",
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    typeOptionActive: {
        backgroundColor: "rgba(102, 126, 234, 0.3)",
        borderColor: "rgba(102, 126, 234, 0.6)",
    },
    typeOptionText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#a0a0a0",
    },
    typeOptionTextActive: {
        color: "#667eea",
    },

    // Form Buttons
    formButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
    },
    flex1: {
        flex: 1,
    },
    formButtonGradient: {
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    formButton: {
        height: 44,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    formButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 8,
    },
    buttonIcon: {
        marginRight: 0,
    },

    // Detail Modal
    detailOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    detailCard: {
        borderRadius: 16,
        padding: 20,
        maxHeight: "80%",
        width: "100%",
        borderWidth: 1,
        borderColor: "rgba(102, 126, 234, 0.2)",
    },
    detailCloseButton: {
        alignSelf: "flex-end",
        padding: 8,
        marginBottom: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailHeader: {
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    detailTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    detailItemContainer: {
        gap: 12,
    },
    detailItemRow: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: "rgba(102, 126, 234, 0.05)",
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#667eea",
    },
    detailItemLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#a0a0a0",
        marginBottom: 4,
        textTransform: "uppercase",
    },
    detailItemValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#fff",
    },
    statusBadgeDetail: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginTop: 4,
    },
    remarksContainer: {
        borderLeftColor: "#764ba2",
    },
    remarksValue: {
        fontStyle: "italic",
        color: "#e0e0e0",
        lineHeight: 20,
    },
});
