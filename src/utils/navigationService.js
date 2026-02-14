import { CommonActions } from "@react-navigation/native";

let navigator;

export function setNavigator(navRef) {
    navigator = navRef;
}

export function resetToLogin() {
    navigator.dispatch(
        CommonActions.reset({
            index: 0,
            routes: [{ name: "Login" }],
        })
    );
}
