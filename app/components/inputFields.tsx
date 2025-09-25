"use client";
import React, { useState, useRef, useEffect } from "react";

type Option = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  name?: string;
  value?: string | string[];
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  options?: Option[];
  type?: "text" | "select" | "file" | "date";
  id?: string;
  width?: string;
  error?: string | false;
  disabled?: boolean;
  isSingle?: boolean; // Optional, default false
  required?: boolean;
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
  disabled,
  onBlur,
  isSingle = true,
  required = false
}: Props) {

  // For custom multi-select dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMulti = options && options.length > 0 && typeof isSingle !== 'undefined' && isSingle === false;
  const isSingleSelect = options && options.length > 0 && isSingle !== false;
  const selectedValues: string[] = Array.isArray(value) ? value : [];

  // Filtered options for search
  const filteredOptions = options?.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isMulti || !dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen, isMulti]);


  // Custom event types for select
  type MultiSelectChangeEvent = {
    target: {
      value: string[];
      name?: string;
    };
  };
  type SingleSelectChangeEvent = {
    target: {
      value: string;
      name?: string;
    };
  };

  // Helper to create a plain event-like object for multi-select
  const createMultiSelectEvent = (vals: string[]): MultiSelectChangeEvent => {
    return { target: { value: vals, name } };
  };
  // Helper to create a plain event-like object for single-select
  const createSingleSelectEvent = (val: string): SingleSelectChangeEvent => {
    return { target: { value: val, name } };
  };

  // Helper to safely call onChange
  const safeOnChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | MultiSelectChangeEvent | SingleSelectChangeEvent
  ) => {
    if (typeof onChange === 'function') {
      onChange(event as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>);
    } else {
      // eslint-disable-next-line no-console
      console.warn('InputFields: onChange prop is not a function. You must pass (e) => setValue(e.target.value)');
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedValues.length === filteredOptions.length) {
      // Deselect all
      safeOnChange(createMultiSelectEvent([]));
    } else {
      // Select all
      safeOnChange(createMultiSelectEvent(filteredOptions.map(opt => opt.value)));
    }
  };

  // Handle individual checkbox
  const handleCheckbox = (val: string) => {
    // Use functional update to avoid stale closure
    safeOnChange(
      createMultiSelectEvent(
        selectedValues.includes(val)
          ? selectedValues.filter(v => v !== val)
          : [...selectedValues, val]
      )
    );
  };

  // Compute required error if needed
  let requiredError: string | false = false;
  if (required && (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0))) {
    requiredError = `${label} field is required`;
  }

  return (
    <div className={`flex flex-col gap-2 w-full ${width}`}>
      <label
        htmlFor={id ?? name}
        className="text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {isMulti ? (
        <div className="relative" ref={dropdownRef}>
          <div
            className={`border h-[44px] w-full rounded-md px-3 mt-[6px] flex items-center cursor-pointer bg-white ${error ? "border-red-500" : "border-gray-300"}`}
            onClick={() => setDropdownOpen(v => !v)}
          >
            <span className={`truncate flex-1 ${selectedValues.length === 0 ? "text-gray-400" : "text-gray-900"}`}>
              {selectedValues.length === 0 ? `Select ${label}` : options?.filter(opt => selectedValues.includes(opt.value)).map(opt => opt.label).join(", ")}
            </span>
            <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
          
          {dropdownOpen && (
            <>
            
            <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              <div className="px-3 py-2 border-b flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full border-none outline-none text-sm"
                />
              </div>
              <div className="flex items-center px-3 py-2 border-b">
                <input
                  type="checkbox"
                  checked={selectedValues.length === filteredOptions.length && filteredOptions.length > 0}
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                <span className="text-sm select-none">Select All</span>
              </div>
              
              <div className="max-h-40 overflow-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-gray-400 text-sm">No options</div>
                ) : filteredOptions.map((opt, idx) => (
                  <div
                    key={opt.value + idx}
                    className="flex items-center px-3 py-2 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(opt.value)}
                      onChange={e => {
                        e.stopPropagation();
                        handleCheckbox(opt.value);
                      }}
                      className="mr-2 cursor-pointer"
                    />
                    <label
                      className="text-sm select-none cursor-pointer"
                      onClick={e => {
                        e.preventDefault();
                        handleCheckbox(opt.value);
                      }}
                    >
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            </>
          )}
        </div>
      ) : isSingleSelect ? (
        <div className="relative" ref={dropdownRef}>
          <div
            className={`border h-[44px] w-full rounded-md px-3 mt-[6px] flex items-center cursor-pointer bg-white ${error ? "border-red-500" : "border-gray-300"}`}
            onClick={() => setDropdownOpen(v => !v)}
          >
            <span className={`truncate flex-1 ${!value ? "text-gray-400" : "text-gray-900"}`}>
              {!value ? `Select ${label}` : options?.find(opt => opt.value === value)?.label}
            </span>
            <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
          {dropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              <div className="px-3 py-2 border-b flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full border-none outline-none text-sm"
                  autoFocus
                />
              </div>
              <div className="max-h-40 overflow-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-gray-400 text-sm">No options</div>
                ) : filteredOptions.map((opt, idx) => (
                  <div
                    key={opt.value + idx}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${value === opt.value ? "bg-gray-100" : ""}`}
                    onClick={() => {
                      safeOnChange(createSingleSelectEvent(opt.value));
                      setDropdownOpen(false);
                      setSearch("");
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : type === "file" ? (
        <input
          id={id ?? name}
          name={name}
          type="file"
          onChange={safeOnChange}
          onBlur={onBlur}
          className={`border h-[44px] w-full rounded-md px-3 py-1 mt-[2px] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${error ? "border-red-500" : "border-gray-300"
            }`}
        />
      ) : type === "text" ? (
        <input
          id={id ?? name}
          name={name}
          type="text"
          value={value ?? ""}
          onChange={safeOnChange}
          disabled={disabled}
          onBlur={onBlur}
          className={`border h-[44px] w-full rounded-md px-3 mt-[2px] text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-300"}`}
          placeholder={`Enter ${label}`}
        />
      ) : type === "date" ? (
        <input
          id={id ?? name}
          name={name}
          type="date"
          value={value ?? ""}
          onChange={safeOnChange}
          disabled={disabled}
          onBlur={onBlur}
          className={`border h-[44px] w-full rounded-md px-3 mt-[2px] text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-300"}`}
          placeholder={`Enter ${label}`}
        />
      ): null}

      {/* Show error from props, else show required error if needed */}
      {/* {error ? (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      ) : requiredError ? (
        <span className="text-xs text-red-500 mt-1">{requiredError}</span>
      ) : null} */}
    </div>
  );
}