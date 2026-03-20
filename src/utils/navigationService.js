// src/utils/navigationService.js
import { router } from 'expo-router';

export const resetToLogin = () => {
    // If we are deep in a stack, dismiss everything first
    if (router.canGoBack()) {
        router.dismissAll();
    }
    // Replace with the path to your login screen
    router.replace('/screens/index'); 
};