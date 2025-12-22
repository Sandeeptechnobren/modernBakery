export type KeyComboType = {
  Location: string;
  Customer: string;
  Item: string;
};

export type KeyOption = { label: string; id: string; isSelected: boolean };

export type KeyGroup = { type: keyof KeyComboType; options: KeyOption[] };

export type OrderItemType = {
  promotionGroupName: string;
  itemName: string;
  itemCode: string;
  quantity: string;
  toQuantity: string;
  uom: string;
  price: string;
  free_qty?: string;
  type?: string;
  idx?: string;
};

export type OfferItemType = {
  promotionGroupName: string;
  itemName: string;
  itemCode: string | string[];
  uom: string;
  toQuantity: string;
  is_discount: string;
  idx?: string;
};

export type PercentageDiscountType = {
  key: string;
  percentage: string;
  idx: string;
};

export type PromotionState = {
  itemName: string;
  startDate: string;
  endDate: string;
  promotionType: string;
  bundle_combination: string;
  status: string;
  salesTeamType: string[];
  projectList: string[];
  offer_type: string;
};
