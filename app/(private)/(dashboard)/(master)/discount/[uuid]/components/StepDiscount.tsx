import React, { useState } from "react";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import Table from "@/app/components/customTable";
import { Icon } from "@iconify-icon/react";
import { DiscountState, KeyComboType } from "../types";

type Props = {

  discount: DiscountState;

  setDiscount: React.Dispatch<React.SetStateAction<DiscountState>>;

  salesmanTypeOptions: any[];

  projectOptions: any[];

  keyCombo: KeyComboType;

  itemDropdownMap: Record<string, any[]>;

  keyValue: Record<string, string[]>;

  setKeyValue: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;

  itemLoading: boolean;

};



export default function StepDiscount({

  discount,

  setDiscount,

  salesmanTypeOptions,

  projectOptions,

  keyCombo,

  itemDropdownMap,

  keyValue,

  setKeyValue,

  itemLoading

}: Props) {



  const isCategoryMode = keyCombo.Item === "Item Category";

  const dropdownLabel = isCategoryMode ? "Item Category" : "Item";

  // Determine options based on keyCombo.Item (if "Item Category" or "Item")

  const dropdownOptions = isCategoryMode



    ? (itemDropdownMap["Item Category"] ? [...itemDropdownMap["Item Category"]] : [])



    : (itemDropdownMap["Item"] ? [...itemDropdownMap["Item"]] : []);

  const getFilteredOptions = (currentKey: string) => {

    const selectedKeys = new Set(discount.discountItems.map(item => item.key).filter(k => k && k !== currentKey));

    return dropdownOptions.filter(option => !option.value || !selectedKeys.has(option.value));

  };

  const handleAddItem = () => {

    setDiscount(prev => ({

      ...prev,

      discountItems: [...prev.discountItems, { key: "", rate: "", idx: String(Math.random()) }]

    }));

  };



  const handleRemoveItem = (idx: string) => {

    setDiscount(prev => ({

      ...prev,

      discountItems: prev.discountItems.filter(item => item.idx !== idx)

    }));

  };



  const updateItem = (idx: string, field: string, value: string) => {

    setDiscount(prev => ({

      ...prev,

      discountItems: prev.discountItems.map(item =>

        item.idx === idx ? { ...item, [field]: value } : item

      )

    }));

  };



  // Check if "Project" (id "6") is selected in Sales Team

  const isProjectSelected = discount.salesTeam.includes("6");



  return (

    <div className="flex flex-col gap-6">



      {/* 1. Top Section (Grid) */}

      <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">

        <h2 className="text-xl font-semibold mb-6">General Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div>

            <InputFields

              required

              label="Name"

              value={discount.name}

              onChange={(e) => setDiscount(s => ({ ...s, name: e.target.value }))}

              placeholder="Enter Discount Name"

            />

          </div>

          <div>

            <InputFields

              required

              type="date"

              label="Start Date"

              value={discount.startDate}

              max={discount.endDate}

              onChange={(e) => setDiscount(s => ({ ...s, startDate: e.target.value }))}

            />

          </div>

          <div>

            <InputFields

              required

              type="date"

              label="End Date"

              value={discount.endDate}

              min={discount.startDate}

              onChange={(e) => setDiscount(s => ({ ...s, endDate: e.target.value }))}

            />

          </div>

          <div>

            <InputFields

              required

              label="Discount Type"

              type="select"

              isSingle={true}

              options={[{ label: "Amount", value: "Amount" }, { label: "Percentage", value: "Percentage" }]}

              value={discount.discountMethod}

              onChange={(e) => setDiscount(s => ({ ...s, discountMethod: e.target.value }))}

              placeholder="Select Method"

            />

          </div>

          <div >

            <InputFields

              required

              label="Sales Team"

              type="select"

              isSingle={false}

              options={salesmanTypeOptions}

              value={discount.salesTeam}

              onChange={(e) => {

                const val = e.target.value;

                const arr = Array.isArray(val) ? val : [val];

                setDiscount(s => ({

                  ...s,

                  salesTeam: arr,

                  // Clear projects if "6" is deselected

                  projects: arr.includes("6") ? s.projects : []

                }));

              }}

              placeholder="Select Sales Team"

            />

          </div>


          {/* Conditionally Render Project Team */}

          {isProjectSelected && (

            <div >

              <InputFields

                label="Project Team"

                type="select"

                isSingle={false}

                options={projectOptions}

                value={discount.projects}

                onChange={(e) => {

                  const val = e.target.value;

                  const arr = Array.isArray(val) ? val : [val];

                  setDiscount(s => ({ ...s, projects: arr }));

                }}

                placeholder="Select Project Team"

              />

            </div>

          )}
          <div>
            <InputFields
              required={true}
              label="Status"
              isSingle={true}
              options={[{ label: "Active", value: "1" }, { label: "Inactive", value: "0" }]}
              value={String(discount.status)}
              onChange={e => setDiscount(s => ({ ...s, status: e.target.value }))}
            />
          </div>

          <div>
            <InputFields
              required
              label="Discount Applied On"
              type="select"
              isSingle={true}
              options={[
                { label: "Header Level", value: "header" },
                { label: "Detail Level", value: "details" }
              ]}
              value={discount.scope}
              onChange={(e) => setDiscount(s => ({ ...s, scope: e.target.value as "header" | "details" }))}
              placeholder="Select Discount Applied On"
            />
          </div>
        </div>

      </ContainerCard>


      {/* 2. Scope Switch */}
      <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
        <h2 className="text-xl font-semibold mb-6">
          {discount.scope === "header" ? "Header Level" : "Detail Level"}
        </h2>

        {/* 3. Dynamic View */}

        {discount.scope === "header" ? (

          <div className="max-w-md flex flex-col gap-4">

            <InputFields

              label="Order Amount"

              type="number"

              value={discount.header.headerMinAmount}

              onChange={(e) => setDiscount(s => ({ ...s, header: { ...s.header, headerMinAmount: e.target.value } }))}

              placeholder="Enter Order Amount"

              className="text-lg"

            />

            {discount.discountMethod === "Percentage" ? (

              <InputFields

                label="Percentage"

                type="number"

                max={100}

                value={discount.header.headerRate}

                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= 100) {
                    setDiscount(s => ({ ...s, header: { ...s.header, headerRate: e.target.value } }));
                  }
                }}

                placeholder="Enter Percentage"

                className="text-lg"

                trailingElement={<span className="text-gray-500 font-semibold">%</span>}

              />

            ) : (

              <InputFields

                label="Discount Amount"

                type="number"

                value={discount.header.headerRate}

                onChange={(e) => setDiscount(s => ({ ...s, header: { ...s.header, headerRate: e.target.value } }))}

                placeholder="Enter Discount Amount"

                className="text-lg"

              />

            )}

          </div>

        ) : (

          <div>

            {/* Filter items by Category if in Item mode (Slab style) */}

            {keyCombo.Item === "Item" && (

              <div className="mb-4 max-w-md">

                <InputFields

                  required
                  multiSelectChips={true}
                  searchable={true}

                  label="Category"

                  type="select"

                  isSingle={false}

                  options={itemDropdownMap["Item Category"] || []}

                  value={keyValue["Item Category"] || []}

                  onChange={e => {

                    const val = e.target.value;

                    const arr = Array.isArray(val) ? val : [val];

                    setKeyValue(prev => ({ ...prev, "Item Category": arr }));

                  }}

                  placeholder="Select Category"

                />

              </div>

            )}



            <Table

              data={discount.discountItems}

              config={{


                showNestedLoading: false,
                columns: [
                  {
                    key: "key",
                    label: (<span>{dropdownLabel}<span className="text-red-500 ml-1">*</span></span>),
                    width: 250,
                    render: (row: any) => (
                      <InputFields
                        type="select"
                        isSingle={true}
                        searchable={true}
                        showSkeleton={itemLoading}
                        options={getFilteredOptions(row.key)}
                        value={row.key}
                        onChange={(e) => updateItem(row.idx, "key", e.target.value)}
                        placeholder={`Select ${dropdownLabel}`}
                      />
                    )
                  },
                  {
                    key: "rate",
                    label: (<span>{discount.discountMethod === "Percentage" ? "Rate (%)" : "Amount"}<span className="text-red-500 ml-1">*</span></span>),
                    width: 170,
                    render: (row: any) => (
                      <InputFields
                        type="number"
                        max={discount.discountMethod === "Percentage" ? 100 : undefined}
                        value={row.rate}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (discount.discountMethod !== "Percentage" || val <= 100) {
                            updateItem(row.idx, "rate", e.target.value);
                          }
                        }}
                        placeholder="0.00"
                        trailingElement={discount.discountMethod === "Percentage" ? <span className="text-gray-500 font-semibold">%</span> : undefined}
                      />
                    )
                  }, {
                    key: "empty",
                    label: "",
                    width: 100, // Small width for visual spacing
                    render: () => null, // Renders nothing
                  }, {
                    key: "action",
                    label: "Action",
                    width: 50,
                    render: (row: any) => (
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                        onClick={() => handleRemoveItem(row.idx)}
                        disabled={discount.discountItems.length <= 1}
                      >
                        <Icon icon="lucide:trash-2" width={20} />
                      </button>
                    )
                  },
                ],
                pageSize: 10
              }}
            />
            <div className="mt-4">
              <button
                type="button"
                className="text-[#E53935] font-medium text-[16px] flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                onClick={handleAddItem}
              >
                <Icon icon="material-symbols:add-circle-outline" width={20} />
                Add Row
              </button>
            </div>
          </div>
        )}
      </ContainerCard>
    </div>
  );
}
