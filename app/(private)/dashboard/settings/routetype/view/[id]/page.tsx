"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { getRouteTypeById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type RouteTypeFormValues = {
  route_type_name: string;
  route_type_code: string;
  status: number | "Active" | "Inactive";
};
const title = "Route Type Details";
const backBtnUrl = "/dashboard/settings/routetype";

export default function ViewPage() {
const params = useParams();
const rawId = params?.id || params?.id;
const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [routeType, setRouteType] = useState<RouteTypeFormValues | null>(null);

useEffect(() => {
  const fetchRouteTypeDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getRouteTypeById(id);
      setLoading(false);

      if (res.error) {
        showSnackbar(res.data?.message || "Unable to fetch Route Type Details", "error");
        return;
      }

      console.log("API Response:", res.data);

      // Map API response to form values
      setRouteType({
        route_type_name: res.data.route_type_name || "-",
        route_type_code: res.data.route_type_code || "-",
        status: res.data.status,
      });
    } catch (error) {
      setLoading(false);
      console.error(error);
      showSnackbar("Something went wrong while fetching Route Type details", "error");
    }
  };

  fetchRouteTypeDetails();
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

      {/* Route Type Details */}
      <div className="flex flex-wrap gap-x-[20px]">
        <ContainerCard className="w-full">
          <KeyValueData
            data={[
              { value: routeType?.route_type_code, key: "Route Type Code" },
                   { value: routeType?.route_type_name, key: "Route Type Name" },
              {
                value: "",
                key: "Status",
                component: (
                  <StatusBtn
                    isActive={routeType?.status === 1 || routeType?.status === "Active"}
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
