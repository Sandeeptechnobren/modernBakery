"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { getPlanogramById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type PlanogramFormValues = {
    
  name: string;
  valid_from: string;
  valid_to: string;
  status: number | "Active" | "Inactive";
};

const title = "Planogram Details";
const backBtnUrl = "/dashboard/merchandiser/planogram";

export default function ViewPage() {
const params = useParams();
const rawId = params?.id || params?.id;
const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [planogram, setPlanogram] = useState<PlanogramFormValues | null>(null);

  useEffect(() => {
    const fetchPlanogramDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getPlanogramById(id);
        setLoading(false);

        if (res.error) {
          showSnackbar(res.data?.message || "Unable to fetch Planogram Details", "error");
          return;
        }

        // Map API response to form values
        setPlanogram({
          name: res.data.name || "-",
          valid_from: res.data.valid_from || "-",
          valid_to: res.data.valid_to || "-",
          status: res.data.status,
        });
      } catch (error) {
        setLoading(false);
        console.error(error);
        showSnackbar("Something went wrong while fetching Planogram details", "error");
      }
    };

    fetchPlanogramDetails();
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

      {/* Planogram Details */}
      <div className="flex flex-wrap gap-x-[20px]">
        <ContainerCard className="w-full ]">
          <KeyValueData
            data={[
              { value: planogram?.name, key: "Name" },
                   { value: planogram?.valid_from, key: "Valid From" },
                   { value: planogram?.valid_to, key: "valid_to" },
              {
                value: "",
                key: "Status",
                component: (
                  <StatusBtn
                    isActive={planogram?.status === 1 || planogram?.status === "Active"}
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
