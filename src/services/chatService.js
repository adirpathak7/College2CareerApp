import API from "./api";

export const getUserGroups = (userId) =>
    API.get(`/api/getUserGroups/${userId}`);

export const getGroupMessages = (groupId) =>
    API.get(`/api/getGroupMessages/${groupId}`);

export const createOrGetOneToOneGroup = (user1, user2) =>
    API.post(`/api/createOrGetOneToOneGroup`, { user1, user2 });

export const sendMessageRest = (payload) =>
    API.post(`/api/sendMessage`, payload);

export const getChatContacts = (usersId) =>
    API.get(`/api/getChatContacts/${usersId}`);

export const searchUsers = (query, currentUserId) =>
    API.get(
        `/api/searchUsers?q=${query}&currentUserId=${currentUserId}`
    );
