"use client";
import React, { useState, useMemo } from "react";

type Option = {
  value: string | number;
  label: string;
};

type Props = {
  label: string;
  name: string;
  value?: string | number;
  options: Option[];
  onChange: (value: string | number) => void;
  id?: string;
  width?: string;
  error?: string | false;
  placeholder?: string;
};

export default function SearchableDropdown({
  label,
  name,
  id,
  value,
  options,
  onChange,
  width = "max-w-[406px]",
  error,
  placeholder = "Search...",
}: Props) {
  const [query, setQuery] = useState("");

  // ✅ Filter options based on search
  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, options]);

  // ✅ Get current label
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || "";

  return (
    <div className={`flex flex-col gap-2 w-full ${width}`}>
      <label
        htmlFor={id ?? name}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      {/* Input + Dropdown */}
      <div className="relative">
        <input
          type="text"
          id={id ?? name}
          value={query || selectedLabel}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`border h-[44px] w-full rounded-md px-3 text-gray-900 placeholder-gray-400 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />

        {/* Dropdown list */}
        {query.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md max-h-40 overflow-y-auto shadow">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                  onClick={() => {
                    onChange(opt.value);
                    setQuery(opt.label); // show label in input
                  }}
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500 text-sm">
                No results found
              </li>
            )}
          </ul>
        )}
      </div>

      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
}
