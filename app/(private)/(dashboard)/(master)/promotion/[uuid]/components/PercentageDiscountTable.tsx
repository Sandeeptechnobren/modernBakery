import React from "react";
import Table from "@/app/components/customTable";
import InputFields from "@/app/components/inputFields";
import { Icon } from "@iconify-icon/react";
import { PercentageDiscountType, KeyComboType, PromotionState } from "../types";

type Props = {
  percentageDiscounts: PercentageDiscountType[];
  setPercentageDiscounts: React.Dispatch<React.SetStateAction<PercentageDiscountType[]>>;
  promotion: PromotionState;
  keyCombo: KeyComboType;
  itemDropdownMap: Record<string, any[]>;
};

export default function PercentageDiscountTable({ percentageDiscounts, setPercentageDiscounts, promotion, keyCombo, itemDropdownMap }: Props) {
  const isCategoryMode = keyCombo.Item === "Item Category";
  const dropdownLabel = isCategoryMode ? "Item Category" : "Item";
  const dropdownOptions = isCategoryMode
    ? (itemDropdownMap["Item Category"] ? [ ...itemDropdownMap["Item Category"]] : [])
    : (itemDropdownMap["Item"] ? [ ...itemDropdownMap["Item"]] : []);

  return (
    <div className="mb-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-lg">{promotion.bundle_combination === "slab" && promotion.promotionType === "quantity" ? "Quantity Discount" : "Percentage Discount"}</div>
      </div>
      <Table
        data={percentageDiscounts}
        config={{
          showNestedLoading: false,
          columns: [
            {
              key: "key",
              label: (
                <span>
                  {dropdownLabel}
                  <span className="text-red-500 ml-1">*</span>
                </span>
              ),
              width: 250,
              render: (row: any) => {
                const currentVal = String(row.key ?? "");
                const otherSelectedValues = percentageDiscounts
                  .filter(p => String(p.idx) !== String(row.idx))
                  .map(p => p.key)
                  .filter(k => k && k !== "");

                const filteredOptions = dropdownOptions.filter(opt =>
                  opt.value === "" || opt.value === currentVal || !otherSelectedValues.includes(opt.value)
                );

                return (
                  <InputFields
                    label=""
                    type="select"
                    searchable={true}
                    isSingle={true}
                    placeholder={`Select ${dropdownLabel}`}
                    options={filteredOptions}
                    value={currentVal}
                    onChange={e => {
                      const val = e.target.value;
                      setPercentageDiscounts(prev => prev.map((p) => String(p.idx) === String(row.idx) ? { ...p, key: val } : p));
                    }}
                    width="w-full"
                  />
                );
              },
            },
            {
              key: "percentage",
              label: (
                <span>
                  {promotion.bundle_combination === "slab" && promotion.promotionType === "quantity" ? "Quantity" : "Percentage"}
                  <span className="text-red-500 ml-1">*</span>
                </span>
              ),
              width: 150,
              render: (row: any) => (
                <InputFields
                  label=""
                  type="number"
                  placeholder={promotion.bundle_combination === "slab" && promotion.promotionType === "quantity" ? "Quantity" : "Percentage"}
                  value={String(row.percentage ?? "")}
                  onChange={e => {
                    const val = e.target.value;
                    // Clamp 0-100 only if it's percentage type
                    if (promotion.promotionType === "percentage") {
                      const n = Number(val);
                      if (Number.isNaN(n)) return;
                      const clamped = Math.max(0, Math.min(100, n));
                      setPercentageDiscounts(prev => prev.map((p) => String(p.idx) === String(row.idx) ? { ...p, percentage: String(clamped) } : p));
                    } else {
                      setPercentageDiscounts(prev => prev.map((p) => String(p.idx) === String(row.idx) ? { ...p, percentage: val } : p));
                    }
                  }}
                  width="w-full"
                  trailingElement={promotion.bundle_combination === "slab" && promotion.promotionType === "quantity" ? undefined : <span className="text-gray-500 font-semibold">%</span>}
                />
              ),
            },
            {
              key: "action",
              label: "Action",
              width: 30,
              render: (row: any) => (
                <button
                  type="button"
                  disabled={percentageDiscounts.length <= 1}
                  className={`flex w-full h-full ${percentageDiscounts.length <= 1 ? "text-gray-300 cursor-not-allowed" : "text-red-500"}`}
                  onClick={() => {
                    if (percentageDiscounts.length <= 1) return;
                    setPercentageDiscounts(prev => prev.filter(p => String(p.idx) !== String(row.idx)));
                  }}
                >
                  <Icon icon="lucide:trash-2" width={20} />
                </button>
              ),
            },
          ],
          pageSize: 10,
        }}
      />
      <div className="mt-4">
        <button
          type="button"
          className="text-[#E53935] font-medium text-[16px] flex items-center gap-2"
          onClick={() => {
            setPercentageDiscounts(prev => [...prev, { key: "", percentage: "", idx: String(Math.random()) }]);
          }}
        >
          <Icon icon="material-symbols:add-circle-outline" width={20} />
          Add New Item
        </button>
      </div>
    </div>
  );
}
