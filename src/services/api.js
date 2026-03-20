import axios from "axios";
import * as SecureStore from 'expo-secure-store'; // CHANGED
import { API_URL } from "../services/config";
import { resetToLogin } from "../utils/navigationService";

// Prevents multiple 401s from firing multiple redirects
let isRedirecting = false;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    async (config) => {
        // CHANGED: Use SecureStore.getItemAsync
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 419) &&
            !originalRequest.url.includes("/login")
        ) {
            if (!isRedirecting) {
                isRedirecting = true;
                console.warn("⚠️ Session expired — clearing storage and redirecting...");

                // CHANGED: Use SecureStore to clear keys
                const cacheKeys = ["access_token", "email"]; 
                await Promise.all(cacheKeys.map((key) => SecureStore.deleteItemAsync(key)));

                resetToLogin();

                // Reset flag after 2 seconds
                setTimeout(() => { isRedirecting = false; }, 2000);
            }
        }

        return Promise.reject(error);
    }
);

export default api;