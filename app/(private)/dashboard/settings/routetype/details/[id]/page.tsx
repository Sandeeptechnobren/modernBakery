"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { getRouteTypeById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type RouteType = {
  route_type_code: string;
  route_type_name: string;
  status: number | "Active" | "Inactive";
};

const TITLE = "Route type Details";

export default function ViewPage() {
  const params = useParams();
  let id: string = "";
  if (params.id) {
    id = Array.isArray(params.id) ? params.id[0] || "" : (params.id as string);
  }

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [routeType, setRouteType] = useState<RouteType | null>(null);

  useEffect(() => {
    const fetchRouteTypeDetails = async () => {
      setLoading(true);
      const res = await getRouteTypeById(id);
      setLoading(false);

      if (res.error) {
        showSnackbar(
          res.data.message || "Unable to fetch RouteType Details",
          "error"
        );
        return;
      }
      setRouteType(res.data);
    };
    fetchRouteTypeDetails();
  }, []);

  console.log("RouteType state:", routeType); // Debug log
  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings/routetype">
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
                value: routeType?.route_type_code ?? "-",
                key: "Code",
              },
              {
                value: routeType?.route_type_name ?? "-",
                key: "Name",
              },
              {
                value: routeType?.status === 1 ? "Active" : "Inactive",
                key: "Status",
              },
            ]}
          />
        </ContainerCard>
      </div>
    </>
  );
}
