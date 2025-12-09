"use client";

import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { Icon } from "@iconify-icon/react";

interface DeleteConfirmProps {
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirmPopup({
  onClose,
  onConfirm,
  title = "Delete",
}: DeleteConfirmProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="
        bg-white rounded-lg 
        w-full sm:max-w-[450px] 
        max-h-[90vh] 
        overflow-y-auto 
        p-4 sm:p-6
      "
    >
      {/* Warning Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
          <Icon
            icon="material-symbols:warning"
            className="text-orange-500"
            width={32}
            height={32}
          />
        </div>
      </div>

      {/* Title */}
      {title && (
        <h2 className="text-center text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      )}

      {/* Message */}
      {/* <div className="text-center mb-6">
        <p className="text-gray-700 text-base">{title}?</p>
      </div> */}

      {/* Footer Buttons */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          type="button"
          className="px-6 py-2 h-[40px] min-w-[120px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
          onClick={onClose}
        >
          No, mistake!
        </button>
        <SidebarBtn
                                            
                                            isActive={true}
                                            label="Yes, confirm !"
                                            onClick={handleConfirm}
                                            labelTw="hidden sm:block min-w-[120px]"
                                        />
      
      </div>
    </div>
  );
}
