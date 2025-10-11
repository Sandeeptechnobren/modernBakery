
"use client";
import { Icon } from "@iconify-icon/react";
import { useState } from "react";
import Toggle from "@/app/components/toggle";

const data = [
    {
        id: 1,
        name: "Organization"
    },
    {
        id: 2,
        name: "Customer"
    },
    {
        id: 3,
        name: "Salesman"
    },
    {
        id: 4,
        name: "Merchandiser"
    },
    {
        id: 5,
        name: "Journey Plan"
    },
    {
        id: 6,
        name: "Promotion"
    },
    {
        id: 7,
        name: "Pricing"
    },
    {
        id: 8,
        name: "Discount"
    },
    {
        id: 9,
        name: "Rebate"
    },
    {
        id: 10,
        name: "Order"
    },
    {
        id: 11,
        name: "Delivery"
    },
    {
        id: 12,
        name: "Invoice"
    },
    {
        id: 13,
        name: "Credit Note"
    },
    {
        id: 14,
        name: "Debit Note"
    },
    {
        id: 15,
        name: "Collection"
    },
    {
        id: 16,
        name: "Route Item Grouping"
    },
    {
        id: 17,
        name: "Portfolio Management"
    },
]

export default function Table() {
    const [rowStates, setRowStates] = useState<
        Record<
            number,
            { all: boolean; view: boolean; create: boolean; edit: boolean; delete: boolean }
        >
    >({});

    const handleToggle = (rowId: number, field: keyof (typeof rowStates)[number]) => {
        setRowStates((prev) => {
            const current = prev[rowId] || {
                all: false,
                view: false,
                create: false,
                edit: false,
                delete: false,
            };

            if (field === "all") {
                const newValue = !current.all;
                return {
                    ...prev,
                    [rowId]: {
                        all: newValue,
                        view: newValue,
                        create: newValue,
                        edit: newValue,
                        delete: newValue,
                    },
                };
            }

            const updatedRow = {
                ...current,
                [field]: !current[field],
            };

            updatedRow.all =
                // updatedRow.view || updatedRow.create || updatedRow.edit || updatedRow.delete;
                updatedRow.view && updatedRow.create && updatedRow.edit && updatedRow.delete;

            return {
                ...prev,
                [rowId]: updatedRow,
            };
        });
    };



    return (
        <div className="w-full flex flex-col overflow-hidden">
            <div className="rounded-lg border border-[#E9EAEB]">
                <table className="table-auto min-w-max overflow-y-auto">
                    <thead className="text-[12px] bg-[#FAFAFA] text-[#535862] sticky top-0 z-20">
                        <tr className="relative h-[44px] border-b-[1px] border-[#E9EAEB]">
                            <th className="px-[24px] py-[12px] font-[500] w-70 text-left sticky">Master</th>
                            <th className="px-[24px] py-[10px] font-[500] text-right sticky">
                                <Icon icon="iconamoon:search" width={16} />
                            </th>
                            <th className="px-[24px] py-[12px] font-[500] w-[218px] border-l border-[#E9EAEB] text-center">
                                View
                            </th>
                            <th className="px-[24px] py-[12px] font-[500] w-[218px] border-l border-[#E9EAEB] text-center">
                                Create
                            </th>
                            <th className="px-[24px] py-[12px] font-[500] w-[218px] border-l border-[#E9EAEB] text-center">
                                Edit
                            </th>
                            <th className="px-[24px] py-[12px] font-[500] w-[218px] border-l border-[#E9EAEB] text-center">
                                Delete
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-[14px] bg-white text-[#535862]">
                        {data.map((row) => {
                            const state = rowStates[row.id] || {
                                all: false,
                                view: false,
                                create: false,
                                edit: false,
                                delete: false,
                            };

                            return (
                                <tr className="border-b-[1px] border-[#E9EAEB]" key={row.id}>
                                    <td className="px-[24px] py-[12px] text-left font-[500]">
                                        {row.name}
                                    </td>

                                    <td className="px-[24px] py-[12px] text-right">
                                        <Toggle
                                            isChecked={state.all}
                                            onChange={() => handleToggle(row.id, "all")}
                                        />
                                    </td>

                                    <td className="px-[24px] py-[12px] text-center border-l border-[#E9EAEB]">
                                        <Toggle
                                            isChecked={state.view}
                                            onChange={() => handleToggle(row.id, "view")}
                                        />
                                    </td>

                                    <td className="px-[24px] py-[12px] text-center border-l border-[#E9EAEB]">
                                        <Toggle
                                            isChecked={state.create}
                                            onChange={() => handleToggle(row.id, "create")}
                                        />
                                    </td>

                                    <td className="px-[24px] py-[12px] text-center border-l border-[#E9EAEB]">
                                        <Toggle
                                            isChecked={state.edit}
                                            onChange={() => handleToggle(row.id, "edit")}
                                        />
                                    </td>

                                    <td className="px-[24px] py-[12px] text-center border-l border-[#E9EAEB]">
                                        <Toggle
                                            isChecked={state.delete}
                                            onChange={() => handleToggle(row.id, "delete")}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
        </div>
        </div>
    );
}
