// src/utils/navigationService.js
import { router } from 'expo-router';

export const resetToLogin = () => {
    if (router.canGoBack()) {
        router.dismissAll();
    }
    router.replace('/screens/index'); 
};