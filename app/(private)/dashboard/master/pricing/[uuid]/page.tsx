
"use client";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import SelectKeyCombination from "./selectKeyCombination";
import InputFields from "@/app/components/inputFields";
import Table from "@/app/components/customTable";

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

  // Stepper Navigation and Submission Logic
  const [stepCompleted, setStepCompleted] = useState([false, false, false]);
  const [currentStepState, setCurrentStepState] = useState(1); // 1-based

  // Functions must be inside the component to access state
  const validateStep = (step: number) => {
    if (step === 1) {
      // Require at least one key selected in each section
      return (
        keyCombo.Location.length > 0 &&
        keyCombo.Customer.length > 0 &&
        keyCombo.Item.length > 0
      );
    }
    if (step === 2) {
      // If a key is selected, its value must be selected
      if (keyCombo.Location.includes("Route") && !keyValue.Route) return false;
      if (keyCombo.Customer.includes("Sales Organisation") && !keyValue.SalesOrganisation) return false;
      if (keyCombo.Customer.includes("Sub Channel") && !keyValue.SubChannel) return false;
      if (keyCombo.Item.includes("Item Group") && !keyValue.ItemGroup) return false;
      return true;
    }
    if (step === 3) {
      // Minimal: require itemName, startDate, endDate
      return promotion.itemName && promotion.startDate && promotion.endDate;
    }
    return true;
  };

  const handleNext = () => {
    console.log("Validating Step:", currentStepState);
    if(currentStepState === 1) {
      setCurrentStepState(2);
      setStepCompleted((prev) => {
        const arr = [...prev];
        arr[currentStepState - 1] = true;
        return arr;
      });
      return;
    };
    if (!validateStep(currentStepState)) {
      showSnackbar("Please fill in all required fields before proceeding.", "warning");
      return;
    }
    setStepCompleted((prev) => {
      const arr = [...prev];
      arr[currentStepState - 1] = true;
      return arr;
    });
    if (currentStepState < 3) {
      setCurrentStepState(currentStepState + 1);
    }
  };

  const handleSubmit = () => {
    if (!validateStep(3)) {
      showSnackbar("Please fill in all required fields before submitting.", "error");
      return;
    }
    showSnackbar("Promotion submitted! (implement API call)", "success");
  };

  // Step 1: Key Combination
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
  
  // Use Record<string, string> so we can dynamically store values for any selected key
  const [keyValue, setKeyValue] = useState<Record<string, string>>({});

  // Step 3: Promotion
  const [promotion, setPromotion] = useState({
    itemName: "",
    startDate: "",
    endDate: "",
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

  const keyOptions = {
    Location: ["Company", "Region","Warehouse", "Area", "Route"],
    Customer: ["Customer Type", "Channel", "Customer Categor", "Customer"],
    Item: [ "Item Category", "Item"],
  };

    const renderStepContent = () => {
    switch (currentStepState) {
      case 1:
        // Step 1: Key Combination (custom component)
        return <SelectKeyCombination setKeyCombo={setKeyCombo} />;
      case 2:
        // ...existing dropdown mapping code...
        const locationDropdownMap: Record<string, any[]> = {
          Company: companyOptions,
          Region: regionOptions,
          Warehouse: warehouseOptions,
          Area: areaOptions,
          Route: routeOptions,
        };
        const customerDropdownMap: Record<string, any[]> = {
          "Customer Type": customerTypeOptions,
          Channel: channelOptions,
          "Customer Category": customerCategoryOptions,
          Customer: companyCustomersOptions,
        };
        const itemDropdownMap: Record<string, any[]> = {
          "Item Category": itemCategoryOptions,
          Item: itemOptions,
        };
        return (
          <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
            <h2 className="text-xl font-semibold mb-6">Key Value</h2>
            <div className="flex gap-6">
              {/* ...existing card code... */}
              <div className="flex-1">
                <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
                  <div className="font-semibold text-lg mb-4">Location</div>
                  {keyCombo.Location.map((locKey) => (
                    <div key={locKey} className="mb-4">
                      <div className="mb-2 text-base font-medium">{locKey}</div>
                      <InputFields
                        label=""
                        type="select"
                        options={locationDropdownMap[locKey] ? [{ label: `Select ${locKey}`, value: "" }, ...locationDropdownMap[locKey]] : [{ label: `Select ${locKey}`, value: "" }]}
                        value={keyValue[locKey] || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setKeyValue(s => ({ ...s, [locKey]: e.target.value }))}
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
                        options={customerDropdownMap[custKey] ? [{ label: `Select ${custKey}`, value: "" }, ...customerDropdownMap[custKey]] : [{ label: `Select ${custKey}`, value: "" }]}
                        value={keyValue[custKey] || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setKeyValue(s => ({ ...s, [custKey]: e.target.value }))}
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
                        options={itemDropdownMap[itemKey] ? [{ label: `Select ${itemKey}`, value: "" }, ...itemDropdownMap[itemKey]] : [{ label: `Select ${itemKey}`, value: "" }]}
                        value={keyValue[itemKey] || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setKeyValue(s => ({ ...s, [itemKey]: e.target.value }))}
                        width="w-full"
                      />
                    </div>
                  ))}
                </ContainerCard>
              </div>
            </div>
            {/* Action Buttons Row */}
            
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
            <h2 className="text-xl font-semibold mb-6">Promotion</h2>
            {/* ...existing promotion fields and tables... */}
            {/* Action Buttons Row */}
                        {/* Promotion Fields */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block mb-2 font-medium">Name</label>
                <InputFields
                  label=""
                  type="text"
                  value={promotion.itemName}
                  onChange={e => setPromotion(s => ({ ...s, itemName: e.target.value }))}
                  width="w-full"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Start Date</label>
                <InputFields
                  label=""
                  type="date"
                  value={promotion.startDate}
                  onChange={e => setPromotion(s => ({ ...s, startDate: e.target.value }))}
                  width="w-full"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">End Date</label>
                <InputFields
                  label=""
                  type="date"
                  value={promotion.endDate}
                  onChange={e => setPromotion(s => ({ ...s, endDate: e.target.value }))}
                  width="w-full"
                />
              </div>
            </div>
            
            {/* Items Section */}
            <div className="mt-8">
              <div className="font-semibold text-lg mb-4">Items</div>
              {/* Order Item Table using Table component */}
              <div className="mb-6">
                <Table
                  data={keyCombo.Item.map((itemKey, idx) => ({
                    itemName: itemKey,
                    itemCode: keyValue[itemKey] || "",
                    price: promotion.orderItems[idx]?.price || "",
                    idx: idx.toString(),
                  }))}
                  config={{
                    columns: [
                      {
                        key: "itemName",
                        label: "Item Name",
                        render: (row: any) => (
                          <span className="font-semibold text-[#181D27] text-[14px]">{row.itemName || "-"}</span>
                        ),
                      },
                      {
                        key: "itemCode",
                        label: "Item Code",
                        render: (row: any) => (
                          <span className="text-[14px]">{row.itemCode || "-"}</span>
                        ),
                      },
                      {
                        key: "price",
                        label: "Price",
                        render: (row: any) => (
                          <InputFields
                            label=""
                            type="text"
                            value={row.price}
                            onChange={e => {
                              const val = e.target.value;
                              setPromotion(s => {
                                const arr = [...s.orderItems];
                                // Ensure array length matches selected items
                                while (arr.length < keyCombo.Item.length) arr.push({ itemName: row.itemName, itemCode: row.itemCode, quantity: "", toQuantity: "", uom: "CTN", price: "" });
                                arr[parseInt(row.idx)].price = val;
                                return { ...s, orderItems: arr };
                              });
                            }}
                            width="w-full"
                          />
                        ),
                      },
                    ],
                    pageSize: 5,
                  }}
                />
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
        <Link href="/dashboard/master/pricing">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? "Edit Pricing" : "Add Pricing"}
        </h1>
      </div>
      <div className="flex justify-between items-center mb-6">
        <StepperForm
          steps={steps.map(step => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
          currentStep={currentStepState}
          onStepClick={() => {}}
          onBack={() => setCurrentStepState(currentStepState - 1)}
          onNext={handleNext}
          onSubmit={handleSubmit}
          showSubmitButton={currentStepState === steps.length}
          showNextButton={currentStepState < steps.length}
          nextButtonText="Save & Next"
          submitButtonText={isEditMode ? "Update" : "Submit"}
        >
          {renderStepContent()}
        </StepperForm>
      </div>
    </>
  );
}
