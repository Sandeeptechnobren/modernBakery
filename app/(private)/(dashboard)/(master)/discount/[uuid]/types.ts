export type KeyComboType = {
  Location: string;
  Customer: string;
  Item: string;
};

export type KeyOption = { label: string; id: string; isSelected: boolean };

export type KeyGroup = { type: keyof KeyComboType; options: KeyOption[] };

export type DiscountItemType = {
  key: string; // Item or Category ID
  rate: string;
  idx: string;
};

export type DiscountState = {
  discount_code: string;
  // UI Fields
  name: string;
  salesTeam: string[];
  projects: string[];
  scope: 'header' | 'details';
  headerRate: string;
  headerMinAmount: string; // New field for Minimum Order Amount in header
  discountMethod: string;
  discountItems: DiscountItemType[];
  
  // Legacy/Backend Fields (keep for now or map)
  discountType: string;
  discountValue: string;
  minQuantity: string;
  minOrderValue: string;
  startDate: string;
  endDate: string;
  status: string;
};
