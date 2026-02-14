import * as SecureStore from 'expo-secure-store';
import api from './api';

export const loginUser = async (email, password) => {
    try {
        const response = await api.post("/login", { email, password });
        const token = response.data.access_token;

        // Save token securely for biometric login
        await SecureStore.setItemAsync("access_token", token);
        await SecureStore.setItemAsync("email", email);

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
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("email");
    }
};
