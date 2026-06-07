import React, { useState, useEffect } from "react";
import Toast from "./showToast";
import { setToastHandler } from "../utils/showToastService"; // ✅ FIX

const ToastContainer = () => {
 const [toast, setToast] = useState(null);

useEffect(() => {
  setToastHandler((type, message) => {
    setToast({
      id: Date.now(),
      type,
      message,
    });
  });
}, []);

const removeToast = () => {
  setToast(null);
};
  return (
    <div className="fixed top-5 right-5 space-y-3 z-50">
      {toast && <Toast key={toast.id} {...toast} onClose={removeToast} />}
    </div>
  );
};

export default ToastContainer;