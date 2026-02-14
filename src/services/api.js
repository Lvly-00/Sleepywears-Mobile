import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../services/config";
import { resetToLogin } from "../utils/navigationService";

// ---- TOKEN HANDLER ----
const getToken = async () => {
    return await AsyncStorage.getItem("access_token");
};

// ---- AXIOS INSTANCE ----
const api = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// ---- REQUEST INTERCEPTOR ----
api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// ---- RESPONSE INTERCEPTOR ----
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 419) &&
            !originalRequest.url.includes("/login") &&
            !originalRequest.url.includes("/register")
        ) {
            console.warn("⚠️ Session expired — clearing storage and redirecting...");

            const cacheKeys = [
                "access_token",
                "collections_cache",
                "collections_cache_time",
                "user_settings_cache",
                "products_cache",
                "products_cache_time",
                "dashboard_cache",
                "orderItemsCache",
                "selectedCollectionCache",
                "paginationCache",
                "orderItemsCache_v2",
                "collectionsCache_v2",
                "selectedCollectionCache_v2"
            ];

            await Promise.all(cacheKeys.map((key) => AsyncStorage.removeItem(key)));

            // Navigate back to login screen
            resetToLogin();
        }

        return Promise.reject(error);
    }
);

export default api;
