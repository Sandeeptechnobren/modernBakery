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
  align,
  showInternalSearch = true,
}: {
  searchBarValue: string;
  setSearchBarValue: React.Dispatch<React.SetStateAction<string>>;
  onEnterPress: () => void;
  dimensions?: Dimensions;
  children?: React.ReactNode;
  anchorRef?: React.RefObject<HTMLElement | null>;
  align?: "start" | "center" | "end";
  showInternalSearch?: boolean;
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
  let overrideWidth: number | undefined;

  // try to limit dropdown within the table bounds if anchor is inside a table
  const table = (anchor as HTMLElement).closest("table");
  const tableRect = table ? (table as HTMLElement).getBoundingClientRect() : null;

    // alignment modes
    if (align === "center") {
      left = rect.left + rect.width / 2 - dropdownRect.width / 2;
    } else if (align === "end") {
      left = rect.right - dropdownRect.width;
    } else if (align === "start") {
      // attempt to align to the containing TH (column start) if available
      const th = (anchor as HTMLElement).closest("th");
      if (th) {
        const thRect = th.getBoundingClientRect();
        left = thRect.left;
      } else {
        left = rect.left;
      }
    }

    // If dropdown is wider than table, force width to table inner width and align to table left
    if (tableRect) {
      const tableInnerWidth = Math.max(100, tableRect.width - 8);
      if (dropdownRect.width > tableInnerWidth) {
        overrideWidth = tableInnerWidth;
        left = tableRect.left + 4;
      }
    }

    // shift if overflowing right (viewport)
    const effectiveWidth = overrideWidth || dropdownRect.width;
    if (left + effectiveWidth + 8 > vw) {
      left = Math.max(8, vw - effectiveWidth - 8);
    }

    // ensure dropdown stays inside table bounds when possible
    if (tableRect) {
      const minLeft = tableRect.left + 4;
      const maxLeft = tableRect.right - effectiveWidth - 4;
      left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft));
    }

    // flip above anchor if overflowing bottom
    if (top + dropdownRect.height + 8 > vh) {
      const altTop = rect.top - dropdownRect.height - 6;
      if (altTop > 20) top = altTop;
      else top = Math.max(20, vh - dropdownRect.height - 20);
    }
    if (left < 8) left = 8;

    const finalStyle: React.CSSProperties = { position: "fixed", left, top, zIndex: 9999 };
    if (overrideWidth) finalStyle.width = overrideWidth;
    setStyle(finalStyle);
  }, [anchorRef, dimensions, children, searchBarValue, align]);

  const [hasAnchor, setHasAnchor] = useState<boolean>(false);

  // Keep track of whether a valid anchor element exists (anchorRef.current)
  useLayoutEffect(() => {
    setHasAnchor(Boolean(anchorRef && (anchorRef as React.RefObject<HTMLElement | null>)?.current));
  }, [anchorRef]);

  const translateClass = hasAnchor ? "" : "-translate-x-[100px]";

  return (
    <div
      ref={wrapperRef}
      className={`min-w-[200px] w-fit max-h-[300px] h-fit z-50 overflow-auto scrollbar-none border-[1px] border-[#E9EAEB] rounded-[8px] ${translateClass}`}
      style={{
          ...style,
          width: dimensions?.width ?? style.width,
          height: dimensions?.height ?? style.height,
          maxWidth: dimensions?.maxWidth ?? style.maxWidth,
          maxHeight: dimensions?.maxHeight ?? style.maxHeight,
      }}
    >
      <CustomDropdown>
        {showInternalSearch && (
          <div className="p-[10px] pb-[6px]">
            <SearchBar value={searchBarValue} onChange={(e) => setSearchBarValue(e.target.value)} onEnterPress={onEnterPress} placeholder="Search here..." />
          </div>
        )}
        <div>{children}</div>
      </CustomDropdown>
    </div>
  );
}