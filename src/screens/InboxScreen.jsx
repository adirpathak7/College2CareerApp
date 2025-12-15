import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    ScrollView,
    Button,
    StyleSheet,
    SafeAreaView,
    Linking
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import socket from "../services/socket";
import {
    getChatContacts,
    searchUsers,
    getGroupMessages,
    createOrGetOneToOneGroup,
} from "../services/chatService";
import { retrieveDataFromJWTToken } from "../services/authService";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

/* ---------------- FILE UPLOAD ---------------- */

const uploadFileToCloudinary = async (file) => {
    const formData = new FormData();

    formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
    });

    formData.append("upload_preset", "college2career_preset");

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/druzdz5zn/upload",
        {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
    }

    return await res.json();
};

/* ---------------- MAIN COMPONENT ---------------- */

export default function Inbox() {
    const navigation = useNavigation();
    const scrollRef = useRef();

    const [currentUser, setCurrentUser] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [unreadMap, setUnreadMap] = useState({});
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [typingMap, setTypingMap] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);

    /* ---------------- HEADER ---------------- */

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Messages",
            headerTitleAlign: "left",
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => setShowSidebar(true)}
                    style={{ marginLeft: 12 }}
                >
                    <Text style={{ fontSize: 22 }}>☰  </Text>
                </TouchableOpacity>
            ),
            headerRight: () => null,
        });
    }, [navigation]);

    /* ---------------- LOAD USER ---------------- */

    useEffect(() => {
        (async () => {
            const user = await retrieveDataFromJWTToken();
            setCurrentUser(user);
        })();
    }, []);

    /* ---------------- LOAD CONTACTS ---------------- */

    useEffect(() => {
        if (!currentUser?.usersId) return;

        (async () => {
            const res = await getChatContacts(currentUser.usersId);
            const list = res.data?.data || [];

            const normalized = list.map((u) => ({
                usersId: u.otherUserId,
                username: u.otherEmail?.split("@")[0],
                email: u.otherEmail,
                groupId: u.groupId,
                lastMessage: u.lastMessage,
            }));

            const unread = {};
            normalized.forEach((c) => (unread[c.usersId] = 0));

            setUnreadMap(unread);
            setContacts(normalized);
        })();
    }, [currentUser]);

    /* ---------------- SOCKET LISTENERS ---------------- */

    useEffect(() => {
        if (!socket || !currentUser) return;

        const onReceive = (msg) => {
            if (selectedChat?.groupId === msg.groupId) {
                setMessages((prev) => [...prev, msg]);
                scrollRef.current?.scrollToEnd({ animated: true });
            }
        };

        const onTyping = ({ usersId }) => {
            setTypingMap((p) => ({ ...p, [usersId]: true }));
            setTimeout(
                () => setTypingMap((p) => ({ ...p, [usersId]: false })),
                1000
            );
        };

        socket.on("receiveMessage", onReceive);
        socket.on("typing", onTyping);

        return () => {
            socket.off("receiveMessage", onReceive);
            socket.off("typing", onTyping);
        };
    }, [selectedChat, currentUser]);

    /* ---------------- OPEN CHAT ---------------- */

    const openChat = async (contact) => {
        let groupId = contact.groupId;

        if (!groupId) {
            const res = await createOrGetOneToOneGroup(
                currentUser.usersId,
                contact.usersId
            );
            groupId = res.data?.groupId;
        }

        setSelectedChat({ ...contact, groupId });
        socket.emit("joinGroup", groupId);

        const res = await getGroupMessages(groupId);
        setMessages(res.data?.data || []);

        setShowSidebar(false);
        setSearchText("");
        setSearchResults([]);
    };

    /* ---------------- SEND MESSAGE ---------------- */

    const handleSend = async () => {
        if (!inputMessage.trim() && !selectedFile) return;

        let fileUrl = null;
        let messageType = "text";

        if (selectedFile) {
            const uploaded = await uploadFileToCloudinary(selectedFile);
            fileUrl = uploaded.secure_url;
            messageType = selectedFile.messageType;
        }

        socket.emit("sendMessage", {
            groupId: selectedChat.groupId,
            senderId: currentUser.usersId,
            message: inputMessage,
            messageType,
            fileUrl,
        });

        setInputMessage("");
        setSelectedFile(null);
    };

    /* ---------------- SEARCH ---------------- */

    const handleSearch = async (text) => {
        setSearchText(text);

        if (!text.trim() || !currentUser?.usersId) {
            setSearchResults([]);
            return;
        }

        const res = await searchUsers(text.trim(), currentUser.usersId);
        const list = res.data?.data || [];

        setSearchResults(
            list.map((u) => ({
                usersId: Number(u.usersId),
                username: u.email.split("@")[0],
                email: u.email,
                groupId: null,
            }))
        );
    };

    /* ---------------- FILE PICKER ---------------- */

    // const handlePickImage = async () => {
    //     const result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaType.Images,
    //         quality: 0.7,
    //     });

    //     if (!result.canceled) {
    //         const asset = result.assets[0];
    //         setSelectedFile({
    //             uri: asset.uri,
    //             name: asset.fileName || `image_${Date.now()}.jpg`,
    //             type: asset.mimeType || "image/jpeg",
    //             messageType: "image",
    //         });
    //     }
    // };

    const handlePickDocument = async () => {
        const res = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true,
        });

        if (!res.canceled) {
            const file = res.assets[0];
            setSelectedFile({
                uri: file.uri,
                name: file.name,
                type: file.mimeType || "application/octet-stream",
                messageType: "file",
            });
        }
    };

    /* ---------------- RENDER ---------------- */

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {showSidebar && (
                    <View style={styles.sidebar}>
                        <TextInput
                            placeholder="Search users..."
                            value={searchText}
                            onChangeText={handleSearch}
                            style={styles.searchInput}
                        />

                        <FlatList
                            data={searchText ? searchResults : contacts}
                            keyExtractor={(item) => item.usersId.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.contact}
                                    onPress={() => openChat(item)}
                                >
                                    <Text style={styles.username}>{item.username}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

                {!showSidebar && selectedChat && (
                    <View style={styles.chatArea}>
                        <View style={styles.chatUserBar}>
                            <Text style={styles.chatUsername}>{selectedChat.username}</Text>
                        </View>

                        <ScrollView ref={scrollRef} style={styles.messages}>
                            {messages.map((msg, i) => {
                                const isMine = msg.senderId === currentUser.usersId;

                                return (
                                    <View
                                        key={i}
                                        style={isMine ? styles.msgMine : styles.msgOther}
                                    >
                                        {/* IMAGE */}
                                        {msg.messageType === "image" && msg.fileUrl && (
                                            <TouchableOpacity onPress={() => Linking.openURL(msg.fileUrl)}>
                                                <Image
                                                    source={{ uri: msg.fileUrl }}
                                                    style={styles.image}
                                                />
                                            </TouchableOpacity>
                                        )}

                                        {/* FILE */}
                                        {msg.messageType === "file" && msg.fileUrl && (
                                            <TouchableOpacity onPress={() => Linking.openURL(msg.fileUrl)}>
                                                <Text style={{ color: "#007bff", fontWeight: "600" }}>
                                                    📎 {msg.fileUrl.split("/").pop()}
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        {/* TEXT */}
                                        {msg.messageType === "text" && (
                                            <Text style={{ color: isMine ? "#fff" : "#000" }}>
                                                {msg.message}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>

                        {selectedFile && (
                            <View style={styles.previewBox}>
                                <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
                                <TouchableOpacity
                                    style={styles.removePreview}
                                    onPress={() => setSelectedFile(null)}
                                >
                                    <Text style={{ color: "#fff" }}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.inputArea}>
                            {/* <TouchableOpacity onPress={handlePickImage}>
                                <Text style={{ fontSize: 22 }}>🖼️</Text>
                            </TouchableOpacity> */}

                            <TouchableOpacity onPress={handlePickDocument} style={{ marginLeft: 10 }}>
                                <Text style={{ fontSize: 22 }}>📎</Text>
                            </TouchableOpacity>

                            <TextInput
                                style={styles.input}
                                placeholder="Type a message..."
                                value={inputMessage}
                                onChangeText={(t) => {
                                    setInputMessage(t);
                                    socket.emit("typing", {
                                        groupId: selectedChat.groupId,
                                        usersId: currentUser.usersId,
                                    });
                                }}
                                multiline
                            />

                            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                                <Text style={styles.sendBtnText}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#fff",
    },
    sidebar: {
        flex: 1,
        borderRightWidth: 1,
        borderColor: "#ddd",
        padding: 12,
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    contact: {
        paddingVertical: 12,
        borderBottomWidth: 0.5,
    },
    username: {
        fontSize: 16,
    },
    chatArea: {
        flex: 2,
        padding: 0,
        backgroundColor: "#f7f7f7",
    },
    chatHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    backButton: {
        fontSize: 26,
        marginRight: 12,
    },
    chatTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    messages: {
        flex: 1,
        padding: 12,
    },
    msgMine: {
        alignSelf: "flex-end",
        backgroundColor: "#007bff",
        padding: 10,
        borderRadius: 14,
        marginVertical: 4,
        maxWidth: "80%",
    },

    msgOther: {
        alignSelf: "flex-start",
        backgroundColor: "#e0e0e0",
        padding: 10,
        borderRadius: 14,
        marginVertical: 4,
        maxWidth: "80%",
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginBottom: 6,
    },
    inputArea: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        marginHorizontal: 8,
    },
    chatUserBar: {
        width: "100%",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#eeeeee",
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    chatUsername: {
        fontSize: 17,
        fontWeight: "600",
        color: "#555",
    },
    sendBtn: {
        backgroundColor: "#007bff",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    sendBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
    previewBox: {
        position: "relative",
        margin: 8,
        alignSelf: "flex-start",
    },

    previewImage: {
        width: 120,
        height: 120,
        borderRadius: 10,
    },

    removePreview: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: "red",
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
    },

});
