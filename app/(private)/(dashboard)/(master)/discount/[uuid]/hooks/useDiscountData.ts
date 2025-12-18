import { useState, useEffect } from "react";
import { getDiscountById, genearateCode } from "@/app/services/allApi";
import { DiscountState, KeyComboType } from "../types";

type UseDiscountDataProps = {
  isEditMode: boolean;
  id: string | string[] | undefined;
  setDiscount: React.Dispatch<React.SetStateAction<DiscountState>>;
  setKeyCombo: React.Dispatch<React.SetStateAction<KeyComboType>>;
  setKeyValue: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  fetchItemsCategoryWise: (categories: string) => Promise<any>;
};

export function useDiscountData({
  isEditMode, id, setDiscount, setKeyCombo, setKeyValue, fetchItemsCategoryWise
}: UseDiscountDataProps) {
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (isEditMode && id && id !== "add") {
          const res = await getDiscountById(id);
          if (res && !res.error && res.data) {
            const d = res.data;
            setDiscount(s => ({
              ...s,
              discount_code: d.osa_code || "",
              discountType: d.discount_type?.id?.toString() || "",
              discountValue: d.discount_value?.toString() || "",
              minQuantity: d.min_quantity?.toString() || "",
              minOrderValue: d.min_order_value?.toString() || "",
              startDate: d.start_date ? d.start_date.split("T")[0] : "",
              endDate: d.end_date ? d.end_date.split("T")[0] : "",
              status: d.status?.toString() || "1",
            }));

            // Determine Keys from data
            // This logic depends on what keys are present in the response
            // Assuming simplified logic: if item_id exists -> Item key, etc.
            const newKeyCombo = {
              Location: d.location_type || "", // Hypothetical: API needs to return which key was used
              Customer: d.customer_type || "",
              Item: d.item_type || "",
            };
            
            // Fallback inference if API doesn't return types explicitly
            if (!newKeyCombo.Item) {
                if (d.item) newKeyCombo.Item = "Item";
                else if (d.item_category) newKeyCombo.Item = "Item Category";
            }
            if (!newKeyCombo.Customer) {
                if (d.customer) newKeyCombo.Customer = "Customer";
                else if (d.outlet_channel) newKeyCombo.Customer = "Channel";
            }
            // ... infer Location ...

            setKeyCombo(newKeyCombo);

            // Populate KeyValues
            const newValues: Record<string, string[]> = {};
            if (d.item?.id) newValues["Item"] = [d.item.id.toString()];
            if (d.item_category?.id) {
              newValues["Item Category"] = [d.item_category.id.toString()];
              // If in Item mode and category is pre-filled, fetch items for that category
              if (newKeyCombo.Item === "Item" && d.item_category.id) {
                fetchItemsCategoryWise(d.item_category.id.toString());
              }
            }
            if (d.customer?.id) newValues["Customer"] = [d.customer.id.toString()];
            if (d.outlet_channel?.id) newValues["Channel"] = [d.outlet_channel.id.toString()];
            
            setKeyValue(newValues);
          }
        } else {
          const res = await genearateCode({ model_name: "discounts" });
          if (res?.code) {
            setDiscount(prev => ({ ...prev, discount_code: res.code }));
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEditMode, id]);

  return { loading };
}
