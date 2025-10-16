
"use client";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { itemList,addPricingDetail } from "@/app/services/allApi";
import SelectKeyCombination from "./selectKeyCombination";
import InputFields from "@/app/components/inputFields";
import Table from "@/app/components/customTable";
import { useRouter } from "next/navigation";
import * as yup from "yup";

export default function AddPricing() {
  const { itemOptions,companyOptions,regionOptions,warehouseOptions,areaOptions,routeOptions,customerTypeOptions,channelOptions,customerCategoryOptions,companyCustomersOptions,itemCategoryOptions } = useAllDropdownListData();
  const steps: StepperStep[] = [
    { id: 1, label: "Key Combination" },
    { id: 2, label: "Key Value" },
    { id: 3, label: "Pricing" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep
  } = useStepperForm(steps.length);
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const isEditMode = id !== undefined && id !== "add";
  const [loading, setLoading] = useState(false);
  const validateStep = (step: number) => {
    if (step === 1) {
      return (
        keyCombo.Location.length > 0 &&
        keyCombo.Customer.length > 0 &&
        keyCombo.Item.length > 0
      );
    }
    if (step === 2) {
      if (keyCombo.Location.includes("Route") && !keyValue.Route) return false;
      if (keyCombo.Customer.includes("Sales Organisation") && !keyValue.SalesOrganisation) return false;
      if (keyCombo.Customer.includes("Sub Channel") && !keyValue.SubChannel) return false;
      if (keyCombo.Item.includes("Item Group") && !keyValue.ItemGroup) return false;
      return true;
    }
    if (step === 3) {
      return promotion.itemName && promotion.startDate && promotion.endDate;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      showSnackbar("Please fill in all required fields before proceeding.", "warning");
      return;
    }
    markStepCompleted(currentStep);
    if (!isLastStep) {
      nextStep();
    }
  };

  const router = useRouter();
  const pricingValidationSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    start_date: yup.string().required("Start date is required"),
    end_date: yup.string().required("End date is required"),
    item: yup.array().of(yup.string()).min(1, "At least one item is required"),
    key: yup.object({
      Location: yup.array().of(yup.string()).min(1, "Location key required"),
      Customer: yup.array().of(yup.string()).min(1, "Customer key required"),
      Item: yup.array().of(yup.string()).min(1, "Item key required"),
    })
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearErrors = () => setErrors({});

  const handleSubmit = async () => {
    clearErrors();
        const initialKeys = [
          {
            type: "Location",
            options: [
              { id: "1", label: "Company", isSelected: false },
              { id: "2", label: "Region", isSelected: false },
              { id: "3", label: "Warehouse", isSelected: false },
              { id: "4", label: "Area", isSelected: false },
              { id: "5", label: "Route", isSelected: false },
            ],
          },
          {
            type: "Customer",
            options: [
              { id: "6", label: "Customer Type", isSelected: false },
              { id: "7", label: "Channel", isSelected: false },
              { id: "8", label: "Customer Category", isSelected: false },
              { id: "9", label: "Customer", isSelected: false },
            ],
          },
          {
            type: "Item",
            options: [
              { id: "10", label: "Item Category", isSelected: false },
              { id: "11", label: "Item", isSelected: false },
            ],
          },
        ];
        function getKeyIds(type: string, selectedLabels: string[]): number[] {
  const group = initialKeys.find(g => g.type === type);
  if (!group) return [];
  return selectedLabels.map((label: string) => {
    const found = group.options.find(opt => opt.label === label);
    // Convert both the found id and label to a number
    return found ? Number(found.id) : Number(label);
  });
}


        // Flatten all selected key ids into a single array for description
        const description = [
          ...getKeyIds("Location", keyCombo.Location),
          ...getKeyIds("Customer", keyCombo.Customer),
          ...getKeyIds("Item", keyCombo.Item)
        ];

        // Use selected item ids from keyValue["Item"] for item and pricing
        const selectedItemIds = keyValue["Item"] || [];
        const payload = {
  name: promotion.itemName,
  description, // adjust this as needed
  start_date: promotion.startDate,
  end_date: promotion.endDate,
  apply_on: 1, // static/mapped as per requirement
  warehouse_id: "100", // static, change as needed
  status: promotion.status, // or fix to 1 if static
  company_id: "110", // static, change as needed
  region_id: "1", // static, change as needed
  area_id: "1", // static, change as needed
  route_id: "50", // static, change as needed
  item_category_id: "3", // static, change as needed
  item_id: selectedItemIds.join(","), // comma-separated string of IDs
  customer_id: "60", // static, change as needed
  customer_category_id: "1", // static, change as needed
  outlet_channel_id: "36", // static, change as needed
  details: selectedItemIds.map(itemId => {
    // Find the matching item data
    let itemData = selectedItemDetails.find(item => String(item.code || item.itemCode) === String(itemId));
    if (!itemData) {
      itemData = itemOptions.find(opt => String(opt.value) === String(itemId));
    }
    // Determine the item code and name
    const itemCode = Number(itemId);
    const itemName = itemData?.name || itemData?.label || "";
    // Find the order item for prices
    const orderItem = promotion.orderItems.find(oi => String(oi.itemCode) === String(itemCode));
    return {
      name: itemName,
      item_id: itemCode,
      // buom_ctn_price: orderItem?.buom_ctn_price ?? orderItem?.price ?? 0,
      // auom_pc_price: orderItem?.auom_pc_price ?? 0, // fallback/defaults as needed
      status: 1 // static, or dynamic if needed
    };
  })
};

    try {
      await pricingValidationSchema.validate(payload, { abortEarly: false });
      setLoading(true);
      const res = await addPricingDetail(payload);
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit pricing", "error");
      } else {
        showSnackbar(isEditMode ? "Pricing updated successfully" : "Pricing added successfully", "success");
        router.push("/pricing");
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err && typeof err === "object" && "name" in err && err.name === "ValidationError" && Array.isArray((err as yup.ValidationError).inner)) {
        const formErrors: Record<string, string> = {};
        (err as yup.ValidationError).inner.forEach((e: yup.ValidationError) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
        showSnackbar("Please fix validation errors before proceeding", "error");
      } else {
        showSnackbar(isEditMode ? "Failed to update pricing" : "Failed to add pricing", "error");
      }
    }
  };

  type KeyComboType = {
    Location: string[];
    Customer: string[];
    Item: string[];
  };

  const [keyCombo, setKeyCombo] = useState<KeyComboType>({
    Location: [],
    Customer: [],
    Item: [],
  });
  
  const [keyValue, setKeyValue] = useState<Record<string, string[]>>({});
  const [promotion, setPromotion] = useState({
    itemName: "",
    startDate: "",
    endDate: "",
    status: "active", 
    orderType: "All",
    offerType: "All",
    type: "Slab",
    discountType: "Fixed",
    discountApplyOn: "Quantity",
    bundle: false,
    orderItems: [
      { itemName: "", itemCode: "", quantity: "", toQuantity: "", uom: "CTN", price: "" },
    ],
    offerItems: [
      { itemName: "", uom: "BAG", quantity: "" },
    ],
  });

  type ItemDetail = {
    code?: string;
    itemCode?: string;
    name?: string;
    itemName?: string;
    label?: string;
    [key: string]: unknown;
  };
  const [selectedItemDetails, setSelectedItemDetails] = useState<ItemDetail[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  useEffect(() => {
    if (keyValue["Item"] && keyValue["Item"].length > 0) {
      itemList({ ids: keyValue["Item"] })
        .then(data => {
          let items: ItemDetail[] = [];
          if (Array.isArray(data)) {
            items = data as ItemDetail[];
          } else if (data && typeof data === "object" && Array.isArray(data.data)) {
            items = data.data as ItemDetail[];
          }
          setSelectedItemDetails(items);
          
         
        })
        .catch(err => {
          console.error("Failed to fetch item details", err);});
    } else {
      setSelectedItemDetails([]);
    }
  }, [keyValue["Item"]]);


  const renderStepContent = () => {
  switch (currentStep) {
    case 1:
      return <SelectKeyCombination keyCombo={keyCombo} setKeyCombo={setKeyCombo} />;
    case 2:
      type DropdownOption = { label: string; value: string };
      const locationDropdownMap: Record<string, DropdownOption[]> = {
        Company: companyOptions,
        Region: regionOptions,
        Warehouse: warehouseOptions,
        Area: areaOptions,
        Route: routeOptions,
      };
      const customerDropdownMap: Record<string, DropdownOption[]> = {
        "Customer Type": customerTypeOptions,
        Channel: channelOptions,
        "Customer Category": customerCategoryOptions,
        Customer: companyCustomersOptions,
      };
      const itemDropdownMap: Record<string, DropdownOption[]> = {
        "Item Category": itemCategoryOptions,
        Item: itemOptions,
      };
      return (
        <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
          <h2 className="text-xl font-semibold mb-6">Key Value</h2>
          <div className="flex gap-6">
            <div className="flex-1">
              <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
                <div className="font-semibold text-lg mb-4">Location</div>
                {keyCombo.Location.map((locKey) => (
                  <div key={locKey} className="mb-4">
                    <div className="mb-2 text-base font-medium">{locKey}</div>
                    <InputFields
                      label=""
                      type="select"
                      isSingle={false}
                      options={locationDropdownMap[locKey] ? [{ label: `Select ${locKey}`, value: "" }, ...locationDropdownMap[locKey]] : [{ label: `Select ${locKey}`, value: "" }]}
                      value={keyValue[locKey] || []}
                      onChange={e => setKeyValue(s => ({ ...s, [locKey]: Array.isArray(e.target.value) ? e.target.value : [] }))}
                      width="w-full"
                    />
                  </div>
                ))}
              </ContainerCard>
            </div>
            <div className="flex-1">
              <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
                <div className="font-semibold text-lg mb-4">Customer</div>
                {keyCombo.Customer.map((custKey) => (
                  <div key={custKey} className="mb-4">
                    <div className="mb-2 text-base font-medium">{custKey}</div>
                    <InputFields
                      label=""
                      type="select"
                      isSingle={false}
                      options={customerDropdownMap[custKey] ? [{ label: `Select ${custKey}`, value: "" }, ...customerDropdownMap[custKey]] : [{ label: `Select ${custKey}`, value: "" }]}
                      value={keyValue[custKey] || []}
                      onChange={e => setKeyValue(s => ({ ...s, [custKey]: Array.isArray(e.target.value) ? e.target.value : [] }))}
                      width="w-full"
                    />
                  </div>
                ))}
              </ContainerCard>
            </div>
            <div className="flex-1">
              <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
                <div className="font-semibold text-lg mb-4">Item</div>
                {keyCombo.Item.map((itemKey) => (
                  <div key={itemKey} className="mb-4">
                    <div className="mb-2 text-base font-medium">{itemKey}</div>
                    <InputFields
                      label=""
                      type="select"
                      isSingle={false}
                      options={itemDropdownMap[itemKey] ? [{ label: `Select ${itemKey}`, value: "" }, ...itemDropdownMap[itemKey]] : [{ label: `Select ${itemKey}`, value: "" }]}
                      value={keyValue[itemKey] || []}
                      onChange={e => setKeyValue(s => ({ ...s, [itemKey]: Array.isArray(e.target.value) ? e.target.value : [] }))}
                      width="w-full"
                    />
                  </div>
                ))}
              </ContainerCard>
            </div>
          </div>
        </ContainerCard>
      );
    case 3:
      const itemsData = (keyValue["Item"] || []).map((itemId, idx) => {
        let itemData = selectedItemDetails.find(
          item => String(item.code || item.itemCode) === String(itemId)
        );
        if (!itemData) {
          itemData = itemOptions.find(opt => String(opt.value) === String(itemId));
        }
        let itemCode = "-";
        if (itemData) {
          if (itemData.code) itemCode = itemData.code;
          else if (itemData.itemCode) itemCode = itemData.itemCode;
          else if (itemData.label) {
            const labelParts = String(itemData.label).split(" - ");
            itemCode = labelParts.length > 1 ? labelParts[0] : String(itemData.label);
          }
        } else {
          itemCode = String(itemId);
        }
        let itemName = "-";
        if (itemData) {
          if (itemData.name) itemName = itemData.name;
          else if (itemData.itemName) itemName = itemData.itemName;
          else if (itemData.label) {
            const labelParts = String(itemData.label).split(" - ");
            itemName = labelParts.length > 1 ? labelParts.slice(1).join(" - ") : labelParts[0];
          }
        }
        const price = promotion.orderItems.find(oi => oi.itemCode === itemCode)?.price || "";
        return {
          itemName,
          itemCode,
          price,
          idx: String(idx),
        };
      });

      const totalPages = Math.ceil(itemsData.length / pageSize);
      const paginatedData = itemsData.slice((page - 1) * pageSize, page * pageSize);
      type PaginationBtnProps = {
        label: string;
        isActive: boolean;
        onClick: () => void;
      };
      const PaginationBtn = ({ label, isActive, onClick }: PaginationBtnProps) => (
        <button
          className={`w-[32px] h-[32px] rounded-[6px] flex items-center justify-center mx-[2px] text-[14px] font-semibold transition-colors duration-150 border-none outline-none focus:ring-2 focus:ring-[#EA0A2A] select-none ${
            isActive ? "bg-[#FFF0F2] text-[#EA0A2A] shadow-sm" : "bg-white text-[#717680] hover:bg-[#F5F5F5]"
          }`}
          style={{ minWidth: 32 }}
          onClick={onClick}
          disabled={label === "..."}
        >
          {label}
        </button>
      );
      const firstThreePageIndices = [1, 2, 3];
      const lastThreePageIndices = totalPages > 3 ? [totalPages - 2, totalPages - 1, totalPages] : [];
      const renderPaginationBar = () => {
        if (totalPages <= 1) return null;
        return (
          <div className="flex justify-between items-center px-[8px] py-[12px] mt-2">
            <button
              className="flex items-center gap-1 px-4 py-2 rounded bg-[#F5F5F5] text-[#717680] font-semibold disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <span className="text-[16px]">←</span>
              Previous
            </button>
            <div className="flex gap-[2px] text-[14px] select-none">
              {totalPages > 6 ? (
                <>
                  {firstThreePageIndices.map((pageNo) => (
                    <PaginationBtn
                      key={pageNo}
                      label={pageNo.toString()}
                      isActive={page === pageNo}
                      onClick={() => setPage(pageNo)}
                    />
                  ))}
                  <PaginationBtn label={"..."} isActive={false} onClick={() => {}} />
                  {lastThreePageIndices.map((pageNo) => (
                    <PaginationBtn
                      key={pageNo}
                      label={pageNo.toString()}
                      isActive={page === pageNo}
                      onClick={() => setPage(pageNo)}
                    />
                  ))}
                </>
              ) : (
                <>
                  {[...Array(totalPages)].map((_, idx) => (
                    <PaginationBtn
                      key={idx + 1}
                      label={(idx + 1).toString()}
                      isActive={page === idx + 1}
                      onClick={() => setPage(idx + 1)}
                    />
                  ))}
                </>
              )}
            </div>
            <button
              className="flex items-center gap-1 px-4 py-2 rounded bg-[#F5F5F5] text-[#717680] font-semibold disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
              <span className="text-[16px]">→</span>
            </button>
          </div>
        );
      };

      return (
        <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
          <h2 className="text-xl font-semibold mb-6">Pricing</h2>
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block mb-2 font-medium">Name<span className="text-red-500 ml-1">*</span></label>
              <InputFields
                label=""
                type="text"
                value={promotion.itemName}
                onChange={e => setPromotion(s => ({ ...s, itemName: e.target.value }))}
                width="w-full"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Start Date<span className="text-red-500 ml-1">*</span></label>
              <InputFields
                label=""
                type="date"
                value={promotion.startDate}
                onChange={e => setPromotion(s => ({ ...s, startDate: e.target.value }))}
                width="w-full"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">End Date<span className="text-red-500 ml-1">*</span></label>
              <InputFields
                label=""
                type="date"
                value={promotion.endDate}
                onChange={e => setPromotion(s => ({ ...s, endDate: e.target.value }))}
                width="w-full"
              />
            </div>
              <div>
                <label className="block mb-2 font-medium">Status<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  label=""
                  type="radio"
                  isSingle={true}
                  options={[{ label: "Active", value: "1" }, { label: "Inactive", value: "0" }]}
                  value={promotion.status}
                  onChange={e => setPromotion(s => ({ ...s, status: e.target.value }))}
                  width="w-full"
                />
              </div>
          </div>
          <div className="mt-8">
            <div className="font-semibold text-lg mb-4">Items</div>
            <div className="mb-6">
              <Table
                data={paginatedData}
                config={{
                  columns: [
                    {
                      key: "itemCode",
                      label: "Item Code",
                      render: (row) => (
                        <span className="text-[14px]">{row.itemCode || "-"}</span>
                      ),
                    },
                    {
                      key: "itemName",
                      label: "Item Name",
                      render: (row) => (
                        <span className="font-semibold text-[#181D27] text-[14px]">{row.itemName || "-"}</span>
                      ),
                    },
                    {
                        key: "price",
                        label: "Price",
                        render: (row) => (
                          <InputFields
                            label=""
                            type="text"
                            value={row.price}
                            onChange={e => {
                              const val = e.target.value;
                              setPromotion(s => {
                                let arr = [...s.orderItems];
                                const idxFound = arr.findIndex(
                                  oi => oi.itemCode === row.itemCode
                                );
                                if (idxFound !== -1) {
                                  arr[idxFound] = { ...arr[idxFound], price: val };
                                } else {
                                  arr.push({ itemName: row.itemName, itemCode: row.itemCode, quantity: "", toQuantity: "", uom: "CTN", price: val });
                                }
                                // Remove any orderItems not in current itemsData
                                const validCodes = (keyValue["Item"] || []).map(itemId => {
                                  let itemData = selectedItemDetails.find(
                                    item => String(item.code || item.itemCode) === String(itemId)
                                  );
                                  if (!itemData) {
                                    itemData = itemOptions.find(opt => String(opt.value) === String(itemId));
                                  }
                                  if (itemData) {
                                    if (itemData.code) return itemData.code;
                                    if (itemData.itemCode) return itemData.itemCode;
                                    if (itemData.label) {
                                      const labelParts = String(itemData.label).split(" - ");
                                      return labelParts.length > 1 ? labelParts[0] : String(itemData.label);
                                    }
                                  }
                                  return String(itemId);
                                });
                                arr = arr.filter(oi => validCodes.includes(oi.itemCode));
                                return { ...s, orderItems: arr };
                              });
                            }}
                            width="w-full"
                          />
                        ),
                      },

                  ],
                  pageSize,
                }}
              />
              {itemsData.length > pageSize && renderPaginationBar()}
            </div>

          </div>

        </ContainerCard>
      );
    default:
      return null;
  }
};

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href="/pricing">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? "Edit Pricing" : "Add Pricing"}
        </h1>
      </div>
      <div className="flex justify-between items-center mb-6">
        <StepperForm
          steps={steps.map(step => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
          currentStep={currentStep}
          onStepClick={() => {}}
          onBack={prevStep}
          onNext={handleNext}
          onSubmit={handleSubmit}
          showSubmitButton={isLastStep}
          showNextButton={!isLastStep}
          nextButtonText="Save & Next"
          submitButtonText={isEditMode ? "Update" : "Submit"}
        >
          {renderStepContent()}
        </StepperForm>
      </div>
    </>
  );
}
