"use client";
import { useState, useEffect } from "react";
import ContainerCard from "@/app/components/containerCard";
import CustomCheckbox from "@/app/components/customCheckbox";
import InputFields from "@/app/components/inputFields";

type KeyComboType = {
  Location: string[];
  Customer: string[];
  Item: string[];
};

type KeyOption = { label: string; id:string; isSelected: boolean };
type KeyGroup = { type: string; options: KeyOption[] };

const initialKeys: KeyGroup[] = [
  {
    type: "Location",
    options: [
      { id: "1",label: "Company",  isSelected: false },
      { id: "2",label: "Region",  isSelected: false },
      {  id: "3",label: "Warehouse", isSelected: false },
      {  id: "4",label: "Area", isSelected: false },
      { id: "5",label: "Route",  isSelected: false },
    ],
  },
  {
    type: "Customer",
    options: [
      { id: "6",label: "Customer Type",  isSelected: false },
      { id: "7",label: "Channel",  isSelected: false },
      { id: "8",label: "Customer Category",  isSelected: false },
      { id: "9",label: "Customer",  isSelected: false },
    ],
  },
  {
    type: "Item",
    options: [
      {  id: "10",label: "Item Category", isSelected: false },
      { id: "11",label: "Item",  isSelected: false },
    ],
  },
];

type Props = {
  keyCombo: KeyComboType;
  setKeyCombo: React.Dispatch<React.SetStateAction<KeyComboType>>;
};

export default function SelectKeyCombination({ keyCombo, setKeyCombo }: Props) {
  const [keysArray, setKeysArray] = useState<KeyGroup[]>(() => {
    return initialKeys.map(group => ({
      ...group,
      options: group.options.map(opt => ({
        ...opt,
        isSelected: keyCombo[group.type as keyof KeyComboType]?.includes(opt.label) || false
      }))
    }));
  });
  const [selectedKey, setSelectedKey] = useState<string>("");

  useEffect(() => {
    setKeysArray(prev => {
      const next = initialKeys.map(group => ({
        ...group,
        options: group.options.map(opt => ({
          ...opt,
          isSelected: keyCombo[group.type as keyof KeyComboType]?.includes(opt.label) || false
        }))
      }));
      const isSame = prev.every((group, i) =>
        group.options.every((opt, j) => opt.isSelected === next[i].options[j].isSelected)
      );
      return isSame ? prev : next;
    });
  }, [keyCombo]);

  useEffect(() => {
    const selected: { Location: string[]; Customer: string[]; Item: string[] } = { Location: [], Customer: [], Item: [] };
    keysArray.forEach((group) => {
      if (group.type === "Location" || group.type === "Customer" || group.type === "Item") {
        selected[group.type] = group.options.filter((o) => o.isSelected).map((o) => o.label);
      }
    });
    setKeyCombo(selected);
  }, [keysArray, setKeyCombo]);

  function onKeySelect(index: number, optionIndex: number) {
    setKeysArray((prev) => {
      const newKeys = prev.map((group, i) => {
        if (i !== index) return group;
        return {
          ...group,
          options: group.options.map((opt, j) =>
            j === optionIndex ? { ...opt, isSelected: !opt.isSelected } : opt
          ),
        };
      });
      return newKeys;
    });
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setSelectedKey(e.target.value);
  };

  return (
    <ContainerCard className="h-fit mt-[20px] flex flex-col gap-2 p-6 bg-white border border-[#E5E7EB] rounded-[12px] shadow-none text-[#181D27]">
      <div className="font-semibold text-[20px] mb-4">Key Combination</div>
      <div className="mb-4">
        <InputFields
          label="Select Key"
          type="select"
          options={[
            { label: "Country / Channel / Majority", value: "0" },
            { label: "Country / Channel / Item Group", value: "1" },
            { label: "Country / Region / Channel / Major Category", value: "2" },
            { label: "Company / Channel / Item", value: "3" },
          ]}
          value={selectedKey}
          onChange={handleSelectChange}
          width="w-full"
        />
      </div>
      <div className="grid grid-cols-3 gap-6">
        {keysArray.map((group, index) => (
          <div
            key={index}
            className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 flex flex-col shadow-sm"
          >
            <div className="font-semibold text-[18px] mb-4 text-[#181D27]">{group.type}</div>
            <div className="flex flex-col gap-4">
              {group.options.map((option, optionIndex) => (
                <CustomCheckbox
                  key={optionIndex}
                  id={option.label + index}
                  label={option.label}
                  checked={option.isSelected}
                  onChange={() => onKeySelect(index, optionIndex)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <ContainerCard className="mt-6 bg-white border border-[#E5E7EB] rounded-[12px] shadow-none p-4 flex items-center gap-2">
        <span className="font-semibold text-[#181D27] text-[16px]">Key</span>
        <div className="flex flex-wrap items-center gap-2">
          {(() => {
            const loc = keysArray.find(g => g.type === "Location")?.options.filter(o => o.isSelected).map(o => o.label) || [];
            return loc.length > 0 ? loc.map((k, i) => (
              <span key={"loc-"+i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
            )) : null;
          })()}
          {(() => {
            const cust = keysArray.find(g => g.type === "Customer")?.options.filter(o => o.isSelected).map(o => o.label) || [];
            return cust.length > 0 ? [
              <span key="slash-cust" className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>,
              ...cust.map((k, i) => (
                <span key={"cust-"+i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
              ))
            ] : null;
          })()}
          {(() => {
            const item = keysArray.find(g => g.type === "Item")?.options.filter(o => o.isSelected).map(o => o.label) || [];
            return item.length > 0 ? [
              <span key="slash-item" className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>,
              ...item.map((k, i) => (
                <span key={"item-"+i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
              ))
            ] : null;
          })()}
        </div>
      </ContainerCard>
    </ContainerCard>
  );
}
