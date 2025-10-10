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
  type?: "text" | "select" | "file" | "date" | "radio" | "number" | "textarea";
  id?: string;
  width?: string;
  error?: string | false;
  disabled?: boolean;
  isSingle?: boolean; 
  required?: boolean;
  loading?: boolean; 
  searchable?: boolean | string;
  placeholder?: string;
  textareaCols?: number;
  textareaRows?: number;
  textareaResize?: boolean;
  leadingElement?: React.ReactNode;
  trailingElement?: React.ReactNode;
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
  required = false,
  loading = false,
  searchable = false,
  placeholder,
  textareaCols = 3,
  textareaRows = 3,
  textareaResize = true,
  leadingElement,
  trailingElement
}: Props) {

  const [dropdownProperties, setDropdownProperties] = useState({
    width: "0",
    top: "0",
    left: "0"
  })

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMulti = (options && options.length > 0 && typeof isSingle !== 'undefined' && isSingle === false) || (loading && isSingle === false);
  const isSingleSelect = (options && options.length > 0 && isSingle !== false) || (loading && isSingle !== false);
  const selectedValues: string[] = Array.isArray(value) ? value : [];
  const isSearchable = searchable === true || searchable === 'true' || searchable === '1';

  const filteredOptions = (options?.filter(opt => {
    const label = opt.label.toLowerCase();
    // Remove options like 'Select Region', 'Select Item', 'Select ...'
    if (label.startsWith('select ')) return false;
    return label.includes(search.toLowerCase());
  })) || [];

useEffect(() => {
    const dropdown = dropdownRef.current;
      if (dropdown) {
        const { width, top, left, height } = dropdown.getBoundingClientRect();
        setDropdownProperties({ width: `${width}px`, top: `${top+height}px`, left: `${left}px` });
    }
    function handleClick(event: MouseEvent) {
            // Check if the ref exists and if the clicked target is a node
            if (dropdownRef.current && event.target instanceof Node) {
                if (!dropdownRef.current.contains(event.target)) {
                    setDropdownOpen(false);
                }
            }
        }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);


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

  const createMultiSelectEvent = (vals: string[]): MultiSelectChangeEvent => {
    return { target: { value: vals, name } };
  };

  const createSingleSelectEvent = (val: string): SingleSelectChangeEvent => {
    return { target: { value: val, name } };
  };

  const safeOnChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | MultiSelectChangeEvent | SingleSelectChangeEvent
  ) => {
    if (typeof onChange === 'function') {
      onChange(event as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>);
    } else {
      console.warn('InputFields: onChange prop is not a function. You must pass (e) => setValue(e.target.value)');
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === filteredOptions.length) {
      safeOnChange(createMultiSelectEvent([]));
    } else {
      safeOnChange(createMultiSelectEvent(filteredOptions.map(opt => opt.value)));
    }
  };

  const handleCheckbox = (val: string) => {
    safeOnChange(
      createMultiSelectEvent(
        selectedValues.includes(val)
          ? selectedValues.filter(v => v !== val)
          : [...selectedValues, val]
      )
    );
  };


  return (
    <div className={`flex flex-col gap-2 w-full ${width}`}>
      <label
        htmlFor={id ?? name}
        className="text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "radio" && options && options.length > 0 ? (
        <div className="flex-wrap flex gap-4 mt-3">
          {options.map((opt, idx) => (
            <label key={opt.value + idx} className="inline-flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => safeOnChange(createSingleSelectEvent(opt.value))}
                disabled={disabled}
                className={`w-4 h-4 accent-gray-600 border-2 border-gray-600 focus:ring-2 focus:ring-red-400 appearance-none rounded-full checked:bg-red-500 checked:w-3 checked:h-3 checked:border-red-600 ${error ? "border-red-500" : "border-gray-300"}`}
                style={{ boxShadow: value === opt.value ? '0 0 0 2px #fff, 0 0 0 4px #252b37' : undefined }}
              />
              <span className="text-lg text-gray-600">{opt.label}</span>
            </label>
          ))}
          {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
      ) : isMulti ? (
        <div className="relative" ref={dropdownRef}>
          <div
            className={`border h-[44px] w-full rounded-md px-3 mt-[6px] flex items-center cursor-pointer bg-white ${error ? "border-red-500" : "border-gray-300"}`}
            onClick={() => { if (!loading && !isSearchable) setDropdownOpen(v => !v); }}
          >
            {isSearchable ? (
              (() => {
                const selectedLabels = options?.filter(opt => selectedValues.includes(opt.value)).map(o => o.label) || [];
                const displayValue = search || (selectedLabels.length > 0 ? selectedLabels.slice(0,2).join(', ') : '');
                const hasSelection = !search && selectedLabels.length > 0;
                return (
                  <input
                    type="text"
                    placeholder={selectedValues.length === 0 ? `Search ${label}` : undefined}
                    value={displayValue}
                    onChange={e => {
                      const v = (e.target as HTMLInputElement).value;
                      setSearch(v);
                      if (!dropdownOpen) setDropdownOpen(true);
                      if (v === '') {
                        // user cleared the input -> clear selected values for multi-select
                        safeOnChange(createMultiSelectEvent([]));
                      }
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    className={`flex-1 truncate text-sm outline-none border-none ${hasSelection ? 'text-gray-900' : 'text-gray-400'}`}
                    style={hasSelection ? { color: '#111827' } : undefined}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!loading && filteredOptions.length > 0) {
                          // select first match for searchable Enter
                          handleCheckbox(filteredOptions[0].value);
                        }
                      }
                    }}
                  />
                );
              })()
            ) : (
              <span className={`truncate flex-1 ${selectedValues.length === 0 ? "text-gray-400" : "text-gray-900"}`}>
                {loading
                  ? <span className="flex items-center gap-2 text-gray-400"><svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Loading...</span>
                  : (() => {
                      const selectedLabels = options?.filter(opt => selectedValues.includes(opt.value)).map(opt => opt.label) || [];
                      if (selectedValues.length === 0) {
                        return `Select ${label}`;
                      }
                      if (selectedLabels.length <= 2) {
                        return selectedLabels.join(", ");
                      } else {
                        return selectedLabels.slice(0, 2).join(", ");
                      }
                    })()
                }
              </span>
            )}
            {/* Show +N before the arrow if more than 2 selected */}
            {(() => {
              const selectedLabels = options?.filter(opt => selectedValues.includes(opt.value)).map(opt => opt.label) || [];
              if (selectedLabels.length > 2) {
                return <span className="ml-2 font-medium text-gray-700">+{selectedLabels.length - 2}</span>;
              }
              return null;
            })()}
            {!isSearchable && (
              <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            )}
          </div>
          {dropdownOpen && !loading && (
            <>
              <div style={dropdownProperties} className="fixed z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {!isSearchable && (
                  <div className="px-3 py-2 border-b flex items-center" style={{ borderBottomColor: '#9ca3af' }}>
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                    <input
                      type="text"
                      placeholder="Search"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full border-none outline-none text-sm"
                    />
                  </div>
                )}
                <div
                  className="flex items-center px-3 py-2 border-b cursor-pointer"
                  style={{ borderBottomColor: '#9ca3af' }}
                  onClick={handleSelectAll}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.length === filteredOptions.length && filteredOptions.length > 0}
                    onChange={e => {
                      e.stopPropagation();
                      handleSelectAll();
                    }}
                    className="mr-2 cursor-pointer"
                    style={selectedValues.length === filteredOptions.length && filteredOptions.length > 0 ? { accentColor: '#EA0A2A' } : {}}
                  />
                  <span className="text-sm select-none">Select All</span>
                </div>
                <div className="max-h-80 overflow-auto">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-2 text-gray-400 text-sm">No options</div>
                  ) : filteredOptions.map((opt, idx) => (
                    <div
                      key={opt.value + idx}
                      className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={e => {
                        e.preventDefault();
                        handleCheckbox(opt.value);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(opt.value)}
                        onChange={e => {
                          e.stopPropagation();
                          handleCheckbox(opt.value);
                        }}
                        className="mr-2 cursor-pointer"
                        style={selectedValues.includes(opt.value) ? { accentColor: '#EA0A2A' } : {}}
                      />
                      <label
                        className="text-sm select-none cursor-pointer text-gray-800"
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
            onClick={() => { if (!loading && !isSearchable) setDropdownOpen(v => !v); }}
          >
            {isSearchable ? (
              (() => {
                const selectedLabel = options?.find(opt => opt.value === value as string)?.label || '';
                const displayValue = search || selectedLabel;
                const hasSelection = !search && !!selectedLabel;
                return (
                  <input
                    type="text"
                    placeholder={!value ? `Search ${label}` : undefined}
                    value={displayValue}
                    onChange={e => {
                      const v = (e.target as HTMLInputElement).value;
                      setSearch(v);
                      if (!dropdownOpen) setDropdownOpen(true);
                      if (v === '') {
                        // user cleared the input -> clear selected value for single-select
                        safeOnChange(createSingleSelectEvent(''));
                      }
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    className={`flex-1 truncate text-sm outline-none border-none ${hasSelection ? 'text-gray-900' : 'text-gray-400'}`}
                    style={hasSelection ? { color: '#111827' } : undefined}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!loading && filteredOptions.length > 0) {
                          safeOnChange(createSingleSelectEvent(filteredOptions[0].value));
                          setDropdownOpen(false);
                          setSearch("");
                        }
                      }
                    }}
                  />
                );
              })()
            ) : (
              <span className={`truncate flex-1 ${!value ? "text-gray-400" : "text-gray-900"}`}>
                {loading
                  ? <span className="flex items-center gap-2 text-gray-400"><svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Loading...</span>
                  : (!value ? `Select ${label}` : options?.find(opt => opt.value === value)?.label)
                }
              </span>
            )}
            {!isSearchable && (
              <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            )}
          </div>
          {dropdownOpen && !loading && (
            <div style={dropdownProperties} className="fixed z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-auto">
              {!isSearchable && (
                <div className="px-3 py-2 border-b flex items-center" style={{ borderBottomColor: '#9ca3af' }}>
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
              )}
              <div>
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-gray-400 text-sm">No options</div>
                ) : filteredOptions.map((opt, idx) => (
                  <div
                    key={opt.value + idx}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${value === opt.value ? "bg-gray-50" : ""}`}
                    onClick={() => {
                      safeOnChange(createSingleSelectEvent(opt.value));
                      setDropdownOpen(false);
                      setSearch("");
                    }}
                  >
                    <div className="text-sm text-gray-800">{opt.label}</div>
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
          autoComplete="off"
          className={`border h-[44px] w-full rounded-md px-3 py-1 mt-[6px] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${error ? "border-red-500" : "border-gray-300"
            }`}
        />
      ) : type === "text" ? (
        <div className="w-full relative">
          <input
            id={id ?? name}
            name={name}
            type="text"
            value={value ?? ""}
            onChange={safeOnChange}
            disabled={disabled}
            onBlur={onBlur}
            autoComplete="off"
            className={`box-border border h-[44px] w-full rounded-md ${leadingElement ? "pl-10" : "pl-3"} ${trailingElement ? "pr-10" : "pr-3"} mt-[6px] text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-300"}`}
            placeholder={ placeholder || `Enter ${label}` }
          />
          {(leadingElement || trailingElement) && (
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 pointer-events-none">
              {leadingElement ? (
                <div className="flex items-center pointer-events-auto h-full mt-[6px] p-2">
                  {leadingElement}
                </div>
              ) : <div />} 
              {trailingElement ? (
                <div className="flex items-center pointer-events-auto h-full mt-[6px] p-2">
                  {trailingElement}
                </div>
              ) : <div />}
            </div>
          )}
        </div>
      ) : type === "date" ? (
        <input
          id={id ?? name}
          name={name}
          type="date"
          value={value ?? ""}
          onChange={safeOnChange}
          disabled={disabled}
          onBlur={onBlur}
          className={`border h-[44px] w-full rounded-md px-3 mt-[6px] text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-300"}`}
          placeholder={`Enter ${label}`}
        />
      ): type === "number" ? (
        <input
          id={id ?? name}
          name={name}
          type="number"
          value={value ?? ""}
          onChange={safeOnChange}
          disabled={disabled}
          onBlur={onBlur}
          className={`border h-[44px] w-full rounded-md px-3 mt-[6px] text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-300"}`}
          placeholder={`Enter ${label}`}
        />
      ): type === "textarea" ? (
        <textarea
          id={id ?? name}
          name={name}
          value={value ?? ""}
          onChange={safeOnChange}
          disabled={disabled}
          className={`border w-full rounded-md px-[14px] py-[10px] mt-[6px] text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-300"}`}
          placeholder={placeholder || `Enter ${label}`}
          cols={textareaCols}
          rows={textareaRows}
          style={textareaResize === false ? { resize: 'none' } : {}}
        />
      ): null}
    </div>
  );
}