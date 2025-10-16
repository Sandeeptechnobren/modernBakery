"use client";

import React, { useState, useEffect } from "react";
import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { pricingHeaderById } from "@/app/services/allApi";
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
const keyIdLabelMap = {};
initialKeys.forEach(group => {
  group.options.forEach(opt => {
    keyIdLabelMap[Number(opt.id)] = opt.label;
  });
});

function getDescriptionLabels(desc) {
  let descArray = [];
  if (Array.isArray(desc)) {
    descArray = desc;
  } else if (typeof desc === "string") {
    descArray = desc.split(",").map(x => Number(x.trim())).filter(Boolean);
  }
  return descArray.map(id => keyIdLabelMap[id] || id).join(", ");
}

// Collapsible field/table for array-valued keys
function CollapsibleField({ label, values, columns }) {
  const [expanded, setExpanded] = useState(false);
  if (!values || values.length === 0) return null;

  if (values.length === 1) {
    // Single value, display inline
    return (
      <div className="flex border-b border-gray-200 min-h-[48px]">
        <div className="flex-1 py-3 px-5 font-medium">{label}</div>
        <div className="flex-3 text-left py-3 px-5">
          {typeof values[0] === "object"
            ? Object.values(values[0]).join(", ")
            : String(values[0])
          }
        </div>
      </div>
    );
  }
  // Multiple, expandable
  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center min-h-[48px]">
        <div className="flex-1 py-3 px-5 font-medium">{label}</div>
        <div className="flex-3 text-left py-3 px-5">
          {(typeof values[0] === "object"
            ? Object.values(values[0]).join(", ")
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
                {columns.map(col => (
                  <th key={col.key} className="p-2 text-left bg-gray-100">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {values.map((row, i) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={col.key} className="p-2 border-b">
                      {row[col.key]
                        ?? row[col.key.replace("_name", "name")]
                        ?? row[col.key.replace("name", "category_name")]
                        ?? "-"
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
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "code", label: "Code" }
  ],
  region: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "code", label: "Code" }
  ],
  area: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "code", label: "Code" }
  ],
  warehouse: [
    { key: "id", label: "ID" },
    { key: "warehouse_name", label: "Name" },
    { key: "warehouse_code", label: "Code" }
  ],
  route: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "code", label: "Code" }
  ],
  customer_category: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "code", label: "Code" }
  ],
  customer: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "code", label: "Code" }
  ],
  outlet_channel: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "code", label: "Code" }
  ],
  item_category: [
    { key: "id", label: "ID" },
    { key: "category_name", label: "Name" },
    { key: "category_code", label: "Code" }
  ],
  item: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "erp_code", label: "Code" }
  ]
};

export default function Overview() {
  const params = useParams();
  const uuid = Array.isArray(params.uuid)
    ? params.uuid[0] || ""
    : (params.uuid) || "";

  const [pricing, setpricing] = useState(null);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!uuid) return;

    const fetchPricingDetails = async () => {
      setLoading(true);
      try {
        const res = await pricingHeaderById(uuid);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch pricing Details",
            "error"
          );
          return;
        }
        setpricing(res.data);
      } catch (error) {
        showSnackbar("Unable to fetch pricing Details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPricingDetails();
  }, [uuid, setLoading, showSnackbar]);

  if (!pricing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
      <div className="w-full flex flex-col gap-y-[20px]">
        <ContainerCard className="w-full">
          {/* Collapsible array fields */}
          {Object.entries(arrayColumns).map(([key, cols]) =>
            Array.isArray(pricing[key]) && pricing[key].length > 0
              ? <CollapsibleField
                  key={key}
                  label={key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  values={pricing[key]}
                  columns={cols}
                />
              : null
          )}
        </ContainerCard>
      </div>
    </div>
  );
}
