"use client";

import { useEffect, useState } from "react";
import ContainerCard from "@/app/components/containerCard";
import { getPlanogramById } from "@/app/services/merchandiserApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { useParams } from "next/navigation";
import Loading from "@/app/components/Loading";

// --- Type Definitions ---
type Customer = {
  uuid?: string;
  customer_code?: string;
  owner_name?: string;
  business_name?: string;
};

type Merchandiser = {
  uuid?: string;
  code?: string;
  name?: string;
};

type ShelfData = {
  uuid?: string;
  id?: number;
  code?: string;
  shelf_name?: string;
  customers?: Customer[];
  merchandisers?: Merchandiser[];
};

export const CustomerData = () => {
  const { uuid } = useParams<{ uuid?: string }>();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  const [shelfData, setShelfData] = useState<ShelfData | null>(null);
  const [loading, setLocalLoading] = useState(true);

  useEffect(() => {
    const fetchShelfData = async () => {
      if (!uuid) return;
      setLocalLoading(true);
      setLoading(true);

      try {
        const res = await getPlanogramById(String(uuid));
        const data = res?.data?.data || res?.data;
        console.log("Planogram Data:", data);

        if (!data) {
          showSnackbar("Unable to fetch Planogram details", "error");
          return;
        }

        const transformedData: ShelfData = {
          customers: data.customers || [],
          merchandisers: data.merchendishers || [],
        };

        setShelfData(transformedData);
      } catch (error) {
        console.error("Error fetching Planogram data:", error);
        showSnackbar("Unable to fetch Planogram details", "error");
      } finally {
        setLocalLoading(false);
        setLoading(false);
      }
    };

    fetchShelfData();
  }, [uuid, showSnackbar, setLoading]);

  if (loading || !shelfData) return <Loading />;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* --- Merchandisers Section --- */}
      <div className="flex-1">
        <ContainerCard>
          <h1 className="text-lg font-semibold text-gray-800 mb-3">
            Merchandiser Information
          </h1>
          {shelfData.merchandisers && shelfData.merchandisers.length > 0 ? (
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="text-left px-4 py-2 border-b">Code</th>
                  <th className="text-right px-4 py-2 border-b">Name</th>
                </tr>
              </thead>
              <tbody>
                {shelfData.merchandisers.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b-gray-300 border-b last:border-b-0 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 text-left py-3">{item?.code || "-"}</td>
                    <td className="px-4 text-right py-3">
                      {item?.name || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">
              No merchandiser data available.
            </p>
          )}
        </ContainerCard>
      </div>

      {/* --- Customers Section --- */}
      <div className="flex-1">
        <ContainerCard>
          <h1 className="text-lg font-semibold text-gray-800 mb-3">
            Customer Information
          </h1>
          {shelfData.customers && shelfData.customers.length > 0 ? (
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="text-left px-4 py-2 border-b">
                    Customer Code
                  </th>
                  <th className="text-right px-4 py-2 border-b">Owner Name</th>
                </tr>
              </thead>
              <tbody>
                {shelfData.customers.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b-gray-300 border-b last:border-b-0 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 text-left py-3">
                      {item?.customer_code || "-"}
                    </td>
                    <td className="px-4 text-right py-3">
                      {item?.owner_name || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">No customer data available.</p>
          )}
        </ContainerCard>
      </div>
    </div>
  );
};
