"use client";

import React, { useState, useEffect } from "react";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
// import { pricingHeaderById } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams } from "next/navigation";


// Your static mapping
const initialKeys = [
  { type: "Location", options: [
      { id: "1", label: "Company" },
      { id: "2", label: "Region" },
      { id: "3", label: "Warehouse" },
      { id: "4", label: "Area" },
      { id: "5", label: "Route" },
  ]},
  { type: "Customer", options: [
      { id: "6", label: "Customer Type" },
      { id: "7", label: "Channel" },
      { id: "8", label: "Customer Category" },
      { id: "9", label: "Customer" },
  ]},
  { type: "Item", options: [
      { id: "10", label: "Item Category" },
      { id: "11", label: "Item" },
  ]},
];

// Build mapping object for quick lookup
const keyIdLabelMap: Record<number, string> = {};
initialKeys.forEach(group => {
  group.options.forEach(opt => {
    keyIdLabelMap[Number(opt.id)] = opt.label;
  });
});



// Collapsible field/table for array-valued keys
type Column = { key: string; label: string };

function getCellValue(row: Record<string, unknown>, colKey: string): string {
  const keysToTry = [
    colKey,
    colKey.replace("_name", "name"),
    colKey.replace("name", "category_name"),
  ];
  for (const k of keysToTry) {
    const v = row[k];
    if (v !== undefined && v !== null) return String(v);
  }
  return "-";
}

function CollapsibleField({ label, values, columns }: { label: string; values: Array<Record<string, unknown> | string | number>; columns: Column[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!values || values.length === 0) return null;

  if (values.length === 1) {
    // Single value, display inline
    const first = values[0];
    if (typeof first === "object" && first !== null) {
      const obj = first as Record<string, unknown>;
      return (
        <div className="flex border-b border-gray-200 min-h-[48px]">
          <div className="flex-1 py-3 px-5 font-medium">{label}</div>
          <div className="flex-3 text-left py-3 px-5">{Object.values(obj).join(", ")}</div>
        </div>
      );
    }
    return (
      <div className="flex border-b border-gray-200 min-h-[48px]">
        <div className="flex-1 py-3 px-5 font-medium">{label}</div>
        <div className="flex-3 text-left py-3 px-5">{String(first)}</div>
      </div>
    );
  }

  // Multiple, expandable
  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center min-h-[48px]">
        <div className="flex-1 py-3 px-5 font-medium">{label}</div>
        <div className="flex-3 text-left py-3 px-5">
          {(typeof values[0] === "object" && values[0] !== null
            ? Object.values(values[0] as Record<string, unknown>).join(", ")
            : String(values[0]))
          }
          &nbsp;
          <span
            className="text-teal-600 cursor-pointer font-bold"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? "▲" : `& ${values.length - 1} more ▼`}
          </span>
        </div>
      </div>
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-50 mb-2 border-collapse">
            <thead>
              <tr>
                {columns.map((col: Column) => (
                  <th key={col.key} className="p-2 text-left bg-gray-100">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {values.map((row: Record<string, unknown> | string | number, i: number) => (
                <tr key={i}>
                  {columns.map((col: Column) => (
                    <td key={col.key} className="p-2 border-b">
                      {typeof row === "object" && row !== null
                        ? getCellValue(row as Record<string, unknown>, col.key)
                        : String(row)
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const arrayColumns = {
  company: [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
  ],
  region: [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
  ],
  area: [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
  ],
  warehouse: [
    { key: "warehouse_code", label: "Code" },
    { key: "warehouse_name", label: "Name" },
  ],
  route: [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
  ],
  customer_category: [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
  ],
  customer: [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
  ],
  outlet_channel: [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
  ],
  item_category: [
    { key: "category_code", label: "Code" },
    { key: "category_name", label: "Name" },
  ],
  item: [
    { key: "erp_code", label: "Code" },
    { key: "name", label: "Name" },
  ]
};
interface PricingItem {
  [key: string]: any;
  uuid?: string;
  id?: number | string;
  code?: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  description?: number[] | string;
  status?: string;
}

interface KeyValueProps {
  pricing: PricingItem | null;
  section?: string; // optional: which section to render (e.g. 'company', 'warehouse', 'item')
}

export default function KeyValue({ pricing, section }: KeyValueProps) {
  const params = useParams();
  const uuid = Array.isArray(params.uuid)
    ? params.uuid[0] || ""
    : (params.uuid) || "";

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  // useEffect(() => {
  //   if (!uuid) return;

  //   const fetchPricingDetails = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await pricingHeaderById(uuid);
  //       if (res.error) {
  //         showSnackbar(
  //           res.data?.message || "Unable to fetch pricing Details",
  //           "error"
  //         );
  //         return;
  //       }
  //       setPricing(res.data);
  //     } catch (error) {
  //       showSnackbar("Unable to fetch pricing Details", "error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchPricingDetails();
  // }, [uuid, setLoading, showSnackbar]);

  if (!pricing) {
    return <div>Loading...</div>;
  }

  // normalize section name
  const normalizedSection = section === "items" ? "item" : section;
  const keysToRender = normalizedSection ? [normalizedSection] : Object.keys(arrayColumns);
  // if a specific section was requested but has no items, show 'No Data Found'
  if (normalizedSection) {
    const arr = pricing[normalizedSection];
    if (Array.isArray(arr) && arr.length === 0) {
      return (
        <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
          <div className="w-full flex flex-col gap-y-[20px]">
            <ContainerCard className="w-full">
              <div className="py-6 text-center text-gray-500">No Data Found</div>
            </ContainerCard>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
      <div className="w-full flex flex-col gap-y-[20px]">
        <ContainerCard className="w-full">
          {/* Collapsible array fields */}
          {keysToRender.map((key) => {
            const cols = (arrayColumns as any)[key];
            if (!cols) return null;
            return Array.isArray(pricing[key]) && pricing[key].length > 0 ? (
              <CollapsibleField
                key={key}
                label={key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                values={pricing[key]}
                columns={cols}
              />
            ) : null;
          })}
        </ContainerCard>
      </div>
    </div>
  );
}
