"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
  return options
    .filter(opt => opt.label) // only include items with a label
    .filter(opt => opt.label!.toLowerCase().includes(query.toLowerCase()));
}, [query, options]);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || "";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`flex flex-col gap-2 w-full ${width}`}
    >
      <label
        htmlFor={id ?? name}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        {/* Input field */}
        <input
          type="text"
          id={id ?? name}
          value={query || selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true); // keep open while typing
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`border h-[44px] w-full rounded-md px-3 text-gray-900 placeholder-gray-400 cursor-pointer ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          readOnly={false}
        />

        {/* Dropdown list */}
        {isOpen && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md max-h-52 overflow-y-auto shadow-md">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm ${
                    opt.value === value ? "bg-gray-200" : ""
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setQuery(""); // reset query
                    setIsOpen(false); // close dropdown
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
