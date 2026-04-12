import axios from "axios";
import * as SecureStore from 'expo-secure-store'; // CHANGED
import { API_URL } from "../services/config";
import { resetToLogin } from "../utils/navigationService";

let isRedirecting = false;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Accept': "application/json",
        "Content-Type": "application/json",
        'X-Requested-With': 'XMLHttpRequest',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync("access_token");
        console.log("DEBUG: Token found for request:", token ? "YES (starts with " + token.substring(0, 5) + ")" : "NO");

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

                const cacheKeys = ["access_token", "user_email"];
                await Promise.all(cacheKeys.map((key) => SecureStore.deleteItemAsync(key)));

                resetToLogin();

                setTimeout(() => { isRedirecting = false; }, 2000);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

export function post(arg0, arg1) {
    throw new Error('Function not implemented.');
}
