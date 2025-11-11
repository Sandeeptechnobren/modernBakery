"use client";
import React, { useState, useRef, useEffect } from "react";
import Skeleton from '@mui/material/Skeleton';
import 'react-phone-input-2/lib/style.css';
import LoaderCircle from "./loaderCircle";
import DateRangePicker from "./DateRangePicker";

export type Option = {
  value: string;
  label: string;
  [key: string]: unknown;
};

type PhoneCountry = {
  dialCode?: string;
  countryCode?: string;
  iso2?: string;
  name?: string;
};
type countryList = {
  flag?: string;
  code?: string;
  name?: string;
};

type Props = {
  label?: string;
  name?: string;
  value?: string | string[];
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  options?: Option[];
  type?: "text" | "select" | "file" | "date" | "dateChange" | "radio" | "number" | "textarea" | "contact";
  /** If provided, used to determine whether the date was changed compared to original value */
  originalValue?: string | null;
  id?: string;
  width?: string;
  error?: string | false;
  disabled?: boolean;
  isSingle?: boolean;
  required?: boolean;
  loading?: boolean;
  searchable?: boolean | string;
  onSearch?: (search: string) => void;
  placeholder?: string;
  textareaCols?: number;
  textareaRows?: number;
  textareaResize?: boolean;
  leadingElement?: React.ReactNode;
  trailingElement?: React.ReactNode;
  showBorder?: boolean;
  showSkeleton?: boolean;
  maxLength?: number;
  integerOnly?: boolean;
  min?: string | number;
  max?: string | number;
  setSelectedCountry?: ({ name: string; code?: string; flag?: string });
  selectedCountry?: { name: string; code?: string; flag?: string };
  /** When true and this is a multi-select, render selected values as chips inside the field */
  multiSelectChips?: boolean;
  /** Callback function to fetch options dynamically based on search text. Called when user types in searchable dropdown */
  onSearchChange?: (searchText: string) => void;
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
  onSearch = () => { },
  multiSelectChips = false,
  originalValue = null,
  placeholder,
  textareaCols = 3,
  textareaRows = 3,
  textareaResize = true,
  leadingElement,
  trailingElement,
  showBorder = true,
  maxLength,
  min,
  max,
  showSkeleton = false,
  integerOnly = false,
  setSelectedCountry,
  selectedCountry,
  onSearchChange,
}: Props) {

  const [dropdownProperties, setDropdownProperties] = useState({
    width: "0",
    top: "0",
    left: "0",
    maxHeight: "0px",
    placement: "bottom" as "bottom" | "top",
  })
  const [dropdownPropertiesString, setDropdownPropertiesString] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pointerDownRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMulti = (options && options.length > 0 && typeof isSingle !== 'undefined' && isSingle === false) || (loading && isSingle === false);
  const isSingleSelect = (options && options.length > 0 && isSingle !== false) || (loading && isSingle !== false);
  const selectedValues: string[] = Array.isArray(value) ? value : [];
  const isSearchable = searchable === true || searchable === 'true' || searchable === '1';
  // const defaultCountry: { code: string; name: string; flag?: string } = { code: "+256", name: "Uganda", flag: "🇺🇬" };
  // const [defaultCountry, setDefaultCountry] = useState<{ name: string; code: string; flag?: string }>({ code: "+256", name: "Uganda", flag: "🇺🇬" });
  const countries: { name?: string; code?: string; flag?: string }[] = [
    { name: "United States", code: "+1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
    { name: "Australia", code: "+61", flag: "🇦🇺" },
    { name: "France", code: "+33", flag: "🇫🇷" },
    { name: "Germany", code: "+49", flag: "🇩🇪" },
    { name: "India", code: "+91", flag: "🇮🇳" },
    { name: "Uganda", code: "+256", flag: "🇺🇬" },
    { name: "Canada", code: "+1", flag: "🇨🇦" },
    { name: "China", code: "+86", flag: "🇨🇳" },
    { name: "Japan", code: "+81", flag: "🇯🇵" },
    // Add more countries as needed
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  // const [selectedCountry, setSelectedCountry] = useState<{ name: string; code: string; flag?: string }>(defaultCountry);
  const [phone, setPhone] = useState(value);
  useEffect(() => { setPhone(value) }, [value])
  // const toggleDropdown = () => setIsOpen((prev) => !prev);
  const computeDropdownProps = () => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;
    const rect = dropdown.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const inputBottom = Math.floor(rect.bottom);
    const inputTop = Math.floor(rect.top);
    const l = Math.floor(rect.left);

    const margin = 10;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = Math.max(0, viewportHeight - rect.bottom - margin);
    const spaceAbove = Math.max(0, rect.top - margin);
    const MAX_DROPDOWN = Math.floor(Math.min(400, viewportHeight * 0.6));

    // prefer below if there's enough space below or below has more space than above
    let placement: "bottom" | "top" = "bottom";
    // maxHeight is only an upper bound; the actual dropdown will size to its content
    // when content is smaller than maxHeight. We initially pick a reasonable max,
    // then measure the actual rendered dropdown height (if available) and correct
    // the top for top-placement so very small lists (1-2 items) don't get pushed
    // far away because of a large maxHeight.
    let maxHeight = Math.min(MAX_DROPDOWN, Math.max(40, spaceBelow));
    if (spaceBelow < 160 && spaceAbove > spaceBelow) {
      placement = "top";
      maxHeight = Math.min(MAX_DROPDOWN, Math.max(40, spaceAbove));
    }

    // visual gap between input and dropdown when placed on top
    const gap = 8; // px

    // initial top (will be corrected after measurement if possible)
    const top = placement === "bottom" ? inputBottom : Math.max(margin, inputTop - maxHeight - gap);

    setDropdownProperties({ width: `${w}px`, top: `${top}px`, left: `${l}px`, maxHeight: `${maxHeight}px`, placement });
    setDropdownPropertiesString(`!w-[${w}px] !top-[${Math.floor(top)}px] !left-[${l}px]`);

    // Try to measure the actual dropdown content height (render happens right after open).
    // If available, compute a more accurate top for top-placement so small content sits
    // directly above the trigger with a small gap instead of being offset by the maxHeight.
    setTimeout(() => {
      try {
        const contentEl = document.querySelector('.inputfields-dropdown-content') as HTMLElement | null;
        if (contentEl) {
          const contentHeight = Math.min(contentEl.offsetHeight, maxHeight);
          const accurateTop = placement === 'bottom' ? inputBottom : Math.max(margin, inputTop - contentHeight - gap);
          setDropdownProperties({ width: `${w}px`, top: `${accurateTop}px`, left: `${l}px`, maxHeight: `${maxHeight}px`, placement });
          setDropdownPropertiesString(`!w-[${w}px] !top-[${Math.floor(accurateTop)}px] !left-[${l}px]`);
        }
      } catch (err) {
        // measurement is best-effort; ignore errors silently
      }
    }, 0);
  };
  const handleSelect: (country?: { name?: string; code?: string; flag?: string }) => void = (country) => {
    const found = country?.code ? countries.find(c => c.code === country.code) : undefined;
    if (typeof (setSelectedCountry as any) === "function") {
      (setSelectedCountry as any)(found ?? (country ? { name: country.name ?? "", code: country.code ?? "", flag: country.flag } : undefined));
    }

    // close the dropdown (use the shared dropdownOpen flag)
    setDropdownOpen(false);
    setIsOpen(false);
    safeOnChange({ target: { value: `${phone}`, name } } as React.ChangeEvent<HTMLInputElement>);
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits by removing any non-digit characters from the input value
    const cleaned = e.target.value.replace(/\D/g, "");
    setPhone(cleaned);
    safeOnChange({ target: { value: `${cleaned}`, name } } as React.ChangeEvent<HTMLInputElement>);
  };

  const filteredOptions = (options?.filter(opt => {
    const label = opt.label?.toLowerCase();
    // Remove options like 'Select Region', 'Select Item', 'Select ...'
    if (label?.startsWith('select ')) return false;
    return label?.includes(search.toLowerCase());
  })) || [];

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [search, filteredOptions.length]);

  // Debounced search callback
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Only call onSearchChange if searchable and callback is provided
    if (isSearchable && onSearchChange && search !== '') {
      searchTimeoutRef.current = setTimeout(() => {
        onSearchChange(search);
      }, 300); // 300ms debounce
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]); // Only depend on search text, not the callback function

