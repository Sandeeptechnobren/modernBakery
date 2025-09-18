import { Icon } from "@iconify-icon/react";
import { useEffect, useState } from "react";
import DismissibleDropdown from "./dismissibleDropdown";
import CustomDropdown from "./customDropdown";

export default function InputDropdown({
    label,
    defaultOption = 0,
    defaultText = "",
    options,
    onOptionSelect
}: {
    label: string;
    defaultOption?: number;
    defaultText?: string;
    options: { label: string; value: string }[];
    onOptionSelect: (option: { label: string; value: string }) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOptionLabel, setSelectedOptionLabel] = useState(defaultText);

    function onSelect(option: { label: string; value: string }) {
        setSelectedOptionLabel(option.label);
        setIsOpen(false);
        onOptionSelect(option);
    }

    useEffect(() => {
        if(options[defaultOption]?.label) setSelectedOptionLabel(options[defaultOption]?.label);
    }, [options, defaultOption]);

    return (
        <DismissibleDropdown
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            button={
                <label htmlFor={label} className="w-full">
                    <div className="text-[#414651] text-[14px] font-medium">
                        {label}
                    </div>
                    <div
                        id={label}
                        className="relative text-[#717680] border h-[44px] w-full border-gray-300 rounded-md px-[14px] py-[10px] mt-[6px] text-[16px] flex items-center justify-between"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div className="w-full overflow-hidden">
                            <div className="whitespace-nowrap">{selectedOptionLabel}</div>
                        </div>
                        <Icon
                            icon="material-symbols:expand-more-rounded"
                            className="aboslute right-[14px] top-0 h-full"
                            width={24}
                        />
                    </div>
                </label>
            }
            dropdown={
                <div className="absolute z-20 w-full">
                    <CustomDropdown>
                        {options.map((option, index) => (
                            <div key={index} className="p-[10px] text-[#414651] hover:bg-gray-100" onClick={() => onSelect(option)}>
                                <div key={index + label}>{option.label}</div>
                            </div>
                        ))}
                    </CustomDropdown>
                </div>
            }
        />
    );
}
