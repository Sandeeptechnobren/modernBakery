"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ App Router hook
import Popup from "@/app/components/popUp";
import CustomPasswordInput from "@/app/components/customPasswordInput";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(true); // auto open when route loads
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleClose = () => {
    setIsPopupOpen(false);
    router.push("/dashboard/settings"); // ✅ redirect to settings page
  };

  return (
    <Popup isOpen={isPopupOpen} onClose={handleClose}>
      <h2 className="text-lg  py-5 font-semibold mb-4">Change Password</h2>

      <form className="space-y-9">
        <CustomPasswordInput
          label="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <CustomPasswordInput
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <CustomPasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={handleClose} // ✅ Cancel redirects
          >
            Cancel
          </button>

          <SidebarBtn
            label="Save Role"
            isActive={true}
            onClick={handleClose} // ✅ Save also redirects
          />
        </div>
      </form>
    </Popup>
  );
}
