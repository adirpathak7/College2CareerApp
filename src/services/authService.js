import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export async function retrieveDataFromJWTToken() {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return null;

    const decoded = jwtDecode(token);

    const usersIdRaw = decoded.usersId;
    const usersId = usersIdRaw ? Number(usersIdRaw) : null;

    const email =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];

    const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    return { usersId, email, role };
}
