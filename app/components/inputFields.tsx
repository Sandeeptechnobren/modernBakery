"use client";
import React from "react";

type Option = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  name?: string;
  value?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  options?: Option[];
  type?: "text" | "select" | "file";
  id?: string;
  width?: string;
  error?: string | false;
};

export default function InputFields({
  label,
  name,
  id,
  value,
  onChange,
  options,
  type = "text",
  width = "max-w-[406px]",
  error,
}: Props) {
  return (
    <div className={`flex flex-col gap-2 w-full ${width}`}>
      <label
        htmlFor={id ?? name}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      {options && options.length > 0 ? (
        <select
          id={id ?? name}
          name={name}
          value={value}
          onChange={onChange}
          className={`border h-[44px] w-full rounded-md px-3 mt-[6px] ${error ? "border-red-500" : "border-gray-300"
            } text-gray-900`}
        >
          <option value="" disabled hidden className="text-gray-400">
            {`Select ${label}`}
          </option>
          {options.map((opt, idx) => (
            <option key={`${opt.value}-${idx}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "file" ? (
        <input
          id={id ?? name}
          name={name}
          type="file"
          onChange={onChange}
          className={`border h-[44px] w-full rounded-md px-3 py-1 mt-[6px] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${error ? "border-red-500" : "border-gray-300"
            }`}
        />
      ) : (
        <input
          id={id ?? name}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          className={`border h-[44px] w-full rounded-md px-3 mt-[6px] text-gray-900 placeholder-gray-400 ${error ? "border-red-500" : "border-gray-300"
            }`}
          placeholder={`Enter ${label}`}
        />
      )}

      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
}
