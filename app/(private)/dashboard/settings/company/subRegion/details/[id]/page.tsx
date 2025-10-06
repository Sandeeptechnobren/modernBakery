"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { getAreaById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type SubRegion = {
  area_code: string;
  area_name: string;
  region: {
    region_name: string;
  };
  status: number;
};

const TITLE = "Sub Region Details";

export default function ViewPage() {
  const params = useParams();
  let id: string = "";
  if (params.id) {
    id = Array.isArray(params.id) ? params.id[0] || "" : (params.id as string);
  }

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [subRegion, setSubRegion] = useState<SubRegion | null>(null);

  useEffect(() => {
    const fetchSubRegionDetails = async () => {
      setLoading(true);
      const res = await getAreaById(id);
      setLoading(false);

      if (res.error) {
        showSnackbar(
          res.data.message || "Unable to fetch SubRegion Details",
          "error"
        );
        return;
      }
      setSubRegion(res.data);
    };

    fetchSubRegionDetails();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings/company/subRegion">
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
                value: subRegion?.area_code ?? "-",
                key: "Code",
              },
              {
                value: subRegion?.area_name ?? "-",
                key: "Name",
              },
              {
                value: subRegion?.region?.region_name ?? "-",
                key: "Region",
              },
              {
                value: subRegion?.status === 1 ? "Active" : "Inactive",
                key: "Status",
              },
            ]}
          />
        </ContainerCard>
      </div>
    </>
  );
}
