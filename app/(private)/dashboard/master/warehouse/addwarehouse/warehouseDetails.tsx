"use client";

import { useState } from "react";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";

export default function WarehouseDetails() {
    const [isOpen, setIsOpen] = useState(false);
    const [warehouseType, setWarehouseType] = useState("");
    const [warehouseCode, setWarehouseCode] = useState("");
    const [agentId, setAgentId] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [bussinessType, setBussinessType] = useState("");

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
                label="Warehouse Type"
                value={warehouseType}
                onChange={(e) => setWarehouseType(e.target.value)}
                options={[
                    { value: "agent", label: "Agent" },
                    { value: "hariss outlet", label: "Hariss Outlet" },
                ]}
            />

            <InputFields
                label="Warehouse Name"
                value={warehouseCode}
                onChange={(e) => setWarehouseCode(e.target.value)}
            />

            <div className="flex items-end gap-2 max-w-[406px]">
                <InputFields
                    label="Warehouse Code"
                    value={warehouseCode}
                    onChange={(e) => setWarehouseCode(e.target.value)}
                />

                <IconButton
                    bgClass="white"
                    className="mb-2 cursor-pointer text-[#252B37]"
                    icon="mi:settings"
                    onClick={() => setIsOpen(true)}
                />

                <SettingPopUp
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title="Warehouse Code"
                />
            </div>

            <InputFields
                label="Agent ID"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
            />

            <InputFields
                label="Warehouse Owner Name "
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
            />

            <InputFields
                label="Bussiness Type"
                value={bussinessType}
                onChange={(e) => setBussinessType(e.target.value)}
                options={[{ value: "B2B ", label: "B2B " }]}
            />
        </div>
    );
}
