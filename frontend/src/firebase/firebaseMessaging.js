import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseApp } from "./firebaseConfig";
const messaging = getMessaging(firebaseApp);

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_VAPID_KEY
            });
            console.log("Token:", token);
            return token;
        }
    } catch (error) {
        console.log("Error requesting permission:", error);
        return null;
    }
};

export const onforegroundMessage = () => {
    onMessage(messaging, (payload) => {
        console.log("Message received. ", payload);
    });
}