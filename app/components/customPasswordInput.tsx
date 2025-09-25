"use client";

import { useState } from "react";
import { Icon } from "@iconify-icon/react";

export default function CustomPasswordInput({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function togglePasswordVisibility() {
    setIsPasswordVisible((prev) => !prev);
  }

  return (
    <div className="w-full">
      <label htmlFor={label} className="text-sm text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative mt-[6px]">
        <input
          type={isPasswordVisible ? "text" : "password"}
          id={label}
          value={value}
          onChange={onChange}
          className="border h-[44px] w-full border-gray-300 rounded-md px-3 pr-10 text-sm"
          placeholder="••••••••"
        />
        <div
          className="absolute cursor-pointer text-[#717680] h-full flex items-center top-1/2 -translate-y-1/2 right-3"
          onClick={togglePasswordVisibility}
        >
          {isPasswordVisible ? (
            <Icon icon="lucide:eye-off" width={16} />
          ) : (
            <Icon icon="lucide:eye" width={16} />
          )}
        </div>
      </div>
    </div>
  );
}
