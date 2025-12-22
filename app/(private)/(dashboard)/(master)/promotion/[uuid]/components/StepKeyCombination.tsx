import React, { useMemo } from "react";
import ContainerCard from "@/app/components/containerCard";
import CustomCheckbox from "@/app/components/customCheckbox";
import { KeyComboType, KeyGroup } from "../types";
import { initialKeys } from "../utils/constants";

type Props = {
  keyCombo: KeyComboType;
  setKeyCombo: React.Dispatch<React.SetStateAction<KeyComboType>>;
};

export default function StepKeyCombination({ keyCombo, setKeyCombo }: Props) {
  const keysArray = useMemo(() => initialKeys.map(group => ({
    ...group,
    options: group.options.map(opt => ({
      ...opt,
      isSelected: keyCombo[group.type] === opt.label
    }))
  })), [keyCombo]);

  function onKeySelect(index: number, optionIndex: number) {
    const newKeys = keysArray.map((group, i) => {
      if (i !== index) return group;
      const isSingleSelectGroup = (group.type === "Location" || group.type === "Customer" || group.type === "Item");

      if (isSingleSelectGroup) {
        return {
          ...group,
          options: group.options.map((opt, j) => ({
            ...opt,
            isSelected: j === optionIndex ? !opt.isSelected : false
          })),
        };
      } else {
        return {
          ...group,
          options: group.options.map((opt, j) =>
            j === optionIndex ? { ...opt, isSelected: !opt.isSelected } : opt
          ),
        };
      }
    });

    const selected: KeyComboType = { Location: "", Customer: "", Item: "" };
    newKeys.forEach((group) => {
      if (group.type === "Location" || group.type === "Customer" || group.type === "Item") {
        const found = group.options.find((o) => o.isSelected);
        selected[group.type] = found ? found.label : "";
      }
    });
    setKeyCombo(selected);
  }

  return (
    <ContainerCard className="h-fit mt-[20px] flex flex-col gap-2 p-6 bg-white border border-[#E5E7EB] rounded-[12px] shadow-none text-[#181D27]">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-[20px]">Key Combination</div>
        <div className="text-sm text-gray-500"><span className="text-red-500">*</span> Required</div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {keysArray.map((group, index) => (
          <div key={index} className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 flex flex-col shadow-sm">
            <div className="font-semibold text-[18px] mb-4 text-[#181D27]">
              {group.type}
              {(group.type === "Location" || group.type === "Item") && <span className="text-red-500 ml-1">*</span>}
            </div>
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
          {keyCombo.Location && (
            <span className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{keyCombo.Location}</span>
          )}
          {keyCombo.Customer && (
            <>
              <span className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>
              <span className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{keyCombo.Customer}</span>
            </>
          )}
          {keyCombo.Item && (
            <>
              <span className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>
              <span className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{keyCombo.Item}</span>
            </>
          )}
        </div>
      </ContainerCard>
    </ContainerCard>
  );
}
