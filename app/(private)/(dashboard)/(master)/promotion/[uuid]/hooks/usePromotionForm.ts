import { useState, useEffect, useCallback } from "react";
import { KeyComboType, PromotionState, OrderItemType, OfferItemType, PercentageDiscountType } from "../types";
import { initialPromotionState } from "../utils/constants";

export function usePromotionForm() {
  const [keyCombo, setKeyCombo] = useState<KeyComboType>({
    Location: "",
    Customer: "",
    Item: "",
  });

  const [keyValue, setKeyValue] = useState<Record<string, string[]>>({});
  const [promotion, setPromotion] = useState<PromotionState>(initialPromotionState);
  const [selectedUom, setSelectedUom] = useState("");
  
  const [orderTables, setOrderTables] = useState<OrderItemType[][]>([
    [{ promotionGroupName: "", itemName: "", itemCode: "", quantity: "", toQuantity: "", uom: "CTN", price: "", free_qty: "" }]
  ]);
  
  const [offerItems, setOfferItems] = useState<OfferItemType[][]>([
    [{ promotionGroupName: "", itemName: "", itemCode: "", uom: "BAG", toQuantity: "", is_discount: "0" }]
  ]);

  const [percentageDiscounts, setPercentageDiscounts] = useState<PercentageDiscountType[]>([{ key: "", percentage: "", idx: "0" }]);

  // Handlers
  const handleKeyComboChange = useCallback((newCombo: KeyComboType | ((prev: KeyComboType) => KeyComboType)) => {
    setKeyCombo(prev => {
        const next = typeof newCombo === 'function' ? newCombo(prev) : newCombo;
        if (prev.Item !== next.Item) {
             setPercentageDiscounts([{ key: "", percentage: "", idx: "0" }]);
        }
        return next;
    });
  }, []);

  const updateOrderItem = useCallback((tableIdx: number, rowIdx: string, key: keyof OrderItemType, value: string) => {
    setOrderTables((tables) => tables.map((arr, idx) => {
      if (idx !== tableIdx) return arr;
      return arr.map((oi, i) => String(i) === String(rowIdx) ? { ...oi, [key]: value } : oi);
    }));
  }, []);

  const updateOfferItem = useCallback((tableIdx: number, rowIdx: string, key: keyof OfferItemType, value: string) => {
     setOfferItems((prev) => {
        const tables = (Array.isArray(prev) && prev.length > 0 && Array.isArray(prev[0])) ? prev : [prev as unknown as OfferItemType[]];
        return tables.map((arr, idx) => 
            idx === tableIdx ? arr.map((oi, i) => String(i) === String(rowIdx) ? { ...oi, [key]: value } : oi) : arr
        );
     });
  }, []);

  const selectItemForOffer = useCallback((tableIdx: number, rowIdx: string, value: string | string[]) => {
      setOfferItems((prev) => {
        const tables = (Array.isArray(prev) && prev.length > 0 && Array.isArray(prev[0])) ? prev : [prev as unknown as OfferItemType[]];
        return tables.map((arr, idx) =>
          idx === tableIdx
            ? arr.map((oi, i) => (String(i) === String(rowIdx) ? { ...oi, itemCode: value } : oi))
            : arr
        );
      });
  }, []);

  return {
    keyCombo,
    setKeyCombo: handleKeyComboChange,
    keyValue,
    setKeyValue,
    promotion,
    setPromotion,
    selectedUom,
    setSelectedUom,
    orderTables,
    setOrderTables,
    offerItems,
    setOfferItems,
    percentageDiscounts,
    setPercentageDiscounts,
    updateOrderItem,
    updateOfferItem,
    selectItemForOffer
  };
}
