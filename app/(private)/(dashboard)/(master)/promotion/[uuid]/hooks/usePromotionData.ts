import { useState, useEffect } from "react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { promotionHeaderById } from "@/app/services/allApi";
import { PromotionState, KeyComboType, PercentageDiscountType, OrderItemType, OfferItemType } from "../types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type UsePromotionDataProps = {
  isEditMode: boolean;
  id: string | string[] | undefined;
  setPromotion: React.Dispatch<React.SetStateAction<PromotionState>>;
  setKeyCombo: React.Dispatch<React.SetStateAction<KeyComboType>>;
  setKeyValue: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  setPercentageDiscounts: React.Dispatch<React.SetStateAction<PercentageDiscountType[]>>;
  setSelectedUom: React.Dispatch<React.SetStateAction<string>>;
  setOrderTables: React.Dispatch<React.SetStateAction<OrderItemType[][]>>;
  setOfferItems: React.Dispatch<React.SetStateAction<OfferItemType[][]>>;
  fetchItemsCategoryWise: (categories: string) => Promise<any>;
  router: AppRouterInstance;
};

export function usePromotionData({
  isEditMode, id, setPromotion, setKeyCombo, setKeyValue, 
  setPercentageDiscounts, setSelectedUom, setOrderTables, setOfferItems, fetchItemsCategoryWise,router
}: UsePromotionDataProps) {
  
  const [loading, setLoading] = useState(false);
  // const { showSnackbar } = useAllDropdownListData(); // Assuming showSnackbar is available here or pass it

  useEffect(() => {
    async function fetchEditData() {
      if (!isEditMode || !id) return;
      setLoading(true);
      try {
        // Fix: Accepts only string; if array, take first element
        const headerRes = await promotionHeaderById(Array.isArray(id) ? id[0] : id);
        if (headerRes && typeof headerRes === "object") {
          const data = headerRes.data;
          
          setPromotion(s => ({
            ...s,
            itemName: data.promotion_name || "",
            startDate: data.from_date || "",
            endDate: data.to_date || "",
            offer_type: data.offer_type || "",
            promotionType: data.promotion_type || "",
            bundle_combination: data.bundle_combination || s.bundle_combination || "",
            status: data.status !== undefined ? String(data.status) : s.status,
            salesTeamType: Array.isArray(data.sales_team_type) ? data.sales_team_type.map(String) : (data.sales_team_type ? [String(data.sales_team_type)] : []),
            projectList: Array.isArray(data.project_list) ? data.project_list.map(String) : (data.project_list ? [String(data.project_list)] : []),
          }));

          let newKeyComboItem = "";
          if (Array.isArray(data.percentage_discounts) && data.percentage_discounts.length > 0) {
            if (data.percentage_discounts[0].percentage_item_category) {
              newKeyComboItem = "Item Category";
            } else if (data.percentage_discounts[0].percentage_item_id) {
              newKeyComboItem = "Item";
            }
          } else {
            newKeyComboItem = data.item_category?.length > 0 ? "Item Category" : (data.items?.length > 0 ? "Item" : "");
          }
          const keys = data.key || {};
          const newKeyCombo = {
            Location: keys.Location?.[0] || "",
            Customer: keys.Customer?.[0] || "",
            Item: keys.Item?.[0] || "",
          };
          setKeyCombo(newKeyCombo);

          if (Array.isArray(data.percentage_discounts) && data.percentage_discounts.length > 0) {
            const mappedPercentageDiscounts = data.percentage_discounts.map((pd: any) => ({
              key: pd.percentage_item_id || pd.percentage_item_category || "",
              percentage: String(pd.percentage || ""),
              idx: String(Math.random())
            }));
            setPercentageDiscounts(mappedPercentageDiscounts);
          }

          const newKeyValue: Record<string, string[]> = {};
          if (newKeyCombo.Location) newKeyValue[newKeyCombo.Location] = data.location?.map(String) || [];
          if (newKeyCombo.Customer) newKeyValue[newKeyCombo.Customer] = data.customer?.map(String) || [];
          
          const isPercentageDriven = Array.isArray(data.percentage_discounts) && data.percentage_discounts.length > 0;
          
          if (isPercentageDriven && newKeyCombo.Item === "Item" && data.item_category?.length > 0) {
             newKeyValue["Item Category"] = data.item_category.map(String);
          }

          if (!isPercentageDriven) {
            if (newKeyCombo.Item === "Item Category") {
              const categories = data.item_category?.map(String) || [];
              newKeyValue["Item Category"] = categories;
              if (categories.length > 0) {
                fetchItemsCategoryWise(categories.toString());
              }
              if (data.items && data.items.length > 0) {
                newKeyValue["Item"] = data.items.map(String);
              }
            }
            if (newKeyCombo.Item === "Item") {
              newKeyValue["Item"] = data.items?.map(String) || [];
              const categories = data.item_category?.map(String) || [];
              if (categories.length > 0) {
                newKeyValue["Item Category"] = categories;
              }
            }
          }
          setKeyValue(newKeyValue);

          setSelectedUom(String(data.uom || ""));

          if (Array.isArray(data.promotion_details) && data.promotion_details.length > 0) {
            const details = data.promotion_details.map((d: any) => ({
              promotionGroupName: "", 
              itemName: "", 
              itemCode: "",
              quantity: String(d.from_qty || ""),
              toQuantity: String(d.to_qty || ""),
              uom: String(data.uom || "CTN"),
              price: "",
              free_qty: String(d.free_qty || ""),
              idx: String(d.id || Math.random())
            }));
            setOrderTables([details]);
          }

          if (data.offer_items && data.offer_items.length > 0) {
            const allItemIds: string[] = [];
            let commonUom = ""; 
            
            data.offer_items.forEach((o: any) => {
              if (o.item_id) {
                allItemIds.push(String(o.item_id));
              }
              if (!commonUom && o.uom) { 
                commonUom = String(o.uom);
              }
            });

            const singleOfferItem: OfferItemType = {
              promotionGroupName: "",
              itemName: "", 
              itemCode: allItemIds, 
              uom: commonUom || "BAG", 
              toQuantity: "", 
              is_discount: "0",
              idx: String(Math.random())
            };
            setOfferItems([[singleOfferItem]]); 
          } else {
             setOfferItems([[{ promotionGroupName: "", itemName: "", itemCode: "", uom: "BAG", toQuantity: "", is_discount: "0", idx: "0" }]]);
          }
        }
      } catch (err) {
        // showSnackbar("Failed to fetch promotion data for edit mode", "error");
        router.push("/promotion");
        console.error(err);
      }
      setLoading(false);
    }
    fetchEditData();
  }, [isEditMode, id]); // Intentionally not including setters in deps to avoid loops

  return { loading };
}
