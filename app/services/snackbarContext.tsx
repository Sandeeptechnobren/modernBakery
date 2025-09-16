"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Snackbar from "../components/Snackbar";

type SnackbarType = "success" | "error" | "warning" | "info";

type SnackbarContextProps = {
  showSnackbar: (message: string, type?: SnackbarType) => void;
  closeSnackbar: () => void;
};

const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined
);

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<SnackbarType>("info");

  const showSnackbar = useCallback((msg: string, t: SnackbarType = "info") => {
    setMessage(msg);
    setType(t);
    setOpen(true);
  }, []);

  const closeSnackbar = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, closeSnackbar }}>
      {children}
      <Snackbar message={message} type={type} open={open} onClose={closeSnackbar} />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return ctx;
};
