"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { getRegionById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Region = {
  region_code: string;
  region_name: string;
  status: number | "Active" | "Inactive";
};

const TITLE = "Region Details";

export default function ViewPage() {
  const params = useParams();
  let id: string = "";
  if (params.id) {
    id = Array.isArray(params.id) ? params.id[0] || "" : (params.id as string);
  }

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [regionType, setRegionType] = useState<Region | null>(null);

  useEffect(() => {
    const fetchRegionDetails = async () => {
      setLoading(true);
      const res = await getRegionById(id);
      setLoading(false);

      if (res.error) {
        showSnackbar(
          res.data.message || "Unable to fetch Region Details",
          "error"
        );
        return;
      }
      setRegionType(res.data);
    };
    fetchRegionDetails();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings/region">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{TITLE}</h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-[20px]">
        {/* Right details card */}
        <ContainerCard className="w-full">
          <KeyValueData
            data={[
              {
                value: regionType?.region_code ?? "-",
                key: "Code",
              },
              {
                value: regionType?.region_name ?? "-",
                key: "Name",
              },
              {
                value: regionType?.status === 1 ? "Active" : "Inactive",
                key: "Status",
              },
            ]}
          />
        </ContainerCard>
      </div>
    </>
  );
}
