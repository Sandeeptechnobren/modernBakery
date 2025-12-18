import { useState, useCallback } from "react";
import { KeyComboType, DiscountState } from "../types";
import { initialDiscountState } from "../utils/constants";

export function useDiscountForm() {
  const [keyCombo, setKeyCombo] = useState<KeyComboType>({
    Location: "",
    Customer: "",
    Item: "",
  });

  const [keyValue, setKeyValue] = useState<Record<string, string[]>>({});
  const [discount, setDiscount] = useState<DiscountState>(initialDiscountState);

  // Handlers
  const handleKeyComboChange = useCallback((newCombo: KeyComboType | ((prev: KeyComboType) => KeyComboType)) => {
    setKeyCombo(prev => {
        const next = typeof newCombo === 'function' ? newCombo(prev) : newCombo;
        // Reset downstream data if needed when keys change
        if (prev.Item !== next.Item) {
             setKeyValue(kv => ({ ...kv, "Item": [], "Item Category": [] }));
        }
        return next;
    });
  }, []);

  return {
    keyCombo,
    setKeyCombo: handleKeyComboChange,
    keyValue,
    setKeyValue,
    discount,
    setDiscount,
  };
}
