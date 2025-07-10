import React, { createContext, useContext } from "react";
import { useToast, ToastContainer } from "../components/common/Toast";

const ToastContext = createContext();

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemoveToast={toast.removeToast} />
    </ToastContext.Provider>
  );
};
