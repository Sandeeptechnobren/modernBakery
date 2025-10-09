import React, { useLayoutEffect, useRef, useState } from "react";
import SearchBar from "./searchBar";
import CustomDropdown from "./customDropdown";

type Dimensions = {
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
};

export default function FilterDropdown({
  searchBarValue,
  setSearchBarValue,
  onEnterPress,
  dimensions,
  children,
  anchorRef, // optional: element that triggers the dropdown (pass ref from the filter icon/button)
}: {
  searchBarValue: string;
  setSearchBarValue: React.Dispatch<React.SetStateAction<string>>;
  onEnterPress: () => void;
  dimensions?: Dimensions;
  children?: React.ReactNode;
  anchorRef?: React.RefObject<HTMLElement>;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ position: "absolute", left: 0, top: "calc(100% + 6px)", zIndex: 50 });

  useLayoutEffect(() => {
    // If an anchorRef is supplied, compute fixed viewport coords so dropdown can escape overflowed containers.
    if (!anchorRef?.current) {
      // no anchor passed -> remain absolute relative to parent; nothing to measure
      setStyle((s) => ({ ...s, position: "absolute", left: 0, top: "calc(100% + 6px)" }));
      return;
    }

    const anchor = anchorRef.current;
    const el = wrapperRef.current;
    if (!el) return;

    // compute fixed placement relative to viewport so dropdown won't be clipped by parent overflow
    const rect = anchor.getBoundingClientRect();
    // ensure dropdown has layout before measuring; it is in the DOM already
    const dropdownRect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = rect.left;
    let top = rect.bottom + 6;

    // shift if overflowing right
    if (left + dropdownRect.width + 8 > vw) {
      left = Math.max(20, vw - dropdownRect.width - 20);
    }

    // flip above anchor if overflowing bottom
    if (top + dropdownRect.height + 8 > vh) {
      const altTop = rect.top - dropdownRect.height - 6;
      if (altTop > 20) top = altTop;
      else top = Math.max(20, vh - dropdownRect.height - 20);
    }

    if (left < 20) left = 20;

    setStyle({ position: "fixed", left, top, zIndex: 50 });
  }, [anchorRef, dimensions, children, searchBarValue]);

  return (
    <div
      ref={wrapperRef}
      className={`min-w-[200px] w-fit max-h-[300px] h-fit z-50 overflow-auto -translate-x-[100px] scrollbar-none border-[1px] border-[#E9EAEB] rounded-[8px]`}
      style={{
        ...style,
        width: dimensions?.width,
        height: dimensions?.height,
        maxWidth: dimensions?.maxWidth,
        maxHeight: dimensions?.maxHeight,
      }}
    >
      <CustomDropdown>
        <div className="p-[10px] pb-[6px]">
          <SearchBar value={searchBarValue} onChange={(e) => setSearchBarValue(e.target.value)} onEnterPress={onEnterPress} placeholder="Search here..." />
        </div>
        <div>{children}</div>
      </CustomDropdown>
    </div>
  );
}