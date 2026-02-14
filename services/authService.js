import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export const loginUser = async (email, password) => {
    try {
        const response = await api.post("/login", {
            email,
            password,
        });

        const token = response.data.access_token;

        // Save token
        await AsyncStorage.setItem("access_token", token);

        return response.data.user;

    } catch (error) {
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await api.post("/logout");
    } catch (error) {
        console.log("Logout error:", error);
    } finally {
        await AsyncStorage.removeItem("access_token");
    }
};
