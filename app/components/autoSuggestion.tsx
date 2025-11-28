"use client";
import Skeleton from "@mui/material/Skeleton";
import React, { useEffect, useRef, useState } from "react";
import CustomCheckbox from "@/app/components/customCheckbox";

export type Option = {
  value: string;
  label: string;
  [key: string]: any;
};

type Props = {
  placeholder?: string;
  onSearch: (query: string) => Promise<Option[]>;
  onSelect: (option: Option) => void;
  minSearchLength?: number;
  debounceMs?: number;
  className?: string;
  initialValue?: string;
  renderOption?: (opt: Option) => React.ReactNode;
  noOptionsMessage?: string;
  label?: string;
  required?: boolean;
  error?: string | false;
  id?: string;
  name?: string;
  width?: string;
  disabled?: boolean;
  onClear?: () => void;
  selectedOption?: Option | null;
  multiple?: boolean;
  initialSelected?: Option[];
  onChangeSelected?: (selected: Option[]) => void;
};

export default function AutoSuggestion({
  placeholder = "Search...",
  onSearch,
  onSelect,
  minSearchLength = 1,
  debounceMs = 500,
  initialValue = "",
  renderOption,
  noOptionsMessage = "No options",
  label,
  required = false,
  error,
  id,
  name,
  width = "max-w-[406px]",
  disabled = false,
  onClear,
  selectedOption,
  multiple = false,
  initialSelected = [],
  onChangeSelected,
}: Props) {
  const [query, setQuery] = useState(initialValue);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(initialSelected || []);
  // for single-select mode, keep a ref to the option that produced the current input value
  const selectedSingleRef = useRef<Option | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dropdownProps, setDropdownProps] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 0 });
  const debounceRef = useRef<number | null>(null);
  const onSearchRef = useRef(onSearch);
  const requestIdRef = useRef(0);
  const onClearRef = useRef(onClear);
  const prevQueryRef = useRef<string>(initialValue || "");
  // when we programmatically set the query (for example after selecting an option),
  // we want to avoid retriggering the search effect and reopening the dropdown.
  const skipSearchRef = useRef(false);
  const [showSelectedOnly, setShowSelectedOnly] = useState<boolean>(multiple ? true : false);
  const [showSearchInput, setShowSearchInput] = useState<boolean>(multiple ? true : false);

  // keep a stable reference to onSearch to avoid re-triggering effects when parent recreates the function each render
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);
  useEffect(() => {
    onClearRef.current = onClear;
  }, [onClear]);

  // When parent changes the `initialValue` prop (for example to clear the field),
  // update internal query state accordingly. Use skipSearchRef to avoid
  // re-triggering the search effect and reopening the dropdown when this is
  // a programmatic update coming from outside.
  useEffect(() => {
    if (initialValue === undefined) return;
    if (initialValue === query) return;
    // mark to skip the search effect which would otherwise run for this new query
    skipSearchRef.current = true;
    setQuery(initialValue);
    // if clearing from outside, also clear selectedSingleRef and notify onClear
    if (initialValue === "") {
      // Clear remembered selection when parent explicitly clears the value.
      // Do NOT call onClear here — parent already knows it cleared the value and
      // may perform side-effects (like clearing related data). Avoid double-calling
      // onClear to prevent unintended cascading clears.
      selectedSingleRef.current = null;
    }
  // intentionally depend on initialValue only
  }, [initialValue]);

  // When parent provides a pre-selected single option via `selectedOption`, reflect it locally.
  // Show its label and remember the option so Backspace will clear it. Clearing selectedOption
  // (setting it to null) will clear the input and remembered selection.
  useEffect(() => {
    if (multiple) return; // only relevant for single-select
    // parent didn't provide selectedOption -> nothing to do
    if (selectedOption === undefined) return;
    // avoid triggering the search effect
    skipSearchRef.current = true;
    if (selectedOption === null) {
      selectedSingleRef.current = null;
      setQuery("");
      setOptions([]);
      setOpen(false);
      return;
    }
    // set the visible label and remember the producing option
    selectedSingleRef.current = selectedOption;
    setQuery(selectedOption.label);
    setOptions([]);
    setOpen(false);
  }, [selectedOption, multiple]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const prevQuery = prevQueryRef.current ?? "";
    const isDeletion = (query ?? "").length < prevQuery.length;
    prevQueryRef.current = query ?? "";

    if ((query ?? "").length < minSearchLength) {
      setOptions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    // if a selection just updated the query programmatically, skip running
    // the search and avoid reopening the dropdown immediately
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      setOptions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    // For deletions (backspace), avoid immediate UI churn — don't open the
    // dropdown or show loading until the debounced search actually runs.
    if (!isDeletion) {
      // show loading state and ensure dropdown is open immediately so
      // the user sees the "Loading..." indicator even for the first letter
      setLoading(true);
      setOpen(true);
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      (async () => {
        // assign a request id for this search — only responses matching the latest
        // request id will be applied. This avoids out-of-order (race) updates.
        requestIdRef.current += 1;
        const thisRequestId = requestIdRef.current;
        try {
          // when the debounced search starts, show loading and open dropdown
          setLoading(true);
          setOpen(true);
          // use the stable ref to call the latest onSearch without making it a dependency
          const res = await onSearchRef.current(query);
          // if a newer request started while we were awaiting, ignore this response
          if (thisRequestId !== requestIdRef.current) return;
          setOptions(Array.isArray(res) ? res : []);
          setHighlight(-1);
        } catch (err) {
          // if this is stale, let newer request handle UI; otherwise clear options
          if (thisRequestId === requestIdRef.current) {
            setOptions([]);
            setHighlight(-1);
          }
          // swallow error (caller can surface)
        } finally {
          if (thisRequestId === requestIdRef.current) {
            setLoading(false);
          }
        }
      })();
    }, debounceMs);
  }, [query, debounceMs, minSearchLength]);

  // click outside to close
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && e.target instanceof Node && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // compute dropdown position based on input bounding rect and update on events
  const computeDropdownProps = () => {
    // Prefer the full container width so the dropdown matches the visible input area
    const el = containerRef.current ?? inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdownProps({ left: Math.floor(rect.left), top: Math.floor(rect.bottom), width: Math.floor(rect.width) });
  };

  useEffect(() => {
    if (!open) return;
    // initial compute
    computeDropdownProps();
    const onResize = () => computeDropdownProps();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, options.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace handling should work even when the dropdown is closed.
    if (e.key === "Backspace") {
      const input = inputRef.current;
      // multi-select: if input empty and we have selected tags, remove the last tag
      if (multiple) {
        if ((input?.value ?? "") === "" && selectedOptions.length > 0) {
          e.preventDefault();
          setSelectedOptions(prev => {
            const next = prev.slice(0, -1);
            if (onChangeSelected) { setTimeout(() => { try { onChangeSelected(next); } catch (err) {} }, 0); }
            return next;
          });
          return;
        }
        // allow default editing behavior otherwise
      } else {
        // single-select: if the input is currently showing the selected option's label,
        // clear it on a single Backspace press (this makes clearing predictable).
        if (selectedSingleRef.current && query === selectedSingleRef.current.label) {
          e.preventDefault();
          selectedSingleRef.current = null;
          setQuery("");
          setOptions([]);
          setOpen(false);
          try { onClearRef.current && onClearRef.current(); } catch (err) {}
          return;
        }
      }
    }

    // If dropdown is closed, only allow ArrowDown to open it; other keys handled above
    if (!open) {
      if (e.key === "ArrowDown") {
        setOpen(true);
      }
      // still allow other keys to do default behavior when closed
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && highlight < options.length) {
        const opt = options[highlight];
        selectOption(opt);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectOption = (opt: Option) => {
    if (multiple) {
      // add to selection if not present (defensive dedupe inside functional update)
      setSelectedOptions(prev => {
       if (prev.some(p => p.value === opt.value)) return prev;
       const next = [...prev, opt];
       if (onChangeSelected) {
        // schedule parent update after render to avoid setState during render warning
        setTimeout(() => { try { onChangeSelected(next); } catch (e) {} }, 0);
       }
       return next;
      });
      // setQuery("");
      // setOptions([]);
      setHighlight(-1);
      try { onSelect(opt); } catch (err) {console.log(err)}
    } else {
      skipSearchRef.current = true;
      setQuery(opt.label);
      selectedSingleRef.current = opt;
      setOpen(false);
      setOptions([]);
      setHighlight(-1);
      try {
        onSelect(opt);
      } catch (err) {
        console.log(err)
      }
    }
  };

  const toggleOption = (opt: Option) => {
    // perform add/remove inside functional update and defensively dedupe on add
    setSelectedOptions(prev => {
      const exists = prev.some(s => s.value === opt.value);
      if (exists) {
        const next = prev.filter(p => p.value !== opt.value);
        if (onChangeSelected) { setTimeout(() => { try { onChangeSelected(next); } catch (e) {} }, 0); }
        return next;
      }
      const next = prev.some(p => p.value === opt.value) ? prev : [...prev, opt];
      if (onChangeSelected) { setTimeout(() => { try { onChangeSelected(next); } catch (e) {} }, 0); }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOptions.length === options.length) {
      // clear all
      setSelectedOptions([]);
    if (onChangeSelected) { setTimeout(() => { try { onChangeSelected([]); } catch (e) {} }, 0); }
    } else {
      // select all
      const all = options.slice();
      setSelectedOptions(all);
    if (onChangeSelected) { setTimeout(() => { try { onChangeSelected(all); } catch (e) {} }, 0); }
    }
  };

  const removeSelected = (val: string) => {
    setSelectedOptions(prev => {
      const next = prev.filter(p => p.value !== val);
  if (onChangeSelected) { setTimeout(() => { try { onChangeSelected(next); } catch (e) {} }, 0); }
      return next;
    });
  };

  return (
    <div className={`flex flex-col gap-[6px] w-full ${width} min-w-0 relative`} ref={containerRef}>
      {label && (
        <label htmlFor={id ?? name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {multiple ? (
        <div
          className={`box-border border h-[44px] w-full rounded-md shadow-[0px_1px_2px_0px_#0A0D120D] px-3 mt-0 text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-200 flex items-center gap-2 ${error ? "border-red-500" : "border-gray-300"}`}
        >
          {/* Layout 1: chips + search icon */}
          {!showSearchInput && (
            <></>
            // <div className="flex items-center gap-2 flex-1 flex-nowrap overflow-hidden min-w-0">
            //   {selectedOptions.length === 1 && (
            //     <span key={selectedOptions[0].value} className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1 text-sm text-gray-800 max-w-[200px] truncate cursor-pointer" onClick={() => { setOpen(true); setShowSelectedOnly(true); }}>
            //       <span className="truncate block max-w-[100px]">{selectedOptions[0].label}</span>
            //       {!disabled && (
            //         <button type="button" onClick={(e) => { e.stopPropagation(); removeSelected(selectedOptions[0].value); }} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
            //       )}
            //     </span>
            //   )}

            //   {selectedOptions.length === 2 && (
            //     <>
            //       {selectedOptions.slice(0,2).map((s, i) => (
            //         <span key={`${s.value}-${i}`} className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1 text-sm text-gray-800 max-w-[200px] truncate mr-2 cursor-pointer" onClick={() => { setOpen(true); setShowSelectedOnly(true); }}>
            //           <span className="truncate block max-w-[80px]">{s.label}</span>
            //           {!disabled && (
            //             <button type="button" onClick={(e) => { e.stopPropagation(); removeSelected(s.value); }} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
            //           )}
            //         </span>
            //       ))}
            //     </>
            //   )}

            //   {selectedOptions.length > 2 && (
            //     <>
            //       {selectedOptions.slice(0,2).map((s, i) => (
            //         <span key={`${s.value}-${i}`} className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1 text-sm text-gray-800 max-w-[200px] truncate mr-2 cursor-pointer" onClick={() => { setOpen(true); setShowSelectedOnly(true); }}>
            //           <span className="truncate block max-w-[80px]">{s.label}</span>
            //           {!disabled && (
            //             <button type="button" onClick={(e) => { e.stopPropagation(); removeSelected(s.value); }} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
            //           )}
            //         </span>
            //       ))}
            //       <span className="inline-flex items-center bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 text-sm font-medium cursor-pointer" onClick={() => { setOpen(true); setShowSelectedOnly(true); }}>+{selectedOptions.length - 2}</span>
            //     </>
            //   )}

            //   {/* Search icon at end */}
            //   <button type="button" className="ml-2 text-gray-400 hover:text-gray-600 flex items-center" onClick={() => { setShowSearchInput(true); setTimeout(() => { inputRef.current?.focus(); }, 0); }}>
            //     <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            //   </button>
            // </div>
          )}

          {/* Layout 2: input field + cross icon */}
          {showSearchInput && (
            <div className="flex items-center w-full">
              <input
                id={id ?? name}
                name={name}
                ref={inputRef}
                type="text"
                autoComplete="off"
                disabled={disabled}
                className="truncate outline-none border-none bg-transparent placeholder-gray-400 w-full"
                placeholder={placeholder}
                value={query}
                onChange={e => { const v = e.target.value; setQuery(v); if (v === '') { setOptions([]); setOpen(false); try { onClearRef.current && onClearRef.current(); } catch (err) {} } }}
                onFocus={() => { setShowSelectedOnly(false); if (options.length > 0) setOpen(true); }}
                onKeyDown={handleKeyDown}
              />
              <div className="flex gap-1">
                { selectedOptions.length > 0 && <span className="inline-flex items-center bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 text-sm font-medium cursor-pointer" onClick={() => { setOpen(true); setShowSelectedOnly(true); }}>+{selectedOptions.length}</span>}
                {/* <button type="button" className="ml-2 text-gray-400 hover:text-gray-600 flex items-center" onClick={() => { setShowSearchInput(false); setQuery(""); setOptions([]); setOpen(false); }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></svg>
                </button> */}
              </div>
            </div>
          )}
        </div>
      ) : (
        <input
          id={id ?? name}
          name={name}
          type="text"
          autoComplete="off"
          disabled={disabled}
          ref={inputRef}
          className={`box-border border h-[44px] w-full rounded-md shadow-[0px_1px_2px_0px_#0A0D120D] px-3 mt-0 text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-200 ${error ? "border-red-500" : "border-gray-300"} ${!label ? "mt-[6px]" : ""}`}
          placeholder={placeholder}
          value={query}
          onChange={e => {
            const v = e.target.value;
            setQuery(v);
            if (v === '') {
              setOptions([]);
              setOpen(false);
              try { onClearRef.current && onClearRef.current(); } catch (err) { }
            }
          }}
          onFocus={() => { if (options.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
        />
      )}

      {open && (
        <div
          style={{ position: 'fixed', left: dropdownProps.left, top: dropdownProps.top, width: dropdownProps.width }}
          className={`z-50 bg-white border border-gray-300 mt-[6px] rounded-md shadow-lg max-h-60 overflow-auto scrollbar-none`}
        >
          {showSelectedOnly ? (
            selectedOptions.length === 0 ? (
              <div className="px-3 py-5 text-gray-600 text-center">No selected options</div>
            ) : (
              <>
                {selectedOptions.map((opt, idx) => {
                  return (
                  <div
                    key={`${opt.value}-selected-${idx}`}
                    className="px-1 py-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <CustomCheckbox
                      id={`autosuggest_selected_${opt.value}_${idx}`}
                      label={""}
                      checked={true}
                      onChange={(e) => {
                        e.stopPropagation(); removeSelected(opt.value);
                      }}
                    />
                    <div className="text-sm text-gray-800 mr-2 cursor-pointer" onClick={() => removeSelected(opt.value)}>
                      {renderOption ? renderOption(opt) : opt.label}
                    </div>
                  </div>
                )})}
              </>
            )
          ) : loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              <Skeleton ></Skeleton>
              <Skeleton ></Skeleton>
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-5 text-gray-600 text-center">{noOptionsMessage}</div>
          ) : (
            <>
              {multiple && (
                <div
                  key="__select_all__"
                  role="option"
                  onMouseDown={e => { e.preventDefault(); }}
                  onClick={() => toggleSelectAll()}
                  className={`px-1 py-2 cursor-pointer flex items-center gap-2 ${-1 === highlight ? "" : "hover:bg-gray-50"}`}
                >
                  <CustomCheckbox
                    id={`autosuggest_select_all`}
                    label={""}
                    checked={options.length > 0 && selectedOptions.length === options.length}
                    onChange={(e) => { e.stopPropagation(); toggleSelectAll(); }}
                  />
                  <div className="text-sm text-gray-800 ">Select All</div>
                </div>
              )}
              {options.map((opt, idx) => {
              const isChecked = selectedOptions.some(s => s.value === opt.value);
              if (multiple) {
                return (
                  <div
                    key={`${opt.value}-${idx}`}
                    role="option"
                    aria-selected={isChecked}
                    onMouseDown={e => { e.preventDefault(); /* prevent blur before click */ }}
                    onClick={() => {toggleOption(opt); selectOption(opt);}}
                    onMouseEnter={() => setHighlight(idx)}
                    className={`px-1 py-2 cursor-pointer flex items-center gap-2 ${highlight === idx ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    <CustomCheckbox
                      id={`autosuggest_${opt.value}_${idx}`}
                      label={""}
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        // do add/remove inside functional update and prevent duplicates on add
                        setSelectedOptions(prev => {
                          const exists = prev.some(p => p.value === opt.value);
                          if (exists) {
                            const next = prev.filter(p => p.value !== opt.value);
                            if (onChangeSelected) { setTimeout(() => { try { onChangeSelected(next); } catch (err) {} }, 0); }
                            return next;
                          }
                          const next = prev.some(p => p.value === opt.value) ? prev : [...prev, opt];
                          if (onChangeSelected) { setTimeout(() => { try { onChangeSelected(next); } catch (err) {} }, 0); }
                          return next;
                        });
                      }}
                    />
                    <div
                      className="text-sm text-gray-800 mr-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(opt);
                      }}
                    >
                      {renderOption ? renderOption(opt) : opt.label}
                    </div>

                  </div>
                );
              }

              return (
                <div
                  key={`${opt.value}-${idx}`}
                  role="option"
                  aria-selected={highlight === idx}
                  onMouseDown={e => { e.preventDefault(); /* prevent blur before click */ selectOption(opt); }}
                  onMouseEnter={() => setHighlight(idx)}
                  className={`px-3 py-2 cursor-pointer ${highlight === idx ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  {renderOption ? renderOption(opt) : <div className="text-sm text-gray-800">{opt.label}</div>}
                </div>
              );
            })}
            </>
          )}
        </div>
      )}

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}
