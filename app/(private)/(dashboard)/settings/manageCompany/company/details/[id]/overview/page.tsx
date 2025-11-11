"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "@/app/components/keyValueData";

import { getCompanyById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";

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
  city?: string;
  address?: string;
  service_type?: string;
  logo?: string | null;
}

export default function ViewPage() {
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
    <>
      {/* Header */}

      <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
        {/* Left Section */}

        {/* Right Section */}
        <div className="w-full flex flex-col gap-y-[20px]">
          {/* Company Information */}
          <ContainerCard className="w-full h-fit">
            <KeyValueData
              title="Company Information"
              data={[
                { key: "Company Type", value: company?.company_type || "-" },
                { key: "Website", value: company?.website || "-" },
                { key: "Email", value: company?.email || "-" },
                {
                  key: "Primary Contact",
                  value: company?.primary_contact || "-",
                },
                { key: "Toll Free No", value: company?.toll_free_no || "-" },
                { key: "Module Access", value: company?.module_access || "-" },
                { key: "Service Type", value: company?.service_type || "-" },
                { key: "VAT", value: company?.vat || "-" },
                { key: "City", value: company?.city || "-" },
                { key: "Address", value: company?.address || "-" },
                { key: "Country", value: company?.country?.country_name || "-" },
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

        </div>
      </div>
    </>
  );
}