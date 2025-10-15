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
  designation?: string;
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
  username?: string;
  contact_no?: string;
  status?: string | number;
  image_url?: string | null;
  description?: string | null;
  is_block?: string | number;
  block_date_from?: string;
  block_date_to?: string;
  cashier_description_block?: string;
  invoice_block?: string | number;
  reason?: string;
  forceful_login?: string | number;
}

const title = "Salesman Details";
const backBtnUrl = "/salesman";

export default function Overview() {
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
     
      <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
        

        {/* Right Section */}
        <div className="w-full flex flex-col gap-y-[20px]">
          {/* General Information */}
          <ContainerCard className="w-full">
            <KeyValueData
              title="Salesman Information"
              data={[
                {
                  key: "Salesman Type",
                  value: salesman?.salesman_type?.salesman_type_name || "-",
                },
                { key: "Designation", value: salesman?.designation || "-" },
                { key: "Contact No", value: salesman?.contact_no || "-" },
                {
                  key: "Warehouse",
                  value: salesman?.warehouse?.warehouse_name || "-",
                },
                {
                  key: "Route",
                  value: salesman?.route?.route_name || "-",
                },
                { key: "User Name", value: salesman?.osa_code || "-" },
                {
                  key: "Forcefull Login",
                  value:
                    salesman?.forceful_login === 1 ||
                    salesman?.forceful_login === "1"
                      ? "Yes"
                      : "No",
                },
                {
                  key: "Is Block",
                  value:
                    salesman?.is_block === 1 || salesman?.is_block === "1"
                      ? "Yes"
                      : "No",
                },
                { key: "Block Date From", value: salesman?.block_date_from || "-" },
                { key: "Block Date To", value: salesman?.block_date_to || "-" },
                { key: "cashier Description Block", value: salesman?.cashier_description_block || "-" },
                {
                  key: "Invoice Block",
                  value:
                    salesman?.invoice_block === 1 ||
                    salesman?.invoice_block === "1"
                      ? "Yes"
                      : "No",
                },

                {
                  key: "Is Block Reason",
                  value: salesman?.reason || "-",
                },
              ]}
            />
          </ContainerCard>
        </div>
      </div>
    </>
  );
}
