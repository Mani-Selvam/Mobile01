import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ScrollView,
    Alert,
    Modal,
    Platform,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createEnquiry,
    getAllEnquiries,
    deleteEnquiry,
    updateEnquiry,
} from "../services/enquiryService";

export default function EnquiryScreen() {
    const { isLoggedIn } = useAuth();
    const [enquiries, setEnquiries] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState("Agent");
    const [showForm, setShowForm] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingEnquiries, setLoadingEnquiries] = useState(true);
    const [editingEnquiry, setEditingEnquiry] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [followUps, setFollowUps] = useState([]);
    const [showFollowUpForm, setShowFollowUpForm] = useState(false);
    const [newFollowUp, setNewFollowUp] = useState({
        date: "",
        remarks: "",
        outcome: "",
    });

    const [newEnquiry, setNewEnquiry] = useState({
        enquiryNumber: "",
        enquiryType: "Product Inquiry",
        leadSource: "Walk-in",
        customerName: "",
        address: "",
        mobileNumber: "",
        alternateMobileNumber: "",
        productName: "",
        productCost: "",
        paymentMethod: "Cash",
        enquiryDate: new Date().toISOString().split("T")[0],
        enquiryTakenBy: "",
        remarks: "",
        followUpRequired: "No",
        nextFollowUpDate: "",
        enquiryStatus: "New",
    });

    // Generate unique enquiry number
    const generateEnquiryNumber = () => {
        const timestamp = Date.now().toString().slice(-6);
        return `ENQ${timestamp}`;
    };

    // Load logged-in user info and fetch enquiries
    useEffect(() => {
        const loadUserInfoAndEnquiries = async () => {
            try {
                const userStr = await AsyncStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setLoggedInUser(user.name || "Agent");
                    setNewEnquiry((prev) => ({
                        ...prev,
                        enquiryTakenBy: user.name || "Agent",
                    }));
                }
                // Fetch enquiries from API
                await fetchEnquiries();
            } catch (error) {
                console.log("Error loading user info:", error);
            } finally {
                setLoadingEnquiries(false);
            }
        };
        loadUserInfoAndEnquiries();
    }, []);

    // Fetch enquiries from database
    const fetchEnquiries = async () => {
        try {
            setLoadingEnquiries(true);
            const response = await getAllEnquiries();
            setEnquiries(response.enquiries || []);
        } catch (error) {
            console.error("Error fetching enquiries:", error);
            Alert.alert("Error", "Failed to load enquiries");
        } finally {
            setLoadingEnquiries(false);
        }
    };

    const saveEnquiry = async () => {
        // Validation for required fields
        if (
            !newEnquiry.customerName ||
            !newEnquiry.mobileNumber ||
            !newEnquiry.productName ||
            !newEnquiry.productCost
        ) {
            Alert.alert(
                "Validation Error",
                "Please fill in all required fields: Customer Name, Mobile Number, Product Name, and Product Cost",
            );
            return;
        }

        try {
            setLoading(true);
            const enquiryNumber = generateEnquiryNumber();
            const enquiryData = {
                ...newEnquiry,
                enquiryNumber: enquiryNumber,
                enquiryTakenBy: loggedInUser,
            };

            // Save to database
            const response = await createEnquiry(enquiryData);

            // Add to local state
            setEnquiries([...enquiries, response.enquiry]);
            Alert.alert("Success", "Enquiry saved successfully!");
            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error("Save enquiry error:", error);
            Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to save enquiry",
            );
        } finally {
            setLoading(false);
        }
    };

    const saveAndAddFollowUp = async () => {
        if (
            !newEnquiry.customerName ||
            !newEnquiry.mobileNumber ||
            !newEnquiry.productName ||
            !newEnquiry.productCost
        ) {
            Alert.alert(
                "Validation Error",
                "Please fill in all required fields first",
            );
            return;
        }

        try {
            setLoading(true);
            const enquiryNumber = generateEnquiryNumber();
            const enquiryData = {
                ...newEnquiry,
                enquiryNumber: enquiryNumber,
                enquiryTakenBy: loggedInUser,
            };

            // Save to database
            const response = await createEnquiry(enquiryData);

            // Add to local state
            setEnquiries([...enquiries, response.enquiry]);
            Alert.alert("Success", "Enquiry saved! Now add follow-up details.");
            resetForm();
            setShowForm(false);
            // Navigate to follow-up screen (implement based on your navigation structure)
        } catch (error) {
            console.error("Save and add follow-up error:", error);
            Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to save enquiry",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEnquiry = async (enquiryId) => {
        try {
            Alert.alert(
                "Delete Enquiry",
                "Are you sure you want to delete this enquiry?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        onPress: async () => {
                            try {
                                setLoading(true);
                                await deleteEnquiry(enquiryId);
                                setEnquiries(
                                    enquiries.filter((e) => e.id !== enquiryId),
                                );
                                Alert.alert(
                                    "Success",
                                    "Enquiry deleted successfully!",
                                );
                            } catch (error) {
                                Alert.alert(
                                    "Error",
                                    "Failed to delete enquiry",
                                );
                            } finally {
                                setLoading(false);
                            }
                        },
                        style: "destructive",
                    },
                ],
            );
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleEditEnquiry = (enquiry) => {
        setEditingEnquiry(enquiry);
        setNewEnquiry(enquiry);
        setShowEditForm(true);
        setShowForm(false);
    };

    const handleUpdateEnquiry = async () => {
        if (
            !newEnquiry.customerName ||
            !newEnquiry.mobileNumber ||
            !newEnquiry.productName ||
            !newEnquiry.productCost
        ) {
            Alert.alert(
                "Validation Error",
                "Please fill in all required fields",
            );
            return;
        }

        try {
            setLoading(true);
            // Update in database
            const response = await updateEnquiry(editingEnquiry.id, newEnquiry);

            // Update local state
            const updatedEnquiries = enquiries.map((e) =>
                e.id === editingEnquiry.id ? response.enquiry : e,
            );
            setEnquiries(updatedEnquiries);

            Alert.alert("Success", "Enquiry updated successfully!");
            resetForm();
            setShowEditForm(false);
            setEditingEnquiry(null);
        } catch (error) {
            console.error("Update enquiry error:", error);
            Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to update enquiry",
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewEnquiry({
            enquiryNumber: "",
            enquiryType: "Product Inquiry",
            leadSource: "Walk-in",
            customerName: "",
            address: "",
            mobileNumber: "",
            alternateMobileNumber: "",
            productName: "",
            productCost: "",
            paymentMethod: "Cash",
            enquiryDate: new Date().toISOString().split("T")[0],
            enquiryTakenBy: loggedInUser,
            remarks: "",
            followUpRequired: "No",
            nextFollowUpDate: "",
            enquiryStatus: "New",
        });
    };

    const toggleDropdown = (field) => {
        setDropdownOpen((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    // Follow-up functions
    const addFollowUp = () => {
        if (!newFollowUp.date) {
            Alert.alert("Validation Error", "Please select a follow-up date");
            return;
        }

        const followUp = {
            id: Date.now().toString(),
            enquiryId: selectedEnquiry.id,
            date: newFollowUp.date,
            remarks: newFollowUp.remarks,
            outcome: newFollowUp.outcome || "Pending",
            status: "Pending",
        };

        setFollowUps([...followUps, followUp]);
        Alert.alert("Success", "Follow-up added successfully!");
        resetFollowUpForm();
        setShowFollowUpForm(false);
    };

    const resetFollowUpForm = () => {
        setNewFollowUp({
            date: "",
            remarks: "",
            outcome: "",
        });
    };

    const markFollowUpCompleted = (followUpId) => {
        setFollowUps(
            followUps.map((fu) =>
                fu.id === followUpId
                    ? { ...fu, status: "Completed", outcome: "Called" }
                    : fu
            )
        );
    };

    const deleteFollowUp = (followUpId) => {
        Alert.alert(
            "Delete Follow-up",
            "Are you sure you want to delete this follow-up?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {
                        setFollowUps(followUps.filter((fu) => fu.id !== followUpId));
                        Alert.alert("Success", "Follow-up deleted successfully!");
                    },
                    style: "destructive",
                },
            ],
        );
    };

    const getFollowUpsForEnquiry = () => {
        return followUps.filter((fu) => fu.enquiryId === selectedEnquiry?.id);
    };

    const DropdownComponent = ({ label, options, value, onChange, field }) => (
        <View style={styles.dropdownContainer}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => toggleDropdown(field)}>
                <Text style={styles.dropdownButtonText}>{value}</Text>
                <MaterialIcons
                    name={
                        dropdownOpen[field]
                            ? "arrow-drop-up"
                            : "arrow-drop-down"
                    }
                    size={24}
                    color="#667eea"
                />
            </TouchableOpacity>
            {dropdownOpen[field] && (
                <View style={styles.dropdownMenu}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.dropdownMenuItem}
                            onPress={() => {
                                onChange(option);
                                toggleDropdown(field);
                            }}>
                            <Text style={styles.dropdownMenuItemText}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    const renderEnquiry = ({ item }) => (
        <View style={styles.enquiryItemWrapper}>
            <LinearGradient
                colors={
                    item.enquiryStatus === "New"
                        ? ["rgba(102,126,234,0.1)", "rgba(118,75,162,0.1)"]
                        : item.enquiryStatus === "Interested"
                          ? ["rgba(255,193,7,0.1)", "rgba(255,152,0,0.1)"]
                          : item.enquiryStatus === "Converted"
                            ? ["rgba(40,167,69,0.1)", "rgba(34,197,94,0.1)"]
                            : ["rgba(220,53,69,0.1)", "rgba(180,30,40,0.1)"]
                }
                style={styles.enquiryItem}>
                <TouchableOpacity
                    onPress={() => setSelectedEnquiry(item)}
                    style={styles.enquiryContent}>
                    <View style={styles.enquiryHeader}>
                        <MaterialCommunityIcons
                            name="account"
                            size={24}
                            color={
                                item.enquiryStatus === "New"
                                    ? "#667eea"
                                    : item.enquiryStatus === "Interested"
                                      ? "#ffc107"
                                      : item.enquiryStatus === "Converted"
                                        ? "#28a745"
                                        : "#dc3545"
                            }
                        />
                        <View style={styles.enquiryInfo}>
                            <Text style={styles.customer}>
                                {item.customerName}
                            </Text>
                            <Text style={styles.enquiryId}>
                                {item.enquiryNumber}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.enquiryDetails}>
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
                            <MaterialIcons
                                name="phone"
                                size={16}
                                color="#a0a0a0"
                            />
                            <Text style={styles.detailText}>
                                {item.mobileNumber}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <MaterialIcons
                                name="schedule"
                                size={16}
                                color="#a0a0a0"
                            />
                            <Text style={styles.detailText}>
                                Status: {item.enquiryStatus}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </LinearGradient>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteEnquiry(item.id)}>
                <MaterialIcons name="delete" size={18} color="#ff6b6b" />
            </TouchableOpacity>
        </View>
    );

    return (
        <LinearGradient
            colors={["#0f0f23", "#1a1a2e", "#16213e"]}
            style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}>
                <Animated.View
                    entering={FadeInUp.delay(100)}
                    style={styles.header}>
                    <MaterialCommunityIcons
                        name="account-search"
                        size={32}
                        color="#667eea"
                        style={styles.headerIcon}
                    />
                    <Text style={styles.title}>Enquiry Management</Text>
                    <Text style={styles.subtitle}>
                        Create and manage customer enquiries
                    </Text>
                </Animated.View>

                {/* Add New Enquiry Button */}
                <Animated.View
                    entering={FadeInUp.delay(150)}
                    style={styles.buttonContainer}>
                    <LinearGradient
                        colors={["#667eea", "#764ba2"]}
                        style={styles.buttonGradient}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setShowForm(!showForm)}>
                            <MaterialCommunityIcons
                                name="plus"
                                size={24}
                                color="#fff"
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.buttonText}>
                                {showForm ? "Cancel" : "New Enquiry"}
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                {/* Add New Enquiry Form */}
                {showForm && (
                    <Animated.View
                        entering={FadeInUp.delay(200)}
                        style={styles.addForm}>
                        <Text style={styles.formTitle}>Add New Enquiry</Text>

                        {/* Enquiry Number (Auto-Generated) */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Enquiry Number{" "}
                                <Text style={styles.readOnlyBadge}>(Auto)</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, styles.readOnlyInput]}
                                editable={false}
                                value={
                                    newEnquiry.enquiryNumber ||
                                    generateEnquiryNumber()
                                }
                                placeholder="Auto Generated"
                                placeholderTextColor="#a0a0a0"
                            />
                        </View>

                        {/* Enquiry Type */}
                        <DropdownComponent
                            label="Enquiry Type"
                            options={[
                                "Product Inquiry",
                                "Service Inquiry",
                                "General Inquiry",
                            ]}
                            value={newEnquiry.enquiryType}
                            onChange={(value) =>
                                setNewEnquiry({
                                    ...newEnquiry,
                                    enquiryType: value,
                                })
                            }
                            field="enquiryType"
                        />

                        {/* Lead Source */}
                        <DropdownComponent
                            label="Lead Source"
                            options={[
                                "Walk-in",
                                "Phone",
                                "Email",
                                "Website",
                                "Social Media",
                                "Referral",
                            ]}
                            value={newEnquiry.leadSource}
                            onChange={(value) =>
                                setNewEnquiry({
                                    ...newEnquiry,
                                    leadSource: value,
                                })
                            }
                            field="leadSource"
                        />

                        {/* Customer Name (Required) */}
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
                                    value={newEnquiry.customerName}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            customerName: text,
                                        })
                                    }
                                />
                            </View>
                        </View>

                        {/* Address */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Address</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons
                                    name="location-on"
                                    size={20}
                                    color="#667eea"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.multilineInput,
                                    ]}
                                    placeholder="Enter address"
                                    placeholderTextColor="#a0a0a0"
                                    value={newEnquiry.address}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            address: text,
                                        })
                                    }
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>

                        {/* Mobile Number (Required) */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Mobile Number{" "}
                                <Text style={styles.required}>*</Text>
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
                                    value={newEnquiry.mobileNumber}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            mobileNumber: text,
                                        })
                                    }
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        {/* Alternate Mobile Number */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Alternate Mobile Number
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
                                    placeholder="Enter alternate mobile number"
                                    placeholderTextColor="#a0a0a0"
                                    value={newEnquiry.alternateMobileNumber}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            alternateMobileNumber: text,
                                        })
                                    }
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        {/* Product Name (Required) */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Product Name{" "}
                                <Text style={styles.required}>*</Text>
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
                                    value={newEnquiry.productName}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            productName: text,
                                        })
                                    }
                                />
                            </View>
                        </View>

                        {/* Approximate Product Cost (Required) */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Product Cost (Lead Value){" "}
                                <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons
                                    name="currency-rupee"
                                    size={20}
                                    color="#667eea"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter approximate cost"
                                    placeholderTextColor="#a0a0a0"
                                    value={newEnquiry.productCost}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            productCost: text,
                                        })
                                    }
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        {/* Payment Method */}
                        <DropdownComponent
                            label="Payment Method"
                            options={["Cash", "Credit", "EMI", "Online"]}
                            value={newEnquiry.paymentMethod}
                            onChange={(value) =>
                                setNewEnquiry({
                                    ...newEnquiry,
                                    paymentMethod: value,
                                })
                            }
                            field="paymentMethod"
                        />

                        {/* Enquiry Date (Current Date Only) */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Enquiry Date{" "}
                                <Text style={styles.readOnlyBadge}>
                                    (Today)
                                </Text>
                            </Text>
                            <TextInput
                                style={[styles.input, styles.readOnlyInput]}
                                editable={false}
                                value={newEnquiry.enquiryDate}
                                placeholder="Current date"
                                placeholderTextColor="#a0a0a0"
                            />
                        </View>

                        {/* Enquiry Taken By (Auto) */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Enquiry Taken By{" "}
                                <Text style={styles.readOnlyBadge}>(Auto)</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, styles.readOnlyInput]}
                                editable={false}
                                value={loggedInUser}
                                placeholder="Logged-in user"
                                placeholderTextColor="#a0a0a0"
                            />
                        </View>

                        {/* Remarks / Notes */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Remarks / Notes{" "}
                                <Text style={styles.optional}>(Optional)</Text>
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
                                    placeholder="Enter any remarks or notes"
                                    placeholderTextColor="#a0a0a0"
                                    value={newEnquiry.remarks}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            remarks: text,
                                        })
                                    }
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>
                            Follow-up Options
                        </Text>

                        {/* Follow-up Required */}
                        <DropdownComponent
                            label="Follow-up Required"
                            options={["Yes", "No"]}
                            value={newEnquiry.followUpRequired}
                            onChange={(value) =>
                                setNewEnquiry({
                                    ...newEnquiry,
                                    followUpRequired: value,
                                })
                            }
                            field="followUpRequired"
                        />

                        {/* Next Follow-up Date */}
                        {newEnquiry.followUpRequired === "Yes" && (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>
                                    Next Follow-up Date
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
                                        value={newEnquiry.nextFollowUpDate}
                                        onChangeText={(text) =>
                                            setNewEnquiry({
                                                ...newEnquiry,
                                                nextFollowUpDate: text,
                                            })
                                        }
                                    />
                                </View>
                            </View>
                        )}

                        {/* Enquiry Status */}
                        <DropdownComponent
                            label="Enquiry Status"
                            options={[
                                "New",
                                "Interested",
                                "Not Interested",
                                "Converted",
                            ]}
                            value={newEnquiry.enquiryStatus}
                            onChange={(value) =>
                                setNewEnquiry({
                                    ...newEnquiry,
                                    enquiryStatus: value,
                                })
                            }
                            field="enquiryStatus"
                        />

                        {/* Action Buttons */}
                        <View style={styles.actionButtonsContainer}>
                            <LinearGradient
                                colors={["#667eea", "#764ba2"]}
                                style={[styles.actionGradient, styles.flex1]}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={saveEnquiry}>
                                    <MaterialIcons
                                        name="save"
                                        size={20}
                                        color="#fff"
                                        style={styles.buttonIcon}
                                    />
                                    <Text style={styles.actionButtonText}>
                                        Save
                                    </Text>
                                </TouchableOpacity>
                            </LinearGradient>

                            <LinearGradient
                                colors={["#00d4ff", "#0099cc"]}
                                style={[styles.actionGradient, styles.flex1]}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={saveAndAddFollowUp}>
                                    <MaterialIcons
                                        name="add-alarm"
                                        size={20}
                                        color="#fff"
                                        style={styles.buttonIcon}
                                    />
                                    <Text style={styles.actionButtonText}>
                                        Save & Follow-up
                                    </Text>
                                </TouchableOpacity>
                            </LinearGradient>

                            <LinearGradient
                                colors={["#ff6b6b", "#cc0000"]}
                                style={[styles.actionGradient, styles.flex1]}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        resetForm();
                                        setShowForm(false);
                                    }}>
                                    <MaterialIcons
                                        name="close"
                                        size={20}
                                        color="#fff"
                                        style={styles.buttonIcon}
                                    />
                                    <Text style={styles.actionButtonText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </Animated.View>
                )}

                {/* Edit Enquiry Form */}
                {showEditForm && editingEnquiry && (
                    <Animated.View
                        entering={FadeInUp.delay(200)}
                        style={styles.addForm}>
                        <Text style={styles.formTitle}>Edit Enquiry</Text>

                        {/* Enquiry Number (Read-only) */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Enquiry Number{" "}
                                <Text style={styles.readOnlyBadge}>(Auto)</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, styles.readOnlyInput]}
                                editable={false}
                                value={newEnquiry.enquiryNumber}
                                placeholder="Auto Generated"
                                placeholderTextColor="#a0a0a0"
                            />
                        </View>

                        {/* Enquiry Type */}
                        <DropdownComponent
                            label="Enquiry Type"
                            options={[
                                "Product Inquiry",
                                "Service Inquiry",
                                "General Inquiry",
                            ]}
                            value={newEnquiry.enquiryType}
                            onChange={(value) =>
                                setNewEnquiry({
                                    ...newEnquiry,
                                    enquiryType: value,
                                })
                            }
                            field="enquiryType"
                        />

                        {/* Lead Source */}
                        <DropdownComponent
                            label="Lead Source"
                            options={[
                                "Walk-in",
                                "Phone",
                                "Email",
                                "Website",
                                "Social Media",
                                "Referral",
                            ]}
                            value={newEnquiry.leadSource}
                            onChange={(value) =>
                                setNewEnquiry({
                                    ...newEnquiry,
                                    leadSource: value,
                                })
                            }
                            field="leadSource"
                        />

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
                                    value={newEnquiry.customerName}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            customerName: text,
                                        })
                                    }
                                />
                            </View>
                        </View>

                        {/* Address */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Address</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons
                                    name="location-on"
                                    size={20}
                                    color="#667eea"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.multilineInput,
                                    ]}
                                    placeholder="Enter address"
                                    placeholderTextColor="#a0a0a0"
                                    value={newEnquiry.address}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            address: text,
                                        })
                                    }
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>

                        {/* Mobile Number */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Mobile Number{" "}
                                <Text style={styles.required}>*</Text>
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
                                    value={newEnquiry.mobileNumber}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            mobileNumber: text,
                                        })
                                    }
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        {/* Alternate Mobile Number */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Alternate Mobile Number
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
                                    placeholder="Enter alternate mobile number"
                                    placeholderTextColor="#a0a0a0"
                                    value={newEnquiry.alternateMobileNumber}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            alternateMobileNumber: text,
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
                                <Text style={styles.required}>*</Text>
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
                                    value={newEnquiry.productName}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            productName: text,
                                        })
                                    }
                                />
                            </View>
                        </View>

                        {/* Product Cost */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Product Cost (Lead Value){" "}
                                <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons
                                    name="currency-rupee"
                                    size={20}
                                    color="#667eea"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter cost"
                                    placeholderTextColor="#a0a0a0"
                                    value={newEnquiry.productCost}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            productCost: text,
                                        })
                                    }
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        {/* Payment Method */}
                        <DropdownComponent
                            label="Payment Method"
                            options={["Cash", "Credit", "EMI", "Online"]}
                            value={newEnquiry.paymentMethod}
                            onChange={(value) =>
                                setNewEnquiry({
                                    ...newEnquiry,
                                    paymentMethod: value,
                                })
                            }
                            field="paymentMethod"
                        />

                        {/* Remarks */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                Remarks / Notes{" "}
                                <Text style={styles.optional}>(Optional)</Text>
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
                                    placeholder="Enter remarks"
                                    placeholderTextColor="#a0a0a0"
                                    value={newEnquiry.remarks}
                                    onChangeText={(text) =>
                                        setNewEnquiry({
                                            ...newEnquiry,
                                            remarks: text,
                                        })
                                    }
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>

                        {/* Enquiry Status */}
                        <DropdownComponent
                            label="Enquiry Status"
                            options={[
                                "New",
                                "Interested",
                                "Not Interested",
                                "Converted",
                            ]}
                            value={newEnquiry.enquiryStatus}
                            onChange={(value) =>
                                setNewEnquiry({
                                    ...newEnquiry,
                                    enquiryStatus: value,
                                })
                            }
                            field="enquiryStatus"
                        />

                        {/* Action Buttons */}
                        <View style={styles.actionButtonsContainer}>
                            <LinearGradient
                                colors={["#667eea", "#764ba2"]}
                                style={[styles.actionGradient, styles.flex1]}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleUpdateEnquiry}>
                                    <MaterialIcons
                                        name="save"
                                        size={20}
                                        color="#fff"
                                        style={styles.buttonIcon}
                                    />
                                    <Text style={styles.actionButtonText}>
                                        Update
                                    </Text>
                                </TouchableOpacity>
                            </LinearGradient>

                            <LinearGradient
                                colors={["#ff6b6b", "#cc0000"]}
                                style={[styles.actionGradient, styles.flex1]}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        resetForm();
                                        setShowEditForm(false);
                                        setEditingEnquiry(null);
                                    }}>
                                    <MaterialIcons
                                        name="close"
                                        size={20}
                                        color="#fff"
                                        style={styles.buttonIcon}
                                    />
                                    <Text style={styles.actionButtonText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </Animated.View>
                )}

                {/* Recent Enquiry Details Section */}
                {enquiries.length > 0 && (
                    <Animated.View
                        entering={FadeInUp.delay(250)}
                        style={styles.recentEnquiryContainer}>
                        <Text style={styles.recentEnquiryLabel}>
                            Recent Enquiry
                        </Text>
                        <TouchableOpacity
                            onPress={() =>
                                setSelectedEnquiry(
                                    enquiries[enquiries.length - 1],
                                )
                            }
                            activeOpacity={0.7}>
                            <View
                                style={[
                                    styles.minimalCard,
                                    {
                                        borderLeftColor:
                                            enquiries[enquiries.length - 1]
                                                .enquiryStatus === "New"
                                                ? "#667eea"
                                                : enquiries[
                                                        enquiries.length - 1
                                                    ].enquiryStatus ===
                                                    "Interested"
                                                  ? "#ffc107"
                                                  : enquiries[
                                                          enquiries.length - 1
                                                      ].enquiryStatus ===
                                                      "Converted"
                                                    ? "#28a745"
                                                    : "#dc3545",
                                    },
                                ]}>
                                {/* Action Icons - Top Right */}
                                <View style={styles.cardActionIcons}>
                                    <TouchableOpacity
                                        style={styles.minimalIconButton}
                                        onPress={() =>
                                            handleEditEnquiry(
                                                enquiries[enquiries.length - 1],
                                            )
                                        }>
                                        <MaterialIcons
                                            name="edit"
                                            size={16}
                                            color="#667eea"
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.minimalIconButton}
                                        onPress={() =>
                                            handleDeleteEnquiry(
                                                enquiries[enquiries.length - 1]
                                                    .id,
                                            )
                                        }>
                                        <MaterialIcons
                                            name="delete"
                                            size={16}
                                            color="#ff6b6b"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.cardCustomerName}>
                                            {
                                                enquiries[enquiries.length - 1]
                                                    .customerName
                                            }
                                        </Text>
                                        <Text style={styles.cardEnquiryId}>
                                            {
                                                enquiries[enquiries.length - 1]
                                                    .enquiryNumber
                                            }
                                        </Text>
                                    </View>
                                    <View style={styles.cardBadge}>
                                        <Text style={styles.cardStatus}>
                                            {
                                                enquiries[enquiries.length - 1]
                                                    .enquiryStatus
                                            }
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.cardDivider} />

                                <View style={styles.cardContent}>
                                    <View style={styles.cardField}>
                                        <Text style={styles.cardFieldLabel}>
                                            Product
                                        </Text>
                                        <Text style={styles.cardFieldValue}>
                                            {
                                                enquiries[enquiries.length - 1]
                                                    .productName
                                            }
                                        </Text>
                                    </View>
                                    <View style={styles.cardField}>
                                        <Text style={styles.cardFieldLabel}>
                                            Phone
                                        </Text>
                                        <Text style={styles.cardFieldValue}>
                                            {
                                                enquiries[enquiries.length - 1]
                                                    .mobileNumber
                                            }
                                        </Text>
                                    </View>
                                    <View style={styles.cardField}>
                                        <Text style={styles.cardFieldLabel}>
                                            Cost
                                        </Text>
                                        <Text style={styles.cardFieldValue}>
                                            ₹
                                            {
                                                enquiries[enquiries.length - 1]
                                                    .productCost
                                            }
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Enquiry Details Modal */}
                <Modal
                    visible={selectedEnquiry !== null}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setSelectedEnquiry(null)}>
                    <LinearGradient
                        colors={["#0f0f23", "#1a1a2e", "#16213e"]}
                        style={styles.modalContainer}>
                        <ScrollView style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setSelectedEnquiry(null)}>
                                <MaterialIcons
                                    name="close"
                                    size={28}
                                    color="#fff"
                                />
                            </TouchableOpacity>

                            {selectedEnquiry && (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.detailsContainer}>
                                        <Text style={styles.modalTitle}>
                                            Enquiry Details
                                        </Text>

                                        <DetailRow
                                            label="Enquiry Number"
                                            value={selectedEnquiry.enquiryNumber}
                                        />
                                        <DetailRow
                                            label="Customer Name"
                                            value={selectedEnquiry.customerName}
                                        />
                                        <DetailRow
                                            label="Mobile Number"
                                            value={selectedEnquiry.mobileNumber}
                                        />
                                        <DetailRow
                                            label="Product Name"
                                            value={selectedEnquiry.productName}
                                        />
                                        <DetailRow
                                            label="Product Cost"
                                            value={`₹${selectedEnquiry.productCost}`}
                                        />
                                        <DetailRow
                                            label="Status"
                                            value={selectedEnquiry.enquiryStatus}
                                        />
                                        <DetailRow
                                            label="Enquiry Date"
                                            value={selectedEnquiry.enquiryDate}
                                        />
                                        {selectedEnquiry.remarks && (
                                            <DetailRow
                                                label="Remarks"
                                                value={selectedEnquiry.remarks}
                                            />
                                        )}
                                    </View>

                                    {/* Follow-up Section */}
                                    <View style={styles.followUpSectionContainer}>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionHeaderLeft}>
                                                <MaterialCommunityIcons
                                                    name="calendar-check"
                                                    size={24}
                                                    color="#667eea"
                                                    style={styles.sectionIcon}
                                                />
                                                <Text style={styles.sectionTitleModal}>
                                                    Follow-up Management
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.addFollowUpButton}
                                                onPress={() =>
                                                    setShowFollowUpForm(!showFollowUpForm)
                                                }>
                                                <MaterialIcons
                                                    name={
                                                        showFollowUpForm
                                                            ? "close"
                                                            : "add"
                                                    }
                                                    size={20}
                                                    color="#fff"
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Add Follow-up Form */}
                                        {showFollowUpForm && (
                                            <Animated.View
                                                entering={FadeInUp.delay(100)}
                                                style={styles.followUpForm}>
                                                <Text style={styles.formSubtitle}>
                                                    Add New Follow-up
                                                </Text>

                                                {/* Follow-up Date */}
                                                <View style={styles.fieldGroup}>
                                                    <Text style={styles.label}>
                                                        Follow-up Date{" "}
                                                        <Text style={styles.required}>
                                                            *
                                                        </Text>
                                                    </Text>
                                                    <View
                                                        style={
                                                            styles.inputContainer
                                                        }>
                                                        <MaterialIcons
                                                            name="event"
                                                            size={20}
                                                            color="#667eea"
                                                            style={
                                                                styles.inputIcon
                                                            }
                                                        />
                                                        <TextInput
                                                            style={styles.input}
                                                            placeholder="YYYY-MM-DD"
                                                            placeholderTextColor="#a0a0a0"
                                                            value={
                                                                newFollowUp.date
                                                            }
                                                            onChangeText={(
                                                                text
                                                            ) =>
                                                                setNewFollowUp({
                                                                    ...newFollowUp,
                                                                    date: text,
                                                                })
                                                            }
                                                        />
                                                    </View>
                                                </View>

                                                {/* Remarks */}
                                                <View style={styles.fieldGroup}>
                                                    <Text style={styles.label}>
                                                        Remarks{" "}
                                                        <Text
                                                            style={
                                                                styles.optional
                                                            }
                                                        >
                                                            (Optional)
                                                        </Text>
                                                    </Text>
                                                    <View
                                                        style={
                                                            styles.inputContainer
                                                        }>
                                                        <MaterialIcons
                                                            name="note"
                                                            size={20}
                                                            color="#667eea"
                                                            style={
                                                                styles.inputIcon
                                                            }
                                                        />
                                                        <TextInput
                                                            style={[
                                                                styles.input,
                                                                styles.multilineInput,
                                                            ]}
                                                            placeholder="Enter follow-up remarks"
                                                            placeholderTextColor="#a0a0a0"
                                                            value={
                                                                newFollowUp.remarks
                                                            }
                                                            onChangeText={(
                                                                text
                                                            ) =>
                                                                setNewFollowUp({
                                                                    ...newFollowUp,
                                                                    remarks: text,
                                                                })
                                                            }
                                                            multiline
                                                            numberOfLines={3}
                                                        />
                                                    </View>
                                                </View>

                                                {/* Form Buttons */}
                                                <View
                                                    style={
                                                        styles.followUpFormButtons
                                                    }>
                                                    <LinearGradient
                                                        colors={[
                                                            "#667eea",
                                                            "#764ba2",
                                                        ]}
                                                        style={[
                                                            styles.actionGradient,
                                                            styles.flex1,
                                                        ]}>
                                                        <TouchableOpacity
                                                            style={
                                                                styles.actionButton
                                                            }
                                                            onPress={
                                                                addFollowUp
                                                            }>
                                                            <MaterialIcons
                                                                name="check"
                                                                size={20}
                                                                color="#fff"
                                                                style={
                                                                    styles.buttonIcon
                                                                }
                                                            />
                                                            <Text
                                                                style={
                                                                    styles.actionButtonText
                                                                }>
                                                                Add Follow-up
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </LinearGradient>

                                                    <LinearGradient
                                                        colors={[
                                                            "#ff6b6b",
                                                            "#cc0000",
                                                        ]}
                                                        style={[
                                                            styles.actionGradient,
                                                            styles.flex1,
                                                        ]}>
                                                        <TouchableOpacity
                                                            style={
                                                                styles.actionButton
                                                            }
                                                            onPress={() => {
                                                                resetFollowUpForm();
                                                                setShowFollowUpForm(
                                                                    false
                                                                );
                                                            }}>
                                                            <MaterialIcons
                                                                name="close"
                                                                size={20}
                                                                color="#fff"
                                                                style={
                                                                    styles.buttonIcon
                                                                }
                                                            />
                                                            <Text
                                                                style={
                                                                    styles.actionButtonText
                                                                }>
                                                                Cancel
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </LinearGradient>
                                                </View>
                                            </Animated.View>
                                        )}

                                        {/* Follow-ups List */}
                                        <View style={styles.followUpListContainer}>
                                            {getFollowUpsForEnquiry().length >
                                            0 ? (
                                                <FlatList
                                                    data={getFollowUpsForEnquiry()}
                                                    renderItem={renderFollowUp}
                                                    keyExtractor={(item) =>
                                                        item.id
                                                    }
                                                    scrollEnabled={false}
                                                    style={styles.list}
                                                />
                                            ) : (
                                                <Text
                                                    style={
                                                        styles.noFollowUpText
                                                    }>
                                                    No follow-ups added yet
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </ScrollView>
                            )}
                        </ScrollView>
                    </LinearGradient>
                </Modal>
            </ScrollView>
        </LinearGradient>
    );
}

