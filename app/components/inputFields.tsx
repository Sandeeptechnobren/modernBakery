"use client";
import React from "react";

type Option = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: Option[]; // if present → render select
};

export default function InputFields({ label, value, onChange, options }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={label} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      {options && options.length > 0 ? (
        <select
          id={label}
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded-md px-3 mt-[6px]"
          style={{ height: "44px", width: "406px" }}
        >
          <option value="">{`Select ${label}`}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={label}
          type="text"
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded-md px-3 mt-[6px]"
          style={{ height: "44px", width: "406px" }}
          placeholder={`Enter ${label}`}  // ✅ moved here
        />
      )}
    </div>
  );
}
