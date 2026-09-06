/**
 * @file notifications.ts
 * @description Handles integration with the Android native layer for showing
 * system-level notifications on the mobile device.
 */

/**
 * Interface for the Android native bridge.
 */
interface AndroidInterface {
    /**
     * Triggers a native Android notification.
     * @param {string} title - The title of the notification.
     * @param {string} message - The body text of the notification.
     */
    createNotification(title: string, message: string): void;
}

declare global {
    interface Window {
        /**
         * The Android native bridge object, provided by the WebView.
         */
        Android?: AndroidInterface;
    }
}

/**
 * Shows a system notification on Android devices.
 * If the app is running in a standard browser without the Android bridge,
 * this function does nothing.
 *
 * @param {string} title - The title of the notification.
 * @param {string} message - The message to display in the notification.
 */
export const showNotification = (title: string, message: string) => {
    if (window.Android) {
        window.Android.createNotification(title, message);
    }
}
