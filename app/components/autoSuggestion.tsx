"use client";
import Skeleton from "@mui/material/Skeleton";
import React, { useEffect, useRef, useState } from "react";

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
  /** Pre-selected single option (optional). When provided the input shows its label and backspace clears it. */
  selectedOption?: Option | null;
  /** When true, allow selecting multiple options (multi-select). */
  multiple?: boolean;
  /** Initial selected options for multi-select */
  initialSelected?: Option[];
  /** Callback when multi-select selection changes */
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
  const onClearRef = useRef(onClear);
  const prevQueryRef = useRef<string>(initialValue || "");
  // when we programmatically set the query (for example after selecting an option),
  // we want to avoid retriggering the search effect and reopening the dropdown.
  const skipSearchRef = useRef(false);
  // NOTE: removed programmaticSetRef — Backspace will behave normally even after programmatic set

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
        try {
          // when the debounced search starts, show loading and open dropdown
          setLoading(true);
          setOpen(true);
          // use the stable ref to call the latest onSearch without making it a dependency
          const res = await onSearchRef.current(query);
          setOptions(Array.isArray(res) ? res : []);
          setHighlight(-1);
        } catch (err) {
          setOptions([]);
          setHighlight(-1);
          // swallow error (caller can surface)
        } finally {
          setLoading(false);
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
    const input = inputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
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
            try { onChangeSelected && onChangeSelected(next); } catch (err) {}
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
      // add to selection if not present
      setSelectedOptions(prev => {
        const exists = prev.some(p => p.value === opt.value);
        if (exists) return prev;
        const next = [...prev, opt];
        try { onChangeSelected && onChangeSelected(next); } catch (e) {}
        return next;
      });
      // keep input for further typing
      setQuery("");
      setOptions([]);
      setHighlight(-1);
      // notify parent about single-select action as well for compatibility
      try { onSelect(opt); } catch (err) {}
    } else {
      // avoid re-triggering the search effect when we programmatically set
      // the query after a selection — the effect would reopen the dropdown
      // because the label length usually meets minSearchLength
      skipSearchRef.current = true;
      setQuery(opt.label);
      // remember this option as the one that produced the input value
      selectedSingleRef.current = opt;
      setOpen(false);
      setOptions([]);
      setHighlight(-1);
      try {
        onSelect(opt);
      } catch (err) {
        // ignore
      }
    }
  };

  const removeSelected = (val: string) => {
    setSelectedOptions(prev => {
      const next = prev.filter(p => p.value !== val);
      try { onChangeSelected && onChangeSelected(next); } catch (e) {}
      return next;
    });
  };

  const borderClass = error ? "border-red-500" : "border-gray-300";

  return (
    <div className={`flex flex-col gap-[6px] w-full ${width} min-w-0 relative`} ref={containerRef}>
      {label && (
        <label htmlFor={id ?? name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {multiple ? (
        <div className={`box-border border h-[44px] w-full rounded-md shadow-[0px_1px_2px_0px_#0A0D120D] px-3 mt-0 text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 flex items-center gap-2 min-w-0 ${error ? "border-red-500" : "border-gray-300"}`} onClick={() => { if (!disabled) inputRef.current?.focus(); }}>
          <div className="flex items-center gap-2 flex-1 flex-nowrap overflow-hidden min-w-0">
            {selectedOptions.length === 0 && query === '' && (
              <span className="text-gray-400 truncate">{placeholder}</span>
            )}
            {selectedOptions.map(s => (
              <span key={s.value} className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1 text-sm text-gray-800 max-w-[140px] truncate">
                <span className="truncate block max-w-[100px]">{s.label}</span>
                {!disabled && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeSelected(s.value); }} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
                )}
              </span>
            ))}
            <input
              id={id ?? name}
              name={name}
              ref={inputRef}
              type="text"
              disabled={disabled}
              className="flex-1 truncate text-sm outline-none border-none min-w-0 bg-transparent"
              placeholder={selectedOptions.length === 0 ? placeholder : undefined}
              value={query}
              onChange={e => { const v = e.target.value; setQuery(v); if (v === '') { setOptions([]); setOpen(false); try { onClearRef.current && onClearRef.current(); } catch (err) {} } }}
              onFocus={() => { if (options.length > 0) setOpen(true); }}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      ) : (
        <input
          id={id ?? name}
          name={name}
          type="text"
          disabled={disabled}
          ref={inputRef}
          className={`box-border border h-[44px] w-full rounded-md shadow-[0px_1px_2px_0px_#0A0D120D] px-3 mt-0 text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-300"} ${!label ? "mt-[6px]" : ""}`}
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
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
        />
      )}

      {open && (
        <div
          style={{ position: 'fixed', left: dropdownProps.left, top: dropdownProps.top, width: dropdownProps.width }}
          className={`z-50 bg-white mt-[6px] rounded-md shadow-lg max-h-60 overflow-auto scrollbar-none`}
        >
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              <Skeleton ></Skeleton>
              <Skeleton ></Skeleton>
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">{noOptionsMessage}</div>
          ) : (
            options.map((opt, idx) => (
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
            ))
          )}
        </div>
      )}

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}
