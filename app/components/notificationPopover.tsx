"use client";

import React, { useState, useRef } from "react";
import DismissibleDropdown from "./dismissibleDropdown";
import CustomDropdown from "./customDropdown";
import IconButton from "./iconButton";
import { Icon } from "@iconify-icon/react";

export type NotificationItem = {
  id?: string;
  title: string;
  description?: string;
  onClick?: () => void;
};

export default function NotificationPopover({
  count = 0,
  items = [],
  dropdownClassName = "w-[320px]",
  position = "top-right",
  bgClassName = "bg-white",
  buttonClassName = "bg-transparent",
}: {
  count?: number;
  items?: NotificationItem[];
  dropdownClassName?: string;
  position?: "top-right" | "bottom-left" | "right-center";
  bgClassName?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={anchorRef} className="relative inline-flex">
      <DismissibleDropdown
        isOpen={open}
        setIsOpen={setOpen}
        button={
          <div
            onClick={() => setOpen((v) => !v)}
            className="relative inline-flex items-center justify-center"
            aria-label="Notifications"
          >
            <IconButton icon="lucide:bell" bgClass={buttonClassName} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-semibold text-white bg-red-600 rounded-full">
                {count}
              </span>
            )}
          </div>
        }
        dropdown={
          (() => {
            const positionClass =
              position === "top-right"
                ? "top-[40px] right-0"
                : position === "bottom-left"
                ? "bottom-[40px] left-0"
                : "top-1/2 left-full ml-2 -translate-y-1/2"; // right-center

            return (
              <div className={`absolute z-60 ${dropdownClassName} ${positionClass}`}>
                <CustomDropdown>
                  <div className={`${bgClassName} p-2`}> 
                    <h4 className="font-semibold mb-2">Notifications</h4>
                    <div className="flex flex-col gap-2 max-h-64 overflow-auto">
                      {items.length === 0 && (
                        <div className="px-2 py-2 text-sm text-gray-600">No notifications</div>
                      )}
                      {items.map((it) => (
                        <div
                          key={it.id || it.title}
                          className="px-2 py-2 border rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            it.onClick && it.onClick();
                            setOpen(false);
                          }}
                        >
                          <div className="font-medium text-sm">{it.title}</div>
                          {it.description && <div className="text-xs text-gray-500">{it.description}</div>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-right">
                      <button
                        className="text-sm text-blue-600"
                        onClick={() => {
                          // mark all read placeholder
                          setOpen(false);
                        }}
                      >
                        Mark all read
                      </button>
                    </div>
                  </div>
                </CustomDropdown>
              </div>
            );
          })()
        }
      />
    </div>
  );
}
