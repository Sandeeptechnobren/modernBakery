"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { getSalesmanTypeById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type SalesmanType = {
  salesman_type_code?: string;
  salesman_type_name?: string;
  salesman_type_status: string | number; // ✅ allow both
};

const TITLE = "Salesman type Details";

export default function ViewPage() {
  const params = useParams();
  let id: string = "";
  if (params.id) {
    id = Array.isArray(params.id) ? params.id[0] || "" : (params.id as string);
  }

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [salesmanType, setSalesmanType] = useState<SalesmanType | null>(null);

  useEffect(() => {
    const fetchRouteTypeDetails = async () => {
      setLoading(true);
      const res = await getSalesmanTypeById(id);
      setLoading(false);

      if (res.error) {
        showSnackbar(
          res.data.message || "Unable to fetch SalesmanType Details",
          "error"
        );
        return;
      }
      setSalesmanType(res.data);
    };
    fetchRouteTypeDetails();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings/salesman-type">
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
                value: salesmanType?.salesman_type_code ?? "-",
                key: "Code",
              },
              {
                value: salesmanType?.salesman_type_name ?? "-",
                key: "Name",
              },
              {
                value:
                  salesmanType?.salesman_type_status === 1
                    ? "Active"
                    : "Inactive",
                key: "Status",
              },
            ]}
          />
        </ContainerCard>
      </div>
    </>
  );
}
