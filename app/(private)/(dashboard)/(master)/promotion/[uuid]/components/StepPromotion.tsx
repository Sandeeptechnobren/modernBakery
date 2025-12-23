import React, { useMemo } from "react";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { KeyComboType, PromotionState, OrderItemType, OfferItemType, PercentageDiscountType } from "../types";
import PercentageDiscountTable from "./PercentageDiscountTable";
import OrderItemsTable from "./OrderItemsTable";
import OfferItemsTable from "./OfferItemsTable";

type Props = {
  keyCombo: KeyComboType;
  keyValue: Record<string, string[]>;
  setKeyValue: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  promotion: PromotionState;
  setPromotion: React.Dispatch<React.SetStateAction<PromotionState>>;
  itemDropdownMap: Record<string, any[]>;
  salesmanTypeOptions: any[];
  projectOptions: any[];
  uomOptions: any[];
  selectedUom: string;
  setSelectedUom: React.Dispatch<React.SetStateAction<string>>;
  itemLoading: boolean;
  itemOptions: any[];
  // Table Props
  percentageDiscounts: PercentageDiscountType[];
  setPercentageDiscounts: React.Dispatch<React.SetStateAction<PercentageDiscountType[]>>;
  orderTables: OrderItemType[][];
  setOrderTables: React.Dispatch<React.SetStateAction<OrderItemType[][]>>;
  updateOrderItem: (tableIdx: number, rowIdx: string, key: keyof OrderItemType, value: string) => void;
  offerItems: OfferItemType[][];
  setOfferItems: React.Dispatch<React.SetStateAction<OfferItemType[][]>>;
  selectItemForOffer: (tableIdx: number, rowIdx: string, value: string | string[]) => void;
  updateOfferItem: (tableIdx: number, rowIdx: string, key: keyof OfferItemType, value: string) => void;
};

