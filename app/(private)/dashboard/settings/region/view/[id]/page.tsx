"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { getRegionById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type RegionFormValues = {
  region_name: string;
  region_code: string;
  
  status: number | "Active" | "Inactive";
};

const title = "Region Details";
const backBtnUrl = "/dashboard/settings/region";

export default function ViewPage() {
const params = useParams();
const rawId = params?.id || params?.id;
const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [region, setRegion] = useState<RegionFormValues | null>(null);

  useEffect(() => {
    const fetchRegionDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getRegionById(id);
        setLoading(false);

        if (res.error) {
          showSnackbar(res.data?.message || "Unable to fetch Region Details", "error");
          return;
        }

        console.log("API Response:", res.data);

        // Map API response to form values
        setRegion({
          region_name: res.data.region_name || "-",
          region_code: res.data.region_code || "-",
          
          status: res.data.status,
        });
      } catch (error) {
        setLoading(false);
        console.error(error);
        showSnackbar("Something went wrong while fetching region details", "error");
      }
    };

    fetchRegionDetails();
  }, [id, setLoading, showSnackbar]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      {/* Region Details */}
      <div className="flex flex-wrap gap-x-[20px]">
        <ContainerCard className="w-full">
          <KeyValueData
            data={[
              { value: region?.region_code, key: "Region Code" },
                   { value: region?.region_name, key: "Region Name" },
              {
                value: "",
                key: "Status",
                component: (
                  <StatusBtn
                    isActive={region?.status === 1 || region?.status === "Active"}
                  />
                ),
              },
            ]}
          />
        </ContainerCard>
      </div>
    </>
  );
}
