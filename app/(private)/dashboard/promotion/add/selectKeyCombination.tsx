"use client";

import ContainerCard from "@/app/components/containerCard";
import InputDropdown from "@/app/components/inputDropdown";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { useEffect, useState } from "react";
import CustomCheckbox from "@/app/components/customCheckbox";

const initialKeys = [
    {
        type: "Location",
        options: [
            { label: "Country", value: "0", isSelected: false },
            { label: "Region", value: "1", isSelected: false },
            { label: "Area", value: "2", isSelected: false },
            { label: "Route", value: "3", isSelected: false },
        ],
    },
    {
        type: "Customer",
        options: [
            { label: "Sales Organisation", value: "0", isSelected: false },
            { label: "Channel", value: "1", isSelected: false },
            { label: "Customer Category", value: "2", isSelected: false },
            { label: "Customer", value: "3", isSelected: false },
        ],
    },
    {
        type: "Item",
        options: [
            { label: "Major Category", value: "0", isSelected: false },
            { label: "Item Group", value: "1", isSelected: false },
            { label: "Item", value: "2", isSelected: false },
        ],
    },
];

type keysTypes = typeof initialKeys;

export default function SelectKeyCombination() {
    const [keysArray, setKeyArray] = useState(initialKeys);
    const [showKeyCombination, setShowKeyCombination] = useState(true);
    const [keyCombination, setKeyCombination] = useState("");

    useEffect(() => {
        // This effect runs whenever the 'keys' state changes
        const selectedItems = keysArray.flatMap((mainItem) =>
            mainItem.options.filter((option) => option.isSelected)
        );

        const selectedLabels = selectedItems.map((item) => item.label);
        setKeyCombination(selectedLabels.join(" / "));
    }, [keysArray]);

    function setNewKeysArrayFromString(keyCombination: string) {
        const labels = keyCombination.split(" / ");
        const newInitialKeys = initialKeys.map((mainItem) => {
            // For each main category, create a new object
            return {
                ...mainItem,
                options: mainItem.options.map((option) => {
                    // For each option, check if its label is in our parsed array
                    const isSelected = labels.includes(option.label);

                    // Return a new option object with the updated isSelected value
                    return {
                        ...option,
                        isSelected: isSelected,
                    };
                }),
            };
        });
        setKeyArray(newInitialKeys);
    }

    function onKeySelect(
        index: number,
        optionIndex: number,
        option: { label: string; value: string; isSelected: boolean }
    ) {
        const newKeys = [...keysArray];
        const newOptions = [...newKeys[index].options];
        const updatedOption = {
            ...newOptions[optionIndex],
            isSelected: !newOptions[optionIndex].isSelected,
        };
        newOptions[optionIndex] = updatedOption;
        newKeys[index] = {
            ...newKeys[index],
            options: newOptions,
        };
        setKeyArray(newKeys);
    }

    return (
        <>
            <div>
                <InputDropdown
                    label="Select Key"
                    defaultText="Select Key"
                    options={[
                        { label: "Country / Channel / Majority", value: "0" },
                        { label: "Country / Channel / Item Group", value: "1" },
                        { label: "Country / Region / Channel / Major Category", value: "2" },
                    ]}
                    onOptionSelect={(option) => {
                        setNewKeysArrayFromString(option.label);
                        if(showKeyCombination) setShowKeyCombination(false);
                    }}
                />
            </div>

            {showKeyCombination && (
                <ContainerCard className="h-fit mt-[20px] flex flex-col items-center justify-center text-[#181D27]">
                    <div className="text-[20px] text-primary text-center space-y-2">
                        <div>To create new key combination</div>
                        <div>click on &quot;+&quot; button</div>
                    </div>
                    <div
                        className="w-[40px] h-[40px] p-[5px] rounded-full bg-[var(--secondary-btn-color)] flex items-center justify-center cursor-pointer mt-[20px]"
                        onClick={() => setShowKeyCombination(false)}
                    >
                        <Icon
                            icon="lucide:plus"
                            width={24}
                            className="m-auto"
                        />
                    </div>
                </ContainerCard>
            )}

            {!showKeyCombination && (
                <ContainerCard className="h-fit mt-[20px] flex flex-col items-center justify-center text-[#181D27]">
                    <div className="w-full">
                        {keysArray.map((group: keysTypes[0], index: number) => {
                            return (
                                <div key={index} className="w-full mb-[20px]">
                                    <div className="font-medium mb-[10px]">
                                        {group.type}
                                    </div>
                                    <div className="w-full flex gap-[10px] flex-wrap">
                                        {group.options.map(
                                            (option, optionIndex) => {
                                                return (
                                                    <CustomCheckbox
                                                        key={optionIndex}
                                                        id={
                                                            option.label + index
                                                        }
                                                        label={option.label}
                                                        checked={
                                                            option.isSelected
                                                        }
                                                        onChange={() =>
                                                            onKeySelect(
                                                                index,
                                                                optionIndex,
                                                                option
                                                            )
                                                        }
                                                    />
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-[16px] text-primary bg-[var(--secondary-btn-color)] p-[10px] rounded-[8px]">
                        <span className="font-semibold">Key : </span>
                        {keyCombination}
                    </div>
                </ContainerCard>
            )}
        </>
    );
}
