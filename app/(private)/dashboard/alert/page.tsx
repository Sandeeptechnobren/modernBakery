"use client";
import { useState } from "react";
import Snackbar from "@/app/components/Snackbar";

export default function TestPage() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  return (
    <div className="p-6 space-x-4">
      <button
        className="px-4 py-2 bg-green-600 text-white rounded"
        onClick={() =>
          setSnackbar({ open: true, message: "Saved Successfully!", type: "success" })
        }
      >
        Show Success
      </button>

      <button
        className="px-4 py-2 bg-red-600 text-white rounded"
        onClick={() =>
          setSnackbar({ open: true, message: "Something went wrong!", type: "error" })
        }
      >
        Show Error
      </button>

      <button
        className="px-4 py-2 bg-yellow-500 text-black rounded"
        onClick={() =>
          setSnackbar({ open: true, message: "This is a warning!", type: "warning" })
        }
      >
        Show Warning
      </button>

      {/* Snackbar Component */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </div>
  );
}
