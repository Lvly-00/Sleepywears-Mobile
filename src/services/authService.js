import * as SecureStore from 'expo-secure-store';
import api from './api';


export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/login', { email, password });
        
        // response.data has { access_token, token_type, user }
        const { access_token, user } = response.data;

        return { user, token: access_token };
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