export default function StepPromotion({
  keyCombo, keyValue, setKeyValue, promotion, setPromotion, itemDropdownMap,
  salesmanTypeOptions, projectOptions, uomOptions, selectedUom, setSelectedUom, itemLoading, itemOptions,
  percentageDiscounts, setPercentageDiscounts, orderTables, setOrderTables, updateOrderItem,
  offerItems, setOfferItems, selectItemForOffer, updateOfferItem
}: Props) {

  return (
    <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
      <div className="flex justify-end items-center mb-6">
        <div className="text-sm text-gray-500"><span className="text-red-500">*</span> Required</div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <InputFields
            type="text"
            value={promotion.itemName}
            label="Name"
            required={true}
            placeholder="Enter Name"
            onChange={e => setPromotion(s => ({ ...s, itemName: e.target.value }))}
            width="w-full"
          />
        </div>
        <div>
          <InputFields
            isSingle={true}
            options={[{ label: "Range", value: "range" }, { label: "Slab", value: "slab" }, { label: "Normal", value: "normal" }]}
            value={promotion.bundle_combination}
            label="Mode"
            required={true}
            onChange={e => {
              const val = e.target.value;
              setPromotion(s => ({ ...s, bundle_combination: val }));
              setPercentageDiscounts([{ key: "", percentage: "", idx: "0" }]);
              if (val !== "range") {
                setOrderTables(tables => tables.map(arr => [arr[0]]));
              }
            }}
            width="w-full"
          />
        </div>
        <div>
          <InputFields
            type="date"
            label="Start Date"
            required={true}
            value={promotion.startDate}
            max={promotion.endDate}
            onChange={e => setPromotion(s => ({ ...s, startDate: e.target.value }))}
            width="w-full"
          />
        </div>
        <div>
          <InputFields
            required={true}
            label="End Date"
            type="date"
            value={promotion.endDate}
            min={promotion.startDate}
            onChange={e => setPromotion(s => ({ ...s, endDate: e.target.value }))}
            width="w-full"
          />
        </div>

        <div>
          <InputFields
            isSingle={false}
            required={true}
            options={salesmanTypeOptions.map((o: any) => ({ ...o, value: String(o.value) }))}
            value={Array.isArray(promotion.salesTeamType) ? promotion.salesTeamType : (promotion.salesTeamType ? [String(promotion.salesTeamType)] : [])}
            placeholder="Sales Team Type"
            label="Sales Team Type"
            onChange={e => {
              const val = e.target.value;
              let selectedValues: string[];
              if (Array.isArray(val)) {
                selectedValues = val;
              } else {
                selectedValues = val ? [String(val)] : [];
              }
              setPromotion(s => ({
                ...s,
                salesTeamType: selectedValues,
                projectList: selectedValues.includes("6") ? s.projectList : []
              }))
            }}
            width="w-full"
          />
        </div>
        {(Array.isArray(promotion.salesTeamType) ? promotion.salesTeamType : [promotion.salesTeamType]).includes("6") && (
          <div>
            <InputFields
              placeholder=""
              required={true}
              label="Project List"
              isSingle={false}
              options={projectOptions.map((o: any) => ({ ...o, value: String(o.value) }))}
              value={Array.isArray(promotion.projectList) ? promotion.projectList : (promotion.projectList ? [String(promotion.projectList)] : [])}
              onChange={e => {
                const val = e.target.value;
                let selectedValues: string[];
                if (Array.isArray(val)) {
                  selectedValues = val;
                } else {
                  selectedValues = val ? [String(val)] : [];
                }
                setPromotion(s => ({ ...s, projectList: selectedValues }))
              }}
              width="w-full"
            />
          </div>
        )}
        {promotion.bundle_combination === "slab" && (
          <div>
            <InputFields
              required={true}
              label="Promotion Type"
              isSingle={true}
              options={[{ label: "Quantity", value: "quantity" }, { label: "Percentage", value: "percentage" },]}
              value={promotion.promotionType}
              onChange={e => {
                setPromotion(s => ({ ...s, promotionType: e.target.value }));
                setPercentageDiscounts([{ key: "", percentage: "", idx: "0" }]);
              }}
              width="w-full"
            />
          </div>
        )}
        <div>
          <InputFields
            required={true}
            label="Status"
            isSingle={true}
            options={[{ label: "Active", value: "1" }, { label: "Inactive", value: "0" }]}
            value={promotion.status}
            onChange={e => setPromotion(s => ({ ...s, status: e.target.value }))}
            width="w-full"
          />
        </div>
      </div>
      <div className="mt-8">
        <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="font-semibold text-lg">Promotional Order Item</div>
            <div className="text-sm text-gray-500"><span className="text-red-500">*</span> Required</div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-5">
            {((keyCombo.Item === "Item Category" && promotion.bundle_combination !== "slab") || keyCombo.Item === "Item") && (
              <>
                <div>
                  <InputFields
                    label="Item Category"
                    required={true}
                    multiSelectChips={true}
                    type="select"
                    isSingle={false}
                    searchable={true}
                    options={itemDropdownMap["Item Category"] ? [{ label: `Select Item Category`, value: "" }, ...itemDropdownMap["Item Category"]] : [{ label: `Select Item Category`, value: "" }]}
                    value={keyValue["Item Category"] || []}
                    onChange={e => {
                      const val = e.target.value;
                      let selectedValues: string[];
                      if (Array.isArray(val)) {
                        selectedValues = val;
                      } else {
                        selectedValues = val ? [String(val)] : [];
                      }
                      setKeyValue(s => ({ ...s, "Item Category": selectedValues.filter(v => v !== "") }));
                    }}
                    width="w-full"
                  />
                </div>
              </>
            )}
            {keyCombo.Item === "Item" && promotion.bundle_combination !== "slab" && (
              <div>
                <InputFields
                  label="Item"
                  required={true}
                  searchable={true}
                  multiSelectChips={true}
                  type="select"
                  isSingle={false}
                  options={itemDropdownMap["Item"] ? [{ label: `Select Item`, value: "" }, ...itemDropdownMap["Item"]] : [{ label: `Select Item`, value: "" }]}
                  value={keyValue["Item"] || []}
                  showSkeleton={itemLoading}
                  onChange={e => {
                    const val = e.target.value;
                    let selectedValues: string[];
                    if (Array.isArray(val)) {
                      selectedValues = val;
                    } else {
                      selectedValues = val ? [String(val)] : [];
                    }
                    setKeyValue(s => ({ ...s, "Item": selectedValues.filter(v => v !== "") }));
                  }}
                  width="w-full"
                />
              </div>
            )}

            <div>
              <InputFields
                label="UOM"
                type="select"
                required={true}
                isSingle={true}
                placeholder="Select UOM"
                options={uomOptions}
                value={selectedUom}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedUom(val);
                }}
                width="w-full"
              />
            </div>
          </div>
          <OrderItemsTable 
            orderTables={orderTables} 
            setOrderTables={setOrderTables} 
            updateOrderItem={updateOrderItem} 
            promotion={promotion} 
          />
          
          {(promotion.promotionType === "percentage" || (promotion.bundle_combination === "slab" && promotion.promotionType === "quantity")) && (
            <PercentageDiscountTable 
              percentageDiscounts={percentageDiscounts} 
              setPercentageDiscounts={setPercentageDiscounts} 
              promotion={promotion} 
              keyCombo={keyCombo} 
              itemDropdownMap={itemDropdownMap} 
            />
          )}

        </ContainerCard>

        <div className="flex justify-between items-center mb-4">
          <div className="font-semibold text-lg">Promotional Offer Items</div>
          <div className="text-sm text-gray-500"><span className="text-red-500">*</span> Required</div>
        </div>
        
        <OfferItemsTable 
          offerItems={offerItems} 
          setOfferItems={setOfferItems} 
          selectItemForOffer={selectItemForOffer} 
          updateOfferItem={updateOfferItem} 
          itemOptions={itemOptions} 
          uomOptions={uomOptions} 
          itemLoading={itemLoading} 
        />
      </div>
    </ContainerCard>
  );
}
