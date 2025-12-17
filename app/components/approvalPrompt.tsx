"use client";

import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { Icon } from "@iconify-icon/react";

interface DeleteConfirmProps {
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function DeletePrompt({
  onClose,
  onConfirm,
  title = "Confirm",
  message,
}: DeleteConfirmProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="bg-white rounded-lg w-full shadow-lg border border-gray-200 max-h-[90vh] overflow-y-auto p-4 sm:p-5"
    >
      {/* Warning Icon */}
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <Icon
            icon="material-symbols:warning"
            className="text-orange-500"
            width={26}
            height={26}
          />
        </div>
      </div>

      {/* Title */}
      {title && (
        <h2 className="text-center text-lg font-semibold text-gray-900 mb-1">
          {title}
        </h2>
      )}

      {message && (
        <div className="text-center mb-4">
          <p className="text-gray-700 text-sm leading-5">{message}</p>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex justify-center gap-3 mt-5">
        <button
          type="button"
          className="px-5 py-2 h-[38px] min-w-[110px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
          onClick={onClose}
        >
          No, mistake!
        </button>
        <SidebarBtn
          isActive={true}
          label="Yes, confirm!"
          onClick={handleConfirm}
          labelTw="hidden sm:block min-w-[110px]"
        />
      </div>
    </div>
  );
}
