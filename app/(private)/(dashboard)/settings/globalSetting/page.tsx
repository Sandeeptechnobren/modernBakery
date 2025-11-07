"use client";

import { useState, useEffect } from "react";
import Toggle from "@/app/components/toggle";

export default function GlobalSettings({
  onChange,
}: {
  onChange?: (settings: {
    fullItemList: boolean;
    rowWiseItem: boolean;
    osaCode: boolean;
    sapCode: boolean;
  }) => void;
}) {
  const [settings, setSettings] = useState({
    fullItemList: true,
    rowWiseItem: false,
    osaCode: true,
    sapCode: false,
  });

  // Load saved settings from localStorage when component mounts
  useEffect(() => {
    const savedSettings = localStorage.getItem("globalSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      onChange && onChange(parsed);
    }
  }, [onChange]);

  // Handle toggle logic
  const handleToggle = (
    field: "fullItemList" | "rowWiseItem" | "osaCode" | "sapCode"
  ) => {
    const updatedSettings = { ...settings };

    // Group 1: Item Load Type (mutually exclusive)
    if (field === "fullItemList" || field === "rowWiseItem") {
      updatedSettings.fullItemList =
        field === "fullItemList" ? !settings.fullItemList : false;
      updatedSettings.rowWiseItem =
        field === "rowWiseItem" ? !settings.rowWiseItem : false;
    }

    // Group 2: Code Type (mutually exclusive)
    if (field === "osaCode" || field === "sapCode") {
      updatedSettings.osaCode = field === "osaCode" ? !settings.osaCode : false;
      updatedSettings.sapCode = field === "sapCode" ? !settings.sapCode : false;
    }

    setSettings(updatedSettings);
    onChange && onChange(updatedSettings);

    // Save updated settings to localStorage
    localStorage.setItem("globalSettings", JSON.stringify(updatedSettings));
  };

  return (
    <div className="flex flex-col w-full mt-4">
      <h2 className="text-base font-semibold mb-2 text-gray-700">
        Load Settings
      </h2>

      <div className="rounded-lg border border-gray-300 overflow-hidden">
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-center">
              <th colSpan={2} className="py-2 border-r border-gray-300">
                Item Load Type
              </th>
              <th colSpan={2} className="py-2">
                Code Type
              </th>
            </tr>
            <tr className="bg-gray-100 border-b border-gray-300 text-center text-xs">
              <th className="py-1 border-r border-gray-300">Full Item List</th>
              <th className="py-1 border-r border-gray-300">Row Wise Item</th>
              <th className="py-1 border-r border-gray-300">OSA Code</th>
              <th className="py-1">SAP Code</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              {/* Item List Group */}
              <td className="py-2 border-r border-gray-300">
                <Toggle
                  isChecked={settings.fullItemList}
                  onChange={() => handleToggle("fullItemList")}
                />
              </td>
              <td className="py-2 border-r border-gray-300">
                <Toggle
                  isChecked={settings.rowWiseItem}
                  onChange={() => handleToggle("rowWiseItem")}
                />
              </td>

              {/* Code Type Group */}
              <td className="py-2 border-r border-gray-300">
                <Toggle
                  isChecked={settings.osaCode}
                  onChange={() => handleToggle("osaCode")}
                />
              </td>
              <td className="py-2">
                <Toggle
                  isChecked={settings.sapCode}
                  onChange={() => handleToggle("sapCode")}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
