import React from "react";
import { Icon } from "@iconify-icon/react";
import CustomPasswordInput from "@/app/components/customPasswordInput";

interface ResetPasswordSidebarProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setFieldValue: (field: string, value: any) => void;
  values: {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
}

const ResetPasswordSidebar: React.FC<ResetPasswordSidebarProps> = ({
  show,
  onClose,
  onSubmit,
  setFieldValue,
  values,
}) => {
  if (!show) return null;
  const [touched, setTouched] = React.useState({
    newPassword: false,
    confirmPassword: false,
  });
  const passwordsMatch = values.newPassword === values.confirmPassword;
  const isDisabled =
    !values.oldPassword ||
    !values.newPassword ||
    !values.confirmPassword ||
    !passwordsMatch;
  return (
    <>
      {/* Overlay */}
      <div
        className="h-full fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-1/3 bg-white z-50 shadow-lg transform transition-transform duration-300 translate-x-0">
        <div className="flex items-center justify-between p-5 border-b border-gray-400">
          <h2 className="text-lg font-semibold">Reset Password</h2>
          <button onClick={onClose}>
            <Icon icon="lucide:x" width={22} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-7 space-y-6">
          <CustomPasswordInput
            required
            label="Old Password"
            value={values.oldPassword || ""}
            onChange={e => setFieldValue("oldPassword", e.target.value)}
          />
          <CustomPasswordInput
            required
            label="New Password"
            value={values.newPassword || ""}
            onChange={e => {
              setFieldValue("newPassword", e.target.value);
              setTouched(t => ({ ...t, newPassword: true }));
            }}
            onBlur={() => setTouched(t => ({ ...t, newPassword: true }))}
          />
          <CustomPasswordInput
            required
            label="Confirm Password"
            value={values.confirmPassword || ""}
            onChange={e => {
              setFieldValue("confirmPassword", e.target.value);
              setTouched(t => ({ ...t, confirmPassword: true }));
            }}
            onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))}
            error={
              touched.confirmPassword && values.confirmPassword && !passwordsMatch
                ? "Passwords do not match"
                : undefined
            }
          />
          <div className="flex justify-start">
            <button
              type="submit"
              className="bg-red-600 text-white w-[160px] py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={isDisabled}
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ResetPasswordSidebar;
