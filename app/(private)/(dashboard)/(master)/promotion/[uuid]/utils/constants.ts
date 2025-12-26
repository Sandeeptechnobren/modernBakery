import { StepperStep } from "@/app/components/stepperForm";
import { KeyGroup, PromotionState } from "../types";

export const initialKeys: KeyGroup[] = [
  {
    type: "Location",
    options: [
      { id: "1", label: "Company", isSelected: false },
      { id: "2", label: "Region", isSelected: false },
      { id: "4", label: "Area", isSelected: false },
      { id: "3", label: "Warehouse", isSelected: false },
    ],
  },
  {
    type: "Customer",
    options: [
      { id: "6", label: "Channel", isSelected: false },
      { id: "7", label: "Customer Category", isSelected: false },
      { id: "11", label: "Customer SubCategory", isSelected: false },
      { id: "8", label: "Customer", isSelected: false },
    ],
  },
  {
    type: "Item",
    options: [
      { id: "9", label: "Item Category", isSelected: false },
      { id: "10", label: "Item", isSelected: false },
    ],
  },
];

export const steps: StepperStep[] = [
  { id: 1, label: "Key Combination" },
  { id: 2, label: "Key Value" },
  { id: 3, label: "Promotion" },
];

export const initialPromotionState: PromotionState = {
  itemName: "",
  startDate: "",
  endDate: "",
  offer_type: "",
  promotionType: "",
  bundle_combination: "range",
  status: "1",
  salesTeamType: [],
  projectList: [],
};
