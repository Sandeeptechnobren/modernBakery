"use client";
import { useState } from "react";
import SidebarBtn from "./dashboardSidebarBtn";
import InputFields from "./inputFields";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function SettingPopUp({ isOpen, onClose, title }: ModalProps) {
  const [option, setOption] = useState("auto");
  const [prefix, setPrefix] = useState("");
  const [nextNumber, setNextNumber] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Title */}
        {title && (
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
        )}

        {/* Message */}
        <p className="text-sm text-gray-600 mb-4">
          Your {title} number is set in auto-generate mode to save your time.
          Are you sure about changing this setting?
        </p>

        {/* Radio Options */}
        <div className="space-y-3 mb-4">
             
          <label className="flex items-center gap-2">
            <input 
              type="radio"
              value="auto"
              checked={option === "auto"}
              onChange={(e) => setOption(e.target.value)}
            />
            Continue auto-generating {title}
          </label>

          {/* Show input fields only when auto is selected */}
          {option === "auto" && (
            <div className="ml-6 mt-2 flex gap-3">
                <InputFields
                            label="Prefix"
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value)}
                          />
              
              <InputFields
                            label="Next Number"
                            value={nextNumber}
                            onChange={(e) => setNextNumber(e.target.value)}
                          />
              
            </div>
          )}

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="manual"
              checked={option === "manual"}
              onChange={(e) => setOption(e.target.value)}
            />
            I will add them manually each time
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <SidebarBtn
            label={`Save ${title}`}
            isActive={true}
            onClick={() =>
              console.log({
                option,
                prefix,
                nextNumber,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
