import { useState, useEffect } from "react";
import { getDiscountById } from "@/app/services/allApi";
import { DiscountState, KeyComboType } from "../types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type UseDiscountDataProps = {
  isEditMode: boolean;
  id: string | string[] | undefined;
  setDiscount: React.Dispatch<React.SetStateAction<DiscountState>>;
  setKeyCombo: React.Dispatch<React.SetStateAction<KeyComboType>>;
  setKeyValue: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  setItemLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchItemsCategoryWise: (categories: string) => Promise<any>;
  router: AppRouterInstance;
  showSnackbar: (message: string, type: "success" | "error" | "info" | "warning") => void;
};

export function useDiscountData({
  isEditMode, id, setDiscount, setKeyCombo, setKeyValue, setItemLoading, fetchItemsCategoryWise, router, showSnackbar
}: UseDiscountDataProps) {

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (
          isEditMode &&
          id &&
          id !== "add" &&
          typeof id === "string"
        ) {
          const res = await getDiscountById(id);
          if (res && !res.error && res.data) {
            const d = res.data;
            setDiscount(s => ({
              ...s,
              name: d.discount_name || "",
              discountMethod: d.discount_type === "PERCENTAGE" ? "Percentage" : "Amount",
              salesTeam: Array.isArray(d.sales_team_type) ? d.sales_team_type.map(String) : [],
              projects: Array.isArray(d.project_list) ? d.project_list.map(String) : [],
              scope: d.discount_apply_on === "header" ? "header" : "details",
              startDate: d.from_date ? d.from_date.split("T")[0] : "",
              endDate: d.to_date ? d.to_date.split("T")[0] : "",
              status: d.status?.toString() || "1",
              header: {
                headerMinAmount: d.header?.headerMinAmount || "",
                headerRate: d.header?.headerRate || ""
              },
              discountItems: Array.isArray(d.discount_details) && d.discount_details.length > 0
                ? d.discount_details.map((detail: any) => ({
                  key: detail.item_id || detail.category_id || "",
                  rate: d.discount_type === "PERCENTAGE" ? detail.percentage : detail.amount,
                  idx: detail.id ? String(detail.id) : String(Math.random())
                }))
                : [{ key: "", rate: "", idx: "0" }]
            }));

            const newKeyCombo = {
              Location: d.key?.Location?.[0] || "",
              Customer: d.key?.Customer?.[0] || "",
              Item: d.key?.Item?.[0] || "",
            };

            setKeyCombo(newKeyCombo);

            const newValues: Record<string, string[]> = {};
            if (newKeyCombo.Location && Array.isArray(d.location)) {
              newValues[newKeyCombo.Location] = d.location.map(String);
            }
            if (newKeyCombo.Customer && Array.isArray(d.customer)) {
              newValues[newKeyCombo.Customer] = d.customer.map(String);
            }
            
            // Always try to populate Item Category if present
            if (Array.isArray(d.item_category) && d.item_category.length > 0) {
               newValues["Item Category"] = d.item_category.map(String);
               setItemLoading(true);
            }

            if (newKeyCombo.Item) {
              if (newKeyCombo.Item === "Item" && Array.isArray(d.items)) {
                newValues["Item"] = d.items.map(String);
              } 
            }

            setKeyValue(newValues);
          } else {
            showSnackbar(`Unable to load the requested data. Please verify the URL or contact support.`,"warning")

            router.push("/discount");
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
