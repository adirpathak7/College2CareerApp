import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Animated,
    Platform
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Svg, { Circle } from "react-native-svg";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

// ⭐ Circular Progress
const CircularProgress = ({ value }) => {
    const radius = 55;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;

    const AnimatedCircle = Animated.createAnimatedComponent(Circle);
    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animation, {
            toValue: value,
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, [value]);

    const strokeDashoffset = animation.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    return (
        <View style={{ alignItems: "center", marginVertical: 15 }}>
            <Svg height="140" width="140">
                <Circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="#D7E8F7"
                    strokeWidth={strokeWidth}
                />
                <AnimatedCircle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="#007ACC"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="70,70"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </Svg>

            <Text style={styles.progressText}>{value}%</Text>
        </View>
    );
};

const downloadSampleResume = async () => {
    try {
        const url = "http://10.241.80.208:8000/api/ats/sample-resume";

        const fileUri = FileSystem.documentDirectory + "SampleResume.pdf";

        const { uri } = await FileSystem.downloadAsync(url, fileUri);

        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Downloaded!", "File saved to app documents folder.");
            return;
        }

        await Sharing.shareAsync(uri);
    } catch (err) {
        Alert.alert("Error", "Failed to download sample resume.");
    }
};

// ⭐ Progress Bar
const ProgressBar = ({ value }) => {
    const barAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(barAnim, {
            toValue: value,
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, [value]);

    const widthInterpolate = barAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
    });

    return (
        <View style={{ width: "100%", marginTop: 10 }}>
            <View style={styles.progressBackground}>
                <Animated.View
                    style={[
                        styles.progressFill,
                        { width: widthInterpolate },
                    ]}
                />
            </View>
        </View>
    );
};


const ATSChecker = () => {
    const [resume, setResume] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickPDF = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "application/pdf",
        });

        if (!result.canceled) {
            const file = result.assets[0];

            if (file.size > 2 * 1024 * 1024) {
                Alert.alert("File too large", "Max allowed size is 2MB.");
                return;
            }

            setResume(file);
        }
    };

    const analyzeResume = async () => {
        if (!resume) {
            Alert.alert("Upload Resume", "Please upload a PDF file first.");
            return;
        }

        try {
            setLoading(true);
            setResult(null);

            const token = await AsyncStorage.getItem("userToken");

            const formData = new FormData();
            formData.append("resume", {
                uri: resume.uri,
                name: resume.name,
                type: "application/pdf",
            });

            // ⭐ Direct API URL here (NO ENV)
            const response = await axios.post(
                "http://10.241.80.208:8000/api/ats/check",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setResult(response.data);
            setLoading(false);

        } catch (err) {
            console.log("ATS Error:", err);
            Alert.alert("Error", "Failed to analyze resume.");
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>📄 Resume ATS Checker</Text>

            <Text style={styles.subtitle}>
                Upload your resume & instantly check how ATS-friendly it is.
            </Text>

            <TouchableOpacity style={styles.uploadBox} onPress={pickPDF}>
                <MaterialIcons name="upload-file" size={40} color="#007ACC" />
                <Text style={styles.uploadText}>
                    {resume ? resume.name : "Tap to upload PDF (Max 2MB)"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={analyzeResume}
                disabled={loading}
            >
                <Text style={styles.btnText}>
                    {loading ? "Analyzing..." : "Check ATS Score"}
                </Text>
            </TouchableOpacity>

            {/* ⭐ Result Section */}
            {result && (
                <View style={styles.resultCard}>
                    <Text style={styles.scoreTitle}>Your ATS Score</Text>

                    <CircularProgress value={result.score} />
                    <ProgressBar value={result.score} />

                    <Text style={styles.scoreNote}>
                        {result.score >= 80
                            ? "🔥 Excellent! Your resume is highly ATS friendly."
                            : result.score >= 60
                                ? "👌 Good. Improve keywords to increase the score."
                                : "⚠ Needs improvement. Optimize formatting & keywords."}
                    </Text>

                    {/* Breakdown */}
                    <Text style={styles.sectionTitle}>📊 Score Breakdown</Text>
                    {result.breakdown?.map((item, index) => (
                        <View key={index} style={styles.breakItem}>
                            <Text style={styles.breakLabel}>{item.item}</Text>
                            <Text style={styles.breakScore}>{item.points} pts</Text>
                            <Text style={styles.breakNote}>{item.note}</Text>
                        </View>
                    ))}

                    {/* Keywords */}
                    {/* <Text style={styles.sectionTitle}>🔑 Matched Keywords</Text>
                    <View style={styles.keywordBox}>
                        {result.matchedKeywords?.map((kw, i) => (
                            <Text key={i} style={styles.keywordChip}>
                                {kw}
                            </Text>
                        ))}
                    </View> */}

                    {/* Suggestions */}
                    <Text style={styles.sectionTitle}>🛠 Suggestions</Text>
                    {result.suggestions?.map((s, i) => (
                        <Text key={i} style={styles.suggestionItem}>
                            • {s}
                        </Text>
                    ))}

                    <TouchableOpacity
                        style={{
                            backgroundColor: "blue",
                            padding: 15,
                            marginTop: 20,
                            borderRadius: 10
                        }}
                        onPress={downloadSampleResume}
                    >
                        <Text style={{ color: "white", textAlign: "center" }}>
                            Download Sample Resume
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: {
        padding: 25,
        paddingTop: 60,
        backgroundColor: "#F4FBFF",
        flexGrow: 1,
        alignItems: "center",
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#004E89",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "#555",
        marginTop: 8,
        marginBottom: 20,
        textAlign: "center",
    },
    uploadBox: {
        width: "100%",
        borderWidth: 1.5,
        borderColor: "#007ACC",
        borderStyle: "dashed",
        borderRadius: 12,
        padding: 30,
        backgroundColor: "#E7F5FF",
        alignItems: "center",
        marginBottom: 20,
    },
    uploadText: {
        marginTop: 10,
        fontSize: 15,
        color: "#007ACC",
        fontWeight: "500",
    },
    btn: {
        backgroundColor: "#007ACC",
        paddingVertical: 14,
        width: "100%",
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    btnDisabled: {
        backgroundColor: "#6BB6E0",
    },
    btnText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "600",
    },
    resultCard: {
        marginTop: 25,
        padding: 20,
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 12,
        elevation: 3,
    },
    scoreTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#004E89",
        textAlign: "center",
        marginBottom: 10,
    },
    scoreNote: {
        fontSize: 15,
        textAlign: "center",
        color: "#555",
        marginTop: 10,
    },

    // Breakdown
    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        marginTop: 20,
        marginBottom: 8,
        color: "#004E89",
    },
    breakItem: {
        backgroundColor: "#F0F6FF",
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
    },
    breakLabel: { fontWeight: "600", fontSize: 15 },
    breakScore: { color: "#007ACC", fontWeight: "600" },
    breakNote: { color: "#555", marginTop: 3 },

    // Keywords
    keywordBox: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    keywordChip: {
        backgroundColor: "#D7ECFF",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 12,
        color: "#004E89",
        fontWeight: "600",
    },

    // Suggestions
    suggestionItem: {
        fontSize: 15,
        color: "#444",
        marginBottom: 5,
    },

    progressBackground: {
        height: 12,
        backgroundColor: "#DCEBFF",
        borderRadius: 10,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#007ACC",
        borderRadius: 10,
    },
    progressText: {
        fontSize: 32,
        fontWeight: "800",
        color: "#003B73",
        position: "absolute",
        top: 50,
    },
});

export default ATSChecker;
