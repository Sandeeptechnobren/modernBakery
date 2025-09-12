"use client";
import React from "react";

type Option = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  value?: string; // optional since file input doesn’t use it directly
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  options?: Option[]; // if present → render select
  type?: "text" | "select" | "file";
  id?: string; 
  width?: string;
};

export default function InputFields({
  label,
  id,
  value,
  onChange,
  options,
  type = "text",
  width = "max-w-[406px]",
}: Props) {

  return (
    <div className={`flex flex-col gap-2 w-full ${width}`}>
      <label
        htmlFor={label}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      {options && options.length > 0 ? (
        <select
          id={label}
          value={value}
          onChange={onChange}
          className="border h-[44px] w-full border-gray-300 rounded-md px-3 mt-[6px] text-gray-900"
        >
          <option value="" disabled hidden className="text-gray-400">
            {`Select ${label}`}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "file" ? (
        <input
          id={label}
          type="file"
          onChange={onChange}
          className="border border-gray-300 h-[44px] w-full rounded-md px-3 py-1 mt-[6px] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold"
        />
      ) : (
        <input
          id={label}
          type="text"
          value={value}
          onChange={onChange}
          className="border border-gray-300 h-[44px] w-full rounded-md px-3 mt-[6px] text-gray-900 placeholder-gray-400"
          placeholder={`Enter ${label}`}
        />
      )}
    </div>
  );
}
