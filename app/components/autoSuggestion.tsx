"use client";
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
  debounceMs = 300,
  className = "w-full",
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dropdownProps, setDropdownProps] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 0 });
  const debounceRef = useRef<number | null>(null);
  const onSearchRef = useRef(onSearch);
  const onClearRef = useRef(onClear);

  // keep a stable reference to onSearch to avoid re-triggering effects when parent recreates the function each render
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);
  useEffect(() => {
    onClearRef.current = onClear;
  }, [onClear]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if ((query ?? "").length < minSearchLength) {
      setOptions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      (async () => {
        try {
          // use the stable ref to call the latest onSearch without making it a dependency
          const res = await onSearchRef.current(query);
          setOptions(Array.isArray(res) ? res : []);
          setOpen(true);
          setHighlight(-1);
        } catch (err) {
          setOptions([]);
          setOpen(true);
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
    if (!open) {
      if (e.key === "ArrowDown") {
        setOpen(true);
      }
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
      setQuery(opt.label);
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
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
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