useEffect(() => {
    const dropdown = dropdownRef.current;
    if (dropdown) {
      const { width, top, left, height } = dropdown.getBoundingClientRect();
      const w = Math.floor(width);
      const t = Math.floor(top + height);
      const l = Math.floor(left);
      const defaultMax = Math.floor(Math.min(400, (window.innerHeight || document.documentElement.clientHeight) * 0.6));
      setDropdownProperties({ width: `${w}px`, top: `${t}px`, left: `${l}px`, maxHeight: `${defaultMax}px`, placement: "bottom" });
      setDropdownPropertiesString(`!w-[${w}px] !top-[${t}px] !left-[${l}px]`);
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

  // When dropdown is open, compute and keep its fixed position in sync with the trigger
  useEffect(() => {
    if (!dropdownOpen) return;
    // initial compute
    computeDropdownProps();
    const onResize = () => computeDropdownProps();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [dropdownOpen, (options || []).length]);

  // useEffect(()=>{
  //   setDefaultCountry(selectedCountry)
  // },[selectedCountry])
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
    // Restrict number input to maxLength digits
    if (
      type === "number" &&
      maxLength &&
      event &&
      "target" in event &&
      typeof event.target.value === "string"
    ) {
      const val = event.target.value;
      // Remove non-digit characters
      const digits = val.replace(/\D/g, "");
      if (digits.length > maxLength) {
        // Only allow up to maxLength digits
        event.target.value = digits.slice(0, maxLength);
      }
    }
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


  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!integerOnly) return;
    // If user presses backspace, clear the whole input value
    if (e.key === 'Backspace') {
      const input = e.currentTarget as HTMLInputElement;
      if (input && input.value && input.value.length > 0) {
        e.preventDefault();
        try { safeOnChange({ target: { value: '', name } } as any); } catch (err) {}
        // update DOM immediately
        input.value = '';
      }
      return;
    }
    // prevent decimal point, exponent, plus/minus
    if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
      e.preventDefault();
    }
  };

  return (
    <div className={`flex flex-col gap-[6px] w-full ${width} relative`}>
        {showSkeleton && <div className="absolute h-[90px] w-full rounded-[5px] bg-white z-40 flex flex-col gap-[5px]">
          {label && <Skeleton variant="rounded" width={"50%"} height={"20%"} />}
          <Skeleton variant="rounded" width={"100%"} height={"60%"} />
          {error && <Skeleton variant="rounded" width={"100%"} height={"20%"} />}
        </div>}
        <label
          htmlFor={id ?? name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      <div className="relative">
        {type === "radio" && options && options.length > 0 ? (
          loading ? (
            <Skeleton variant="rounded" width={210} height={60} />
          ) : (
            <div className="flex-wrap flex gap-4 mt-2 pl-[5px]">
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
          )) : isMulti ? (
            loading ? (
              <Skeleton variant="rounded" width={210} height={60} />
            ) : (
              <div className="relative select-none" ref={dropdownRef}>
                <div
                  tabIndex={0}
                  onMouseDown={() => { pointerDownRef.current = true; }}
                  onMouseUp={() => { pointerDownRef.current = false; }}
                  onFocus={() => { if (!pointerDownRef.current && !disabled) { computeDropdownProps(); setDropdownOpen(true); } }}
                  className={`${showBorder === true && "border"} h-[44px] w-full rounded-md shadow-[0px_1px_2px_0px_#0A0D120D] px-3 mt-0 flex items-center cursor-pointer w-full ${error ? "border-red-500" : "border-gray-300"} ${disabled ? "bg-gray-100" : "bg-white"}`}
                  onClick={() => { if (!loading && !isSearchable) { computeDropdownProps(); setDropdownOpen(v => !v); } }}
                >
                  {isSearchable ? (
                    (() => {
                      const selected = options?.filter(opt => selectedValues.includes(opt.value)).map(o => ({ value: o.value, label: o.label })) || [];
                      const displayValue = search || (selected.length > 0 ? selected.slice(0, 2).map(s => s.label).join(', ') : '');
                      const hasSelection = !search && selected.length > 0;
                      // If multiSelectChips is enabled, render chips before the input
                      if (multiSelectChips) {
                        return (
                          <div className="flex flex-1 items-center gap-2 flex-nowrap overflow-hidden min-w-0">
                            {selected.length === 0 && (
                              <span className="text-gray-400">{`Search ${label}`}</span>
                            )}
                            {selected.map((s, idx) => {
                              if (idx >= 2) return null;
                              return (
                                <span key={s.value} className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1 text-sm text-gray-800 max-w-[140px] truncate">
                                  <span className="truncate block max-w-[100px]">{s.label}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); if (!disabled) handleCheckbox(s.value); }}
                                    className="ml-2 text-gray-500 hover:text-gray-700"
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                            {selected.length > 2 && <span className="text-sm text-gray-700 ml-1">+{selected.length - 2}</span>}
                            <input
                              type="text"
                              placeholder={selected.length === 0 ? `Search ${label}` : undefined}
                              value={displayValue}
                              onChange={e => {
                                const v = (e.target as HTMLInputElement).value;
                                console.log("Search input changed:", v);
                                setSearch(v);
                                // onSearch(v);
                                if (!dropdownOpen) setDropdownOpen(true);
                                if (v === '') {
                                  // user cleared the input -> clear selected values for multi-select
                                  safeOnChange(createMultiSelectEvent([]));
                                }
                              }}
                              onFocus={() => setDropdownOpen(true)}
                              className={`flex-1 truncate text-sm outline-none border-none min-w-0 ${hasSelection ? 'text-gray-900' : 'text-gray-400'}`}
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
                          </div>
                        );
                      }
                      return (
                        <input
                          type="text"
                          placeholder={selected.length === 0 ? `Search ${label}` : undefined}
                          value={displayValue}
                          onChange={e => {
                            const v = (e.target as HTMLInputElement).value;
                            setSearch(v);
                            onSearch(v);
                            // console.log("Search input changed:", v);
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
                    (() => {
                      const selected = options?.filter(opt => selectedValues.includes(opt.value)).map(o => ({ value: o.value, label: o.label })) || [];
                      if (multiSelectChips) {
                        return (
                          <div className="flex-1 flex items-center gap-2 flex-nowrap overflow-hidden min-w-0">
                            {selected.length === 0 && <span className="text-gray-400">{`Select ${label}`}</span>}
                            {selected.map((s, idx) => {
                              if (idx >= 2) return null;
                              return (
                                <span key={s.value} className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1 text-sm text-gray-800 max-w-[140px] truncate">
                                  <span className="truncate block max-w-[100px]">{s.label}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); if (!disabled) handleCheckbox(s.value); }}
                                    className="ml-2 text-gray-500 hover:text-gray-700"
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                            {selected.length > 2 && <span className="text-sm text-gray-700 ml-1">+{selected.length - 2}</span>}
                          </div>
                        );
                      }
                      return (
                        <span className={`truncate flex-1 ${selected.length === 0 ? "text-gray-400" : "text-gray-900"}`}>
                          {(() => {
                            if (selected.length === 0) return `Select ${label}`;
                            if (selected.length <= 2) return selected.map(s => s.label).join(', ');
                            return selected.slice(0, 2).map(s => s.label).join(', ');
                          })()}
                        </span>
                      );
                    })()
                  )}
                  {/* Show down arrow only if not disabled and not searchable */}
                  {!isSearchable && !disabled && (
                    <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  )}
                </div>
                {dropdownOpen && !loading && dropdownProperties.width !== "0" && (
                  <>
                    <div style={{ left: dropdownProperties.left, top: dropdownProperties.top, width: dropdownProperties.width, maxHeight: dropdownProperties.maxHeight }} className="inputfields-dropdown-content fixed z-50 mt-1 bg-white rounded-md shadow-lg overflow-auto" >
                      {!isSearchable && (
                        <div className="px-3 py-2 flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                          <input
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={e => { setSearch(e.target.value); onSearch(e.target.value); /*console.log("Search input changed:", e.target.value);*/ }}
                            className="w-full border-none outline-none text-sm"
                            disabled={disabled}
                          />
                        </div>
                      )}
                      <div
                        className="flex items-center px-3 py-2 cursor-pointer"
                        onClick={() => { if (!disabled) handleSelectAll(); }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedValues.length === filteredOptions.length && filteredOptions.length > 0}
                          onChange={e => {
                            e.stopPropagation();
                            if (!disabled) handleSelectAll();
                          }}
                          className="mr-2 cursor-pointer"
                          style={selectedValues.length === filteredOptions.length && filteredOptions.length > 0 ? { accentColor: '#EA0A2A' } : {}}
                          disabled={disabled}
                        />
                        <span className="text-sm select-none">Select All</span>
                      </div>
                      <div>
                        {filteredOptions.length === 0 ? (
                          <div className="px-3 py-2 text-gray-400 text-sm">No options</div>
                        ) : filteredOptions.map((opt, idx) => (
                          <div
                            key={opt.value + idx}
                            className={`flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={e => {
                              e.preventDefault();
                              if (!disabled) handleCheckbox(opt.value);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedValues.includes(opt.value)}
                              onChange={e => {
                                e.stopPropagation();
                                if (!disabled) handleCheckbox(opt.value);
                              }}
                              className="mr-2 cursor-pointer"
                              style={selectedValues.includes(opt.value) ? { accentColor: '#EA0A2A' } : {}}
                              disabled={disabled}
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
            )
          ) : isSingleSelect ? (
            loading ? (
              <Skeleton variant="rounded" width={210} height={60} />
            ) : (
              <div className={`relative select-none`} ref={dropdownRef}>
                <div
                  tabIndex={0}
                  onMouseDown={() => { pointerDownRef.current = true; }}
                  onMouseUp={() => { pointerDownRef.current = false; }}
                  onFocus={() => { if (!pointerDownRef.current && !disabled) { computeDropdownProps(); setDropdownOpen(true); } }}
                  className={`${showBorder === true && "border"} h-[44px] w-full rounded-md shadow-[0px_1px_2px_0px_#0A0D120D] px-3 mt-0 flex items-center cursor-pointer min-w-0 ${error ? "border-red-500" : "border-gray-300"} ${disabled ? "bg-gray-200" : "bg-white"}`}
                  onClick={() => { if (!loading && !isSearchable && !disabled) { computeDropdownProps(); setDropdownOpen(v => !v); } }}
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
                            if (disabled) return;
                            const v = (e.target as HTMLInputElement).value;
                            setSearch(v);
                            onSearch(v);
                            console.log("Search input changed:", v);
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
                                onSearch("");
                              }
                            }
                          }}
                        />
                      );
                    })()
                  ) : (
                    <span className={`truncate flex-1 ${!value ? "text-gray-400" : "text-gray-900"}`}>
                      {(!value ? `Select ${label}` : options?.find(opt => opt.value === value)?.label)
                      }
                    </span>
                  )}
                  {/* Show down arrow only if not disabled and not searchable */}
                  {!isSearchable && !disabled && (
                    <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  )}
                </div>
                {dropdownOpen && !loading && dropdownProperties.width !== "0" && (
                  <div style={{ left: dropdownProperties.left, top: dropdownProperties.top, width: dropdownProperties.width, maxHeight: dropdownProperties.maxHeight }} className="inputfields-dropdown-content fixed z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl overflow-auto">
                    {!isSearchable && (
                      <div className="px-3 py-2 border-b flex items-center" style={{ borderBottomColor: '#9ca3af' }}>
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        <input
                          type="text"
                          placeholder="Search"
                          value={search}
                          onChange={e => { setSearch(e.target.value); onSearch(e.target.value); }}
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
            )
          ) : type === "file" ? (
            <input
              id={id ?? name}
              name={name}
              type="file"
              onChange={safeOnChange}
              onBlur={onBlur}
              autoComplete="off"
              className={`border h-[44px] w-full rounded-md shadow-[0px_1px_2px_0px_#0A0D120D] px-3 py-1 mt-0 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${error ? "border-red-500" : "border-gray-300"
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
                className={`box-border border h-[44px] w-full rounded-md shadow-[0px_1px_2px_0px_#0A0D120D] ${leadingElement ? "pl-10" : "pl-3"} ${trailingElement ? "pr-10" : "pr-3"} mt-0 text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-300"}`}
                placeholder={placeholder || `Enter ${label}`}
              />
              {(leadingElement || trailingElement) && (
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 pointer-events-none">
                  {leadingElement ? (
                    <div className="flex items-center pointer-events-auto h-full mt-0 p-2">
                      {leadingElement}
                    </div>
                  ) : <div />}
                  {trailingElement ? (
                    <div className="flex items-center pointer-events-auto h-full mt-0 p-2">
                      {trailingElement}
                    </div>
                  ) : <div />}
                </div>
              )}
            </div>
          ) : type === "contact" ? (
            <div className="relative mt-0 w-full">
              {/* Custom Phone Input with Country Dropdown */}
              {(() => {
                // include flag on defaultCountry so selectedCountry.flag is always available


                return (
                  <div className={`mx-auto border-[1px] ${error ? "border-red-500" : "border-gray-300"} rounded-lg`} ref={dropdownRef}>
                    <div className="flex items-center relative">
                      {/* Dropdown Button */}
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100"
                      >
                        {selectedCountry?.flag}{" "}
                        {selectedCountry?.code}
                      </button>
                      {/* Dropdown List */}
                      {dropdownOpen && (
                        <div style={{ left: dropdownProperties.left, top: dropdownProperties.top, width: dropdownProperties.width, maxHeight: dropdownProperties.maxHeight }} className="inputfields-dropdown-content fixed overflow-y-scroll z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-75">
                          <ul className="py-2 text-sm text-gray-700">
                            {countries.map((country: { name?: string; code?: string; flag?: string } | undefined, index) => (
                              <li key={index}>
                                <button
                                  type="button"
                                  onClick={() => handleSelect(country)}
                                  className="inline-flex w-full px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  <span className="inline-flex items-center">
                                    {country?.flag} {" "} {country?.name} ({country?.code})
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Input Field */}
                      <label
                        htmlFor="phone-input"
                        className="mb-2 text-sm font-medium text-gray-900 sr-only"
                      >
                        Phone number:
                      </label>
                      <div className="relative w-full">
                        <input
                          type="tel"
                          id="phone-input"
                          placeholder={placeholder || "Enter phone number"}
                          className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg outline-none border border-gray-300 shadow-[0px_1px_2px_0px_#0A0D120D]"
                          value={phone}
                          onChange={handlePhoneChange}
                          disabled={disabled}
                          required={required}
                          onBlur={onBlur}
                          minLength={9}
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : type === "dateChange" ? (
            <DateRangePicker
              value={typeof value === 'string' ? value : String(value ?? '')}
              name={name}
              id={id}
              disabled={disabled}
              error={error}
              placeholder={placeholder}
              showBorder={showBorder}
              onChange={(e) => {
                // DateRangePicker emits { target: { value, name } }
                safeOnChange(e as any);
              }}
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
              min={min as any}
              max={max as any}
              className={`border h-[44px] w-full rounded-md shadow-[0px_1px_2px_0px_#0A0D120D] px-3 mt-0 text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-300"}`}
              placeholder={`Enter ${label}`}
            />
          ) : type === "number" ? (
            loading ? (
              <Skeleton variant="rounded" width={210} height={60} />
            ) : (
              <input
                id={id ?? name}
                name={name}
                type="number"
                value={value ?? ""}
                onChange={safeOnChange}
                onKeyDown={handleNumberKeyDown}
                inputMode={integerOnly ? "numeric" : undefined}
                step={integerOnly ? 1 : undefined}
                disabled={disabled}
                onBlur={onBlur}
                className={`border h-[44px] w-full rounded-md shadow-[0px_1px_2px_0px_#0A0D120D] px-3 mt-0 text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-300"}`}
                placeholder={`Enter ${label}`}
                maxLength={maxLength}
                min={min}
                max={max}
              />
            )
          ) : type === "textarea" ? (
            <textarea
              id={id ?? name}
              name={name}
              value={value ?? ""}
              onChange={safeOnChange}
              disabled={disabled}
              className={`border w-full rounded-md shadow-[0px_1px_2px_0px_#0A0D120D] px-[14px] py-[10px] mt-0 text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-300"}`}
              placeholder={placeholder || `Enter ${label}`}
              cols={textareaCols}
              rows={textareaRows}
              style={textareaResize === false ? { resize: 'none' } : {}}
            />
          ) : null}
        {/* show validation message for non-radio types (radio shows its own message) */}
        {type !== 'radio' && error && (
          <div className="mt-1">
            <span className="text-xs text-red-500">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}