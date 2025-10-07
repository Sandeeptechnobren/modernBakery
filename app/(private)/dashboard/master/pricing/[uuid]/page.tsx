
"use client";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import CustomCheckbox from "@/app/components/customCheckbox";
import SelectKeyCombination from "./selectKeyCombination";

export default function AddPricing() {
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
  
  const [keyValue, setKeyValue] = useState({
    Route: "",
    SalesOrganisation: "",
    SubChannel: "",
    ItemGroup: "",
  });

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
      { itemName: "", quantity: "", toQuantity: "", uom: "CTN", price: "" },
    ],
    offerItems: [
      { itemName: "", uom: "BAG", quantity: "" },
    ],
  });

  const keyOptions = {
    Location: ["Country", "Region", "Area", "Route"],
    Customer: ["Sales Organisation", "Channel", "Sub Channel", "Parent Customer", "Customer Category", "Customer"],
    Item: ["Major Category", "Item Group", "Item"],
  };

    const renderStepContent = () => {
    switch (currentStepState) {
      case 1:
        // Step 1: Key Combination (custom component)
        return <SelectKeyCombination setKeyCombo={setKeyCombo} />;
 
      case 2:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Key Value</h2>
            <div className="flex gap-8">
              {/* Location */}
              <div className="flex-1">
                {keyCombo.Location.includes("Route") && (
                  <ContainerCard className="mb-4 p-4">
                    <div className="font-medium mb-2">Route</div>
                    <div className="flex flex-col gap-2">
                      {["Route 1", "Route 2"].map((route) => (
                        <CustomCheckbox
                          key={route}
                          id={`route-checkbox-${route.replace(/\s+/g, "-").toLowerCase()}`}
                          label={route}
                          checked={keyValue.Route === route}
                          onChange={() => setKeyValue(s => ({ ...s, Route: s.Route === route ? "" : route }))}
                        />
                      ))}
                    </div>
                  </ContainerCard>
                )}
              </div>
              {/* Customer */}
              <div className="flex-1">
                {keyCombo.Customer.includes("Sales Organisation") && (
                  <ContainerCard className="mb-4 p-4">
                    <div className="font-medium mb-2">Sales Organisation</div>
                    <div className="flex flex-col gap-2">
                      {["Org 1", "Org 2"].map((org) => (
                        <CustomCheckbox
                          key={org}
                          id={`sales-org-checkbox-${org.replace(/\s+/g, "-").toLowerCase()}`}
                          label={org}
                          checked={keyValue.SalesOrganisation === org}
                          onChange={() => setKeyValue(s => ({ ...s, SalesOrganisation: s.SalesOrganisation === org ? "" : org }))}
                        />
                      ))}
                    </div>
                  </ContainerCard>
                )}
                {keyCombo.Customer.includes("Sub Channel") && (
                  <ContainerCard className="mb-4 p-4">
                    <div className="font-medium mb-2">Sub Channel</div>
                    <div className="flex flex-col gap-2">
                      {["Sub 1", "Sub 2"].map((sub) => (
                        <CustomCheckbox
                          key={sub}
                          id={`sub-channel-checkbox-${sub.replace(/\s+/g, "-").toLowerCase()}`}
                          label={sub}
                          checked={keyValue.SubChannel === sub}
                          onChange={() => setKeyValue(s => ({ ...s, SubChannel: s.SubChannel === sub ? "" : sub }))}
                        />
                      ))}
                    </div>
                  </ContainerCard>
                )}
              </div>
              {/* Item */}
              <div className="flex-1">
                {keyCombo.Item.includes("Item Group") && (
                  <ContainerCard className="mb-4 p-4">
                    <div className="font-medium mb-2">Item Group</div>
                    <div className="flex flex-col gap-2">
                      {["Group 1", "Group 2"].map((group) => (
                        <CustomCheckbox
                          key={group}
                          id={`item-group-checkbox-${group.replace(/\s+/g, "-").toLowerCase()}`}
                          label={group}
                          checked={keyValue.ItemGroup === group}
                          onChange={() => setKeyValue(s => ({ ...s, ItemGroup: s.ItemGroup === group ? "" : group }))}
                        />
                      ))}
                    </div>
                  </ContainerCard>
                )}
              </div>
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Promotion</h2>
            <div className="flex gap-6 mb-6">
              <div className="flex-1">
                <label>Item Name</label>
                <input type="text" placeholder="Enter Code" className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.itemName} onChange={e => setPromotion(s => ({ ...s, itemName: e.target.value }))} />
              </div>
              <div className="flex-1">
                <label>Start Date</label>
                <input type="date" className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.startDate} onChange={e => setPromotion(s => ({ ...s, startDate: e.target.value }))} />
              </div>
              <div className="flex-1">
                <label>End Date</label>
                <input type="date" className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.endDate} onChange={e => setPromotion(s => ({ ...s, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-6 mb-6">
              <div className="flex-1">
                <label>Order Type</label>
                <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.orderType} onChange={e => setPromotion(s => ({ ...s, orderType: e.target.value }))}>
                  <option value="All">All</option>
                  <option value="Type 1">Type 1</option>
                </select>
              </div>
              <div className="flex-1">
                <label>Offer Type</label>
                <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.offerType} onChange={e => setPromotion(s => ({ ...s, offerType: e.target.value }))}>
                  <option value="All">All</option>
                  <option value="Offer 1">Offer 1</option>
                </select>
              </div>
              <div className="flex-1">
                <label>Type</label>
                <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.type} onChange={e => setPromotion(s => ({ ...s, type: e.target.value }))}>
                  <option value="Slab">Slab</option>
                  <option value="Type 2">Type 2</option>
                </select>
              </div>
            </div>
            <div className="flex gap-6 mb-6">
              <div className="flex-1">
                <label>Discount Type</label>
                <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.discountType} onChange={e => setPromotion(s => ({ ...s, discountType: e.target.value }))}>
                  <option value="Fixed">Fixed</option>
                  <option value="Percent">Percent</option>
                </select>
              </div>
              <div className="flex-1">
                <label>Discount Apply on</label>
                <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.discountApplyOn} onChange={e => setPromotion(s => ({ ...s, discountApplyOn: e.target.value }))}>
                  <option value="Quantity">Quantity</option>
                  <option value="Value">Value</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={promotion.bundle} onChange={e => setPromotion(s => ({ ...s, bundle: e.target.checked }))} />
                Do you want bundle combination?
              </label>
            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  return (
    <div>
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
          currentStep={currentStep}
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
    </div>
  );
}
