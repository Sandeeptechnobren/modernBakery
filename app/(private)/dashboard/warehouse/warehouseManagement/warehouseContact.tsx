"use client";

import { useState } from "react";
import InputFields from "@/app/components/inputFields";

export default function WarehouseContactDetails() {
  const [primaryCode, setPrimaryCode] = useState("uae");
  const [contact, setContact] = useState("");
  const [tinCode, setTinCode] = useState("uae");
  const [tinNumber, setTinNumber] = useState("");
  const [email, setEmail] = useState("");

  const countryOptions = [
    { value: "uae", label: "UAE" },
    { value: "in", label: "India" },
    { value: "us", label: "USA" },
    { value: "uk", label: "UK" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full overflow-x-hidden">
      {/* Contact */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm font-medium text-gray-700">Contact</label>
        <div className="flex w-full">
          <select
            value={primaryCode}
            onChange={(e) => setPrimaryCode(e.target.value)}
            className="border border-gray-300 rounded-l-md px-3 text-gray-900 h-[44px] w-24 sm:w-28"
          >
            {countryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contact Number"
            className="border border-gray-300 rounded-r-md px-3 text-gray-900 placeholder-gray-400 flex-1 h-[44px] w-full"
          />
        </div>
      </div>

      {/* Tin Number */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm font-medium text-gray-700">Tin Number</label>
        <div className="flex w-full">
          <select
            value={tinCode}
            onChange={(e) => setTinCode(e.target.value)}
            className="border border-gray-300 rounded-l-md px-3 text-gray-900 h-[44px] w-24 sm:w-28"
          >
            {countryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={tinNumber}
            onChange={(e) => setTinNumber(e.target.value)}
            placeholder="TIN Number"
            className="border border-gray-300 rounded-r-md px-3 text-gray-900 placeholder-gray-400 flex-1 h-[44px] w-full"
          />
        </div>
      </div>

      {/* Email */}
      <InputFields
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>
  );
}
  