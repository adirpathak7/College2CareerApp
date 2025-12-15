import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API = axios.create({
    baseURL: 'http://10.241.80.208:5000',
    timeout: 10000,
});

API.interceptors.request.use(async (req) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
