"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState } from "react";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import SettingPopUp from "@/app/components/settingPopUp";
import IconButton from "@/app/components/iconButton";
export default function Route() {
  const [isOpen, setIsOpen] = useState(false);
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [sapId, setSapId] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemSubCategory, setSubItemCategory] = useState("");
  const [itemGroup, setItemGroup] = useState("");
  const [itemUpc, setItemUpc] = useState("");
  const [itemUom, setItemUom] = useState("");
  const [itemBasePrice, setItemBasePrice] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [exciseCode, setExciseCode] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [status, setStatus] = useState("");


  return (
    <>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/master/item">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add New Item
          </h1>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">

          {/* Route Details */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Item Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-end gap-2 max-w-[406px]">
                <InputFields
                  label="Item Code"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                />

                <IconButton bgClass="white" className="mb-2 cursor-pointer text-[#252B37]"
                  icon="mi:settings"
                  onClick={() => setIsOpen(true)}
                />

                <SettingPopUp
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  title="Item Code"
                />
              </div>


              <div>
                <InputFields
                  label="SAP Id"
                  value={sapId}
                  onChange={(e) => setSapId(e.target.value)}
                />
              </div>
              <div>
                <InputFields
                  label="HSN Code"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                />
              </div>
              <div>
                <InputFields
                  label="Excise Code"
                  value={exciseCode}
                  onChange={(e) => setExciseCode(e.target.value)}
                />
              </div>
              <div>
                <InputFields
                  label="Item Name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>
              <div>
                <InputFields
                  label="Item Base Price"
                  value={itemBasePrice}
                  onChange={(e) => setItemBasePrice(e.target.value)}
                />
              </div>

            </div>
          </div>
        </div>
        {/* Location Information */}
        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Location Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  label="Item Category"
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  options={[
                    { value: "cat1", label: "Category A" },
                    { value: "cat2", label: "Category B" },
                    { value: "cat3", label: "Category C" },
                  ]}
                />
              </div>
              <div>
                <InputFields
                  label="Item Sub Category"
                  value={itemSubCategory}
                  onChange={(e) => setSubItemCategory(e.target.value)}
                  options={[
                    { value: "cat1", label: "Sub Category A" },
                    { value: "cat2", label: "Sub Category B" },
                    { value: "cat3", label: "Sub Category C" },
                  ]}
                />
              </div>
              <div>
                <InputFields
                  label="Item Group"
                  value={itemGroup}
                  onChange={(e) => setItemGroup(e.target.value)}
                  options={[
                    { value: "grp1", label: "Group 1" },
                    { value: "grp2", label: "Group 2" },
                    { value: "grp3", label: "Group 3" },
                  ]}
                />
              </div>
              <div>
                <InputFields
                  label="Item UOM"
                  value={itemUom}
                  onChange={(e) => setItemUom(e.target.value)}
                  options={[
                    { value: "uom1", label: "Uom 1" },
                    { value: "uom2", label: "Uom 2" },
                    { value: "uom3", label: "Uom 3" },
                  ]}
                />
              </div>

            </div>
          </div>
        </div>
        {/* Additional Information */}
        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 ">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  label="Item Description"
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                />
              </div>
              <div>
                <InputFields
                  label="Item UPC"
                  value={itemUpc}
                  onChange={(e) => setItemUpc(e.target.value)}
                />
              </div>
              <div>
                <InputFields
                  label="Shelf Life"
                  value={shelfLife}
                  onChange={(e) => setShelfLife(e.target.value)}
                />
              </div>
              <div>
                <InputFields
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "In Active" },
                  ]}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6  pr-0">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <SidebarBtn
            label="Submit"
            isActive={true}
            leadingIcon="mdi:check"   // checkmark icon
            onClick={() => console.log("Form submitted ✅")} />
        </div>
      </div>

    </>
  );
}