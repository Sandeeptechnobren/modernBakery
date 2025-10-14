"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { getSalesmanById } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import StatusBtn from "@/app/components/statusBtn2";
import Toggle from "@/app/components/toggle";
import SummaryCard from "@/app/components/summaryCard";

interface Salesman {
  id?: string | number;
  uuid?: string;
  osa_code?: string;
  name?: string;
  vehicle_chesis_no?: string;
  salesman_type?: {
    id?: number;
    salesman_type_code?: string;
    salesman_type_name?: string;
  };
  sub_type?: string;
  designation?: string;
  security_code?: string;
  route?: {
    id?: number;
    route_code?: string;
    route_name?: string;
  };
  warehouse?: {
    id?: number;
    warehouse_code?: string;
    warehouse_name?: string;
  };
  device_no?: string;
  salesman_role?: string | number;
  username?: string;
  contact_no?: string;
  sap_id?: string | null;
  status?: string | number;
  image_url?: string | null;
  description?: string | null;
  token_no?: string;
}

const title = "Salesman Details";
const backBtnUrl = "/salesman";

export default function ViewPage() {
  const params = useParams();
  const uuid = Array.isArray(params.uuid)
    ? params.uuid[0] || ""
    : (params.uuid as string) || "";

  const [salesman, setSalesman] = useState<Salesman | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!uuid) return;

    const fetchSalesmanDetails = async () => {
      setLoading(true);
      try {
        const res = await getSalesmanById(uuid);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch Salesman Details",
            "error"
          );
          return;
        }
        setSalesman(res.data);
      } catch (error) {
        showSnackbar("Unable to fetch Salesman Details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesmanDetails();
  }, [uuid, setLoading, showSnackbar]);

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
        {/* Left Card */}
        <div>
          <ContainerCard className="w-[350px] flex flex-col gap-y-[20px] p-[20px]">
            <Image
              src={salesman?.image_url || "/logo.png"}
              alt="Salesman"
              width={600}
              height={400}
              className="w-full h-[180px] object-cover-[100%] rounded-md border border-[#E4E4E4] bg-[#E9EAEB]"
            />
            <span className="text-[#181D27] text-[20px] font-semibold">
              {salesman?.osa_code || "-"} - {salesman?.name}
            </span>
            <div className="flex justify-center">
              <StatusBtn
                isActive={
                  salesman?.status == 1 || salesman?.status === "1" ? true : false
                }
              />
            </div>
          </ContainerCard>
        </div>

        {/* Right Section */}
        <div className="w-full flex flex-col gap-y-[20px]">

          {/* General Information */}
          <ContainerCard className="w-full">
            <KeyValueData
              title="Salesman Information"
              data={[
                {
                  key: "SAP ID",
                  value: salesman?.sap_id || "-",
                },
                {
                  key: "Salesman Type",
                  value:
                    salesman?.salesman_type?.salesman_type_name || "-",
                },
                { key: "Sub Type", value: salesman?.sub_type || "-" },
                { key: "Designation", value: salesman?.designation || "-" },
                { key: "Device No", value: salesman?.device_no || "-" },
                { key: "Contact No", value: salesman?.contact_no || "-" },
                {
                  key: "Warehouse",
                  value: salesman?.warehouse?.warehouse_name || "-",
                },
                {
                  key: "Route",
                  value: salesman?.route?.route_name || "-",
                },
                { key: "Token No", value: salesman?.token_no || "-" },
                
              ]}
            />
          </ContainerCard>
        </div>
      </div>
    </>
  );
}