// Detail Row Component for Modal
function DetailRow({ label, value }) {
    return (
        <View style={styles.detailRowContainer}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    header: {
        alignItems: "center",
        marginBottom: 24,
        marginTop: 8,
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
    buttonContainer: {
        marginBottom: 20,
    },
    addForm: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 20,
        textAlign: "center",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#667eea",
        marginTop: 20,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(102,126,234,0.3)",
        paddingBottom: 8,
    },
    fieldGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 8,
    },
    required: {
        color: "#ff6b6b",
        fontSize: 16,
    },
    readOnlyBadge: {
        color: "#a0a0a0",
        fontSize: 12,
        fontWeight: "400",
    },
    optional: {
        color: "#ffc107",
        fontSize: 12,
        fontWeight: "400",
    },
    inputContainer: {
        position: "relative",
        flexDirection: "row",
        alignItems: "flex-start",
    },
    inputIcon: {
        position: "absolute",
        left: 16,
        top: 18,
        zIndex: 1,
    },
    input: {
        flex: 1,
        height: 56,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        paddingHorizontal: 56,
        paddingVertical: 12,
        fontSize: 15,
        backgroundColor: "rgba(255,255,255,0.05)",
        color: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    multilineInput: {
        height: 100,
        paddingVertical: 12,
        textAlignVertical: "top",
    },
    readOnlyInput: {
        opacity: 0.6,
        backgroundColor: "rgba(255,255,255,0.02)",
    },
    dropdownContainer: {
        marginBottom: 16,
    },
    dropdownButton: {
        height: 56,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: "rgba(255,255,255,0.05)",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    dropdownButtonText: {
        fontSize: 15,
        color: "#fff",
    },
    dropdownMenu: {
        position: "absolute",
        top: 66,
        left: 0,
        right: 0,
        backgroundColor: "rgba(26,26,46,0.95)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        zIndex: 1000,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    dropdownMenuItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
    },
    dropdownMenuItemText: {
        fontSize: 15,
        color: "#fff",
    },
    actionButtonsContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
    },
    flex1: {
        flex: 1,
    },
    actionGradient: {
        borderRadius: 12,
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButton: {
        height: 56,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    buttonGradient: {
        borderRadius: 12,
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    button: {
        height: 56,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    listContainer: {
        marginBottom: 24,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 16,
    },
    list: {
        flex: 1,
    },
    enquiryItem: {
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: "hidden",
    },
    enquiryContent: {
        padding: 16,
    },
    enquiryHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    enquiryInfo: {
        marginLeft: 12,
        flex: 1,
    },
    customer: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    enquiryId: {
        fontSize: 12,
        color: "#a0a0a0",
        marginTop: 4,
    },
    enquiryDetails: {
        marginLeft: 36,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    detailText: {
        fontSize: 13,
        color: "#a0a0a0",
        marginLeft: 8,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 16,
        color: "#a0a0a0",
        marginTop: 12,
    },
    modalContainer: {
        flex: 1,
        paddingTop: Platform.OS === "ios" ? 20 : 0,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    closeButton: {
        alignSelf: "flex-end",
        padding: 8,
        marginBottom: 16,
    },
    detailsContainer: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 20,
        textAlign: "center",
    },
    detailRowContainer: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
    },
    detailLabel: {
        fontSize: 12,
        color: "#a0a0a0",
        fontWeight: "600",
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        color: "#fff",
        fontWeight: "500",
    },
    listHeaderContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    refreshButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "rgba(102,126,234,0.2)",
    },
    loadingState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 14,
        color: "#a0a0a0",
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 12,
        color: "#7a7a7a",
        marginTop: 8,
        textAlign: "center",
    },
    enquiryItemWrapper: {
        marginBottom: 12,
        position: "relative",
    },
    deleteButton: {
        position: "absolute",
        right: 12,
        top: 12,
        padding: 8,
        borderRadius: 8,
        backgroundColor: "rgba(255,107,107,0.2)",
    },
    recentEnquiryContainer: {
        marginBottom: 24,
    },
    recentEnquiryLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#a0a0a0",
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    minimalCard: {
        backgroundColor: "rgba(26,26,46,0.6)",
        borderRadius: 12,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 16,
        paddingTop: 50,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
        position: "relative",
    },
    cardActionIcons: {
        position: "absolute",
        right: 12,
        top: 12,
        flexDirection: "row",
        gap: 8,
        zIndex: 100,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    cardCustomerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 4,
    },
    cardEnquiryId: {
        fontSize: 12,
        color: "#7a7a7a",
    },
    cardBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "rgba(102,126,234,0.2)",
        borderRadius: 6,
    },
    cardStatus: {
        fontSize: 11,
        fontWeight: "600",
        color: "#667eea",
    },
    cardDivider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.05)",
        marginBottom: 12,
    },
    cardContent: {
        gap: 8,
    },
    cardField: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardFieldLabel: {
        fontSize: 12,
        color: "#7a7a7a",
        fontWeight: "500",
    },
    cardFieldValue: {
        fontSize: 13,
        color: "#fff",
        fontWeight: "500",
    },
    minimalActionIcons: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    minimalIconButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.05)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    recentEnquiryCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(102,126,234,0.3)",
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    recentEnquiryHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(102,126,234,0.2)",
    },
    recentEnquiryTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#667eea",
        marginLeft: 12,
    },
    recentEnquiryDetails: {
        marginBottom: 0,
    },
    recentEnquiryActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(102,126,234,0.2)",
    },
    recentEnquiryActionIcons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    editIconWrapper: {
        borderRadius: 12,
        padding: 2,
        borderWidth: 1,
        borderColor: "rgba(0,212,255,0.4)",
        shadowColor: "#00d4ff",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    deleteIconWrapper: {
        borderRadius: 12,
        padding: 2,
        borderWidth: 1,
        borderColor: "rgba(255,107,107,0.4)",
        shadowColor: "#ff6b6b",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    actionIconButton: {
        padding: 10,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        width: 44,
        height: 44,
    },
    iconButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
});
