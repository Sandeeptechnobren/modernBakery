"use client";

import React from "react";

type Option = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  type: "amount" | "contact";
  error?: string | false | undefined;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  // Amount with currency
  amount?: string;
  currency?: string;
  onAmountChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCurrencyChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;

  // Contact with country code
  contact?: string;
  code?: string;
  onContactChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCodeChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;

  // Shared options
  options: Option[];
};

export default function FormInputField({
  label,
  type,
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  contact,
  code,
  onContactChange,
  onCodeChange,
  options,
  error,
  onBlur,
}: Props) {
  return (
    <div className="flex flex-col gap-2 max-w-[406px]">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {type === "amount" ? (
        // 💰 Amount with Currency
        <div className="flex w-full">
          <input
            type="number"
            value={amount}
            onChange={onAmountChange}
            onBlur={onBlur}
            placeholder="0.00"
            className="border border-gray-300 rounded-l-md px-3 text-gray-900 placeholder-gray-400 flex-1 h-[44px] "
          />
          <select
            value={currency}
            onChange={onCurrencyChange}
            className="border border-gray-300 rounded-r-md px-3 text-gray-900 h-[44px] w-28 sm:w-32"
          >
            {options.map((opt, index) => (
              <option key={opt.value+index} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        // 📞 Contact with Code
        <div className="flex flex-col w-full">
          <div className="flex">
            <select
              value={code}
              onChange={onCodeChange}
              className="border border-gray-300 rounded-l-md px-3 text-gray-900 h-[44px] w-24 sm:w-28"
            >
              {options.map((opt, index) => (
                <option key={opt.value+index} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={contact}
              onChange={onContactChange}
              onBlur={onBlur}
              placeholder="Enter contact number"
              className="border border-gray-300 rounded-r-md px-3 text-gray-900 placeholder-gray-400 flex-1 h-[44px]"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
}
