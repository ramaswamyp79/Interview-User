// utils/showToastService.js

let toastHandler = null;

/**
 * This will be set from ToastContainer
 */
export const setToastHandler = (handler) => {
  toastHandler = handler;
};

/**
 * Call this anywhere in your app
 * Example: showToast("success", "Login successful")
 */
export const showToast = (type = "info", message = "") => {
  if (toastHandler) {
    toastHandler(type, message);
  } else {
    console.warn("Toast handler not initialized yet");
  }
};