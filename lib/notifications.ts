interface AndroidInterface {
    createNotification(title: string, message: string): void;
}

declare global {
    interface Window {
        Android?: AndroidInterface;
    }
}

export const showNotification = (title: string, message: string) => {
    if (window.Android) {
        window.Android.createNotification(title, message);
    }
}
