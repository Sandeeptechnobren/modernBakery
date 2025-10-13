"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Icon } from "@iconify-icon/react";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import Toggle from "@/app/components/toggle";
import SummaryCard from "@/app/components/summaryCard";

import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { getCompanyById } from "@/app/services/allApi";

interface Company {
  id?: string | number;
  company_code?: string;
  company_name?: string;
  company_type?: string;
  email?: string;
  vat?: string;
  country?: {
    id?: number;
    country_name?: string;
    country_code?: string;
    selling_currency?: string;
    purchase_currency?: string;
  };
  region?: {
    id?: number;
    region_name?: string;
    region_code?: string;
  };
  sub_region?: {
    id?: number;
    subregion_name?: string;
    subregion_code?: string;
  };
  selling_currency?: string;
  purchase_currency?: string;
  toll_free_no?: string;
  primary_contact?: string;
  website?: string;
  module_access?: string;
  district?: string;
  town?: string;
  street?: string;
  landmark?: string;
  service_type?: string;
  logo?: string | null;
}



export default function Address() {
  const params = useParams();
  const id = Array.isArray(params.id)
    ? params.id[0] || ""
    : (params.id as string) || "";

  const [company, setCompany] = useState<Company | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!id) return;

    const fetchCompanyDetails = async () => {
      setLoading(true);
      try {
        const res = await getCompanyById(id);

        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch company details",
            "error"
          );
          return;
        }

        setCompany(res.data);
      } catch (error) {
        showSnackbar("Unable to fetch company details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id, setLoading, showSnackbar]);

  return (
  <div className="flex flex-wrap gap-5">

    <ContainerCard className="flex-1 min-w-[320px] max-w-[500px] h-fit">
      <KeyValueData
        title="Currency & Region"
        data={[
          {
            key: "Selling Currency",
            value:
              company?.selling_currency ||
              company?.country?.selling_currency ||
              "-",
          },
          {
            key: "Purchase Currency",
            value:
              company?.purchase_currency ||
              company?.country?.purchase_currency ||
              "-",
          },
        ]}
      />
    </ContainerCard>

    {/* Address Information */}
    <ContainerCard className="flex-1 h-fit">
      <KeyValueData
        title="Address Information"
        data={[
          { key: "Country", value: company?.country?.country_name || "-" },
          { key: "Region", value: company?.region?.region_name || "-" },
          {
            key: "Sub Region",
            value: company?.sub_region?.subregion_name || "-",
          },
          { key: "District", value: company?.district || "-" },
          { key: "Town", value: company?.town || "-" },
          { key: "Street", value: company?.street || "-" },
          { key: "Landmark", value: company?.landmark || "-" },
        ]}
      />
    </ContainerCard>
  </div>
);

}