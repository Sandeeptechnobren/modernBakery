"use client";

import { useContext } from "react";
import { KeysArray, keysTypes } from "./page";
import ContainerCard from "@/app/components/containerCard";

export default function KeyValue() {
    const [keysArray, setKeyArray] = useContext(KeysArray);
    return (
        <>
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
                                                <div key={optionIndex}>{option.isSelected && option.label}</div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ContainerCard>
        </>
    );
}
