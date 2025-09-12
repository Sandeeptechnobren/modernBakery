"use client";
import { ReactNode } from "react";

interface PopupProps {
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
}

export default function Popup({ isOpen, children, onClose }: PopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 px-4"
    onClick={onClose}
    >
      <div
        className="
          bg-white 
          w-full max-w-[446px] 
          max-h-[90vh] 
          rounded-xl shadow-lg 
          p-6 relative 
          overflow-y-auto
        "
         onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
