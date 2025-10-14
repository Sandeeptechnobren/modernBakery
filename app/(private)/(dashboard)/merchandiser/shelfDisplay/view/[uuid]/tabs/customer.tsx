"use client";

import { useEffect, useState } from "react";
import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import { getShelfById } from "@/app/services/merchandiserApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { useParams } from "next/navigation";
import Loading from "@/app/components/Loading";

// --- Type Definitions ---
type Customer = {
  uuid?: string;
  customer_code?: string;
  customer_type?: string;
  owner_name?: string;
  // Include all possible fields from both API responses
  customers?: number;
  id?: number;
  business_name?: string;
};

type Merchandiser = {
  uuid?: string;
  osa_code?: string;
  type?: string | number;
  name?: string;
  // Include all possible fields from both API responses
  merchandisers?: number;
  id?: number;
};

type ShelfData = {
  uuid?: string;
  id?: number;
  code?: string;
  shelf_name?: string;
  height?: string | number;
  width?: string | number;
  depth?: string | number;
  valid_from?: string;
  valid_to?: string;
  customer_ids?: number[];
  customers?: Customer[];
  merchendiser_ids?: number[];
  merchandisers?: Merchandiser[];
  created_by?: number;
  created_at?: string;
};

export const CustomerTab = () => {
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
        const res = await getShelfById(String(uuid));
        console.log(res);
        if (res?.data) {
          setShelfData(res.data);
        } else {
          showSnackbar("Unable to fetch shelf details", "error");
        }
      } catch (error) {
        console.error("Error fetching shelf data:", error);
        showSnackbar("Unable to fetch shelf details", "error");
      } finally {
        setLocalLoading(false);
        setLoading(false);
      }
    };

    fetchShelfData();
  }, [uuid, showSnackbar, setLoading]);

  if (loading || !shelfData) return <Loading />;

  return (
    <div className="">
      <div className="flex flex-col md:flex-row gap-6">
        {/* --- Customers Section --- */}
        <div className="flex-1">
          <ContainerCard className="w-full h-fit">
            <h3 className="text-[18px] font-semibold mb-[20px]">
              Customer Information
            </h3>

            {shelfData.customers && shelfData.customers.length > 0 ? (
              shelfData.customers.map((item: Customer, index: number) => (
                <div
                  key={index}
                  className="border-b last:border-b-0 pb-4 mb-4 last:pb-0"
                >
                  <KeyValueData
                    title={`Customer #${index + 1}`}
                    data={[
                      { key: "ID", value: item?.uuid || "-" },
                      {
                        key: "Customer Code",
                        value: item?.customer_code || "-",
                      },
                      {
                        key: "Customer Type",
                        value: item?.customer_type || "-",
                      },
                      { key: "Owner Name", value: item?.owner_name || "-" },
                    ]}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No customer data available.
              </p>
            )}
          </ContainerCard>
        </div>

        {/* --- Merchandisers Section --- */}
        <div className="flex-1">
          <ContainerCard className="w-full h-fit">
            <h3 className="text-[18px] font-semibold mb-[20px]">
              Merchandiser Information
            </h3>

            {shelfData.merchandisers && shelfData.merchandisers.length > 0 ? (
              shelfData.merchandisers.map(
                (item: Merchandiser, index: number) => (
                  <div
                    key={index}
                    className="border-b last:border-b-0 pb-4 mb-4 last:pb-0"
                  >
                    <KeyValueData
                      title={`Merchandiser #${index + 1}`}
                      data={[
                        { key: "ID", value: item?.uuid || "-" },
                        { key: "OSA Code", value: item?.osa_code || "-" },
                        { key: "Type", value: item?.type?.toString() || "-" },
                        { key: "Name", value: item?.name || "-" },
                      ]}
                    />
                  </div>
                )
              )
            ) : (
              <p className="text-gray-500 text-sm">
                No merchandiser data available.
              </p>
            )}
          </ContainerCard>
        </div>
      </div>
    </div>
  );
};
