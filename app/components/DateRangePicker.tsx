"use client";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  value?: string | null;
  name?: string;
  id?: string;
  disabled?: boolean;
  error?: string | false;
  placeholder?: string;
  onChange: (e: { target: { value: string; name?: string } }) => void;
  showBorder?: boolean;
};

export default function DateRangePicker({ value, name, id, disabled, error, placeholder, onChange, showBorder = true }: Props) {
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const [popStyle, setPopStyle] = useState<{ left: number; top: number; minWidth: number } | null>(null);

  useEffect(() => {
    const v = typeof value === 'string' ? value : String(value ?? '');
    if (v.includes('|')) {
      const [s, e] = v.split('|', 2);
      setFrom(s ?? '');
      setTo(e ?? '');
    } else {
      setFrom(v ?? '');
      setTo('');
    }
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      if (anchorRef.current && anchorRef.current.contains(e.target as Node)) return;
      if (popRef.current && popRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // compute and set popup position in fixed coordinates to avoid clipping
  const computePosition = () => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minW = Math.max(260, Math.floor(rect.width));

    // default place below the anchor
    let left = Math.max(8, Math.floor(rect.left));
    let top = Math.floor(rect.bottom + 8);

    // if the popup would overflow right, shift left
    if (left + minW + 8 > viewportWidth) {
      left = Math.max(8, viewportWidth - minW - 8);
    }

    // if popup would overflow bottom, place above the anchor
    const estimatedHeight = popRef.current ? Math.ceil(popRef.current.getBoundingClientRect().height) : 220;
    if (top + estimatedHeight + 8 > viewportHeight) {
      // place above
      top = Math.max(8, Math.floor(rect.top - estimatedHeight - 8));
    }

    setPopStyle({ left, top, minWidth: minW });
  };

  useEffect(() => {
    if (!open) return;
    // compute initially
    computePosition();
    // recompute on scroll/resize to keep it anchored
    const onScroll = () => computePosition();
    const onResize = () => computePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const emit = (s: string, t: string) => {
    const val = `${s}|${t}`;
    onChange({ target: { value: val, name } });
  };

  const formatDisplay = (d: string) => {
    if (!d) return '';
    const p = d.split('-');
    if (p.length !== 3) return d;
    return `${p[2]}-${p[1]}-${p[0]}`;
  };

  const displayText = () => {
    const f = formatDisplay(from);
    const t = formatDisplay(to);
    if (!f && !t) return (placeholder || 'dd-mm-yyyy to dd-mm-yyyy');
    return `${f || 'dd-mm-yyyy'} to ${t || 'dd-mm-yyyy'}`;
  };

  return (
    <div className="relative w-full" ref={anchorRef}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(v => !v)}
        className={`${showBorder ? 'border' : ''} h-[44px] w-full rounded-md shadow-[0px_1px_2px_0px_#0A0D120D] px-3 mt-0 flex items-center justify-between cursor-pointer min-w-0 ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'bg-gray-200' : 'bg-white'}`}
      >
        <span className="text-gray-600 truncate">{displayText()}</span>
        <svg className="w-5 h-5 text-gray-500 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg>
      </button>

      {open && (
        <div
          ref={popRef}
          className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg p-3"
          style={popStyle ? { left: popStyle.left, top: popStyle.top, minWidth: popStyle.minWidth } : { minWidth: 260 }}
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-600">From</label>
            <input
              type="date"
              value={from}
              onChange={e => { setFrom(e.target.value); emit(e.target.value, to); }}
              className={`border h-[40px] rounded-md px-3 ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            <label className="text-xs text-gray-600">To</label>
            <input
              type="date"
              value={to}
              onChange={e => { setTo(e.target.value); emit(from, e.target.value); }}
              className={`border h-[40px] rounded-md px-3 ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button type="button" onClick={() => { setFrom(''); setTo(''); emit('', ''); setOpen(false); }} className="px-3 py-1 text-sm text-gray-600">Clear</button>
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-1 bg-red-600 text-white text-sm rounded">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
