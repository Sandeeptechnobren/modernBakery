import React from "react";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { KeyComboType } from "../types";

type Props = {
  keyCombo: KeyComboType;
  keyValue: Record<string, string[]>;
  setKeyValue: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  locationDropdownMap: Record<string, any[]>;
  customerDropdownMap: Record<string, any[]>;
};

export default function StepKeyValue({ keyCombo, keyValue, setKeyValue, locationDropdownMap, customerDropdownMap }: Props) {
  return (
    <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Key Value</h2>
        <div className="text-sm text-gray-500"><span className="text-red-500">*</span> Required</div>
      </div>
      <div className="flex gap-6">
        <div className="flex-1">
          <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
            <div className="font-semibold text-lg mb-4">Location</div>
            {keyCombo.Location && (
              <div className="mb-4">
                <div className="mb-2 text-base font-medium">
                  {keyCombo.Location}
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <InputFields
                  label=""
                  type="select"
                  isSingle={false}
                  options={locationDropdownMap[keyCombo.Location] ? [{ label: `Select ${keyCombo.Location}`, value: "" }, ...locationDropdownMap[keyCombo.Location]] : [{ label: `Select ${keyCombo.Location}`, value: "" }]}
                  value={keyValue[keyCombo.Location] || ""}
                  onChange={e => {
                    const valueFromEvent = e.target.value;
                    let selectedValues: string[];
                    if (Array.isArray(valueFromEvent)) {
                      selectedValues = valueFromEvent;
                    } else {
                      selectedValues = valueFromEvent ? [String(valueFromEvent)] : [];
                    }
                    setKeyValue(s => ({ ...s, [keyCombo.Location]: selectedValues.filter(val => val !== "") }));
                  }}
                  width="w-full"
                />
              </div>
            )}
          </ContainerCard>
        </div>
        {keyCombo.Customer && (
          <div className="flex-1">
            <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
              <div className="font-semibold text-lg mb-4">Customer</div>
              <div className="mb-4">
                <div className="mb-2 text-base font-medium">
                  {keyCombo.Customer}
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <InputFields
                  label=""
                  type="select"
                  isSingle={false}
                  options={customerDropdownMap[keyCombo.Customer] ? [{ label: `Select ${keyCombo.Customer}`, value: "" }, ...customerDropdownMap[keyCombo.Customer]] : [{ label: `Select ${keyCombo.Customer}`, value: "" }]}
                  value={keyValue[keyCombo.Customer] || []}
                  onChange={e => {
                    const valueFromEvent = e.target.value;
                    let selectedValues: string[];
                    if (Array.isArray(valueFromEvent)) {
                      selectedValues = valueFromEvent;
                    } else {
                      selectedValues = valueFromEvent ? [String(valueFromEvent)] : [];
                    }
                    setKeyValue(s => ({ ...s, [keyCombo.Customer]: selectedValues.filter(val => val !== "") }));
                  }}
                  width="w-full"
                />
              </div>
            </ContainerCard>
          </div>
        )}
      </div>
    </ContainerCard>
  );
}
