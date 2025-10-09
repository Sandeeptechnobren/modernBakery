"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Icon } from "@iconify-icon/react";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
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
  status?: string | number;
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
        <div>
         <ContainerCard className="w-[350px] flex flex-col items-center gap-y-[20px] p-[20px]">
  {/* Company Logo */}
  <div className="flex justify-center items-center w-full">
    <Image
      src={company?.logo || "/logo.png"}
      alt="Company Logo"
      width={150}
      height={150}
      className="h-[150px] w-[150px] object-cover rounded-full border border-[#E4E4E4] bg-[#E9EAEB]"
    />
  </div>

  <span className="text-[#181D27] text-[20px] font-semibold text-center">
    {company?.company_code || "-"} - {company?.company_name || "-"}
  </span>

  <div className="flex justify-center">
    <StatusBtn
      isActive={
        company?.status == 1 || company?.status === "1" ? true : false
      }
    />
  </div>
</ContainerCard>

                 <ContainerCard >
                <div className="text-[18px] font-semibold mb-[25px]">
                  Barcode
                </div>

                <ContainerCard className="w-full mb-[25px] bg-gradient-to-r from-[#E7FAFF] to-[#FFFFFF]">
                  <SummaryCard
                    icon="prime:barcode"
                    iconCircleTw="bg-[#00B8F2] text-white w-[60px] h-[60px] p-[15px]"
                    iconWidth={30}
                    title={company?.company_code || "ABC-abc-1234"}
                    description="Company Barcode"
                  />
                </ContainerCard>

                <KeyValueData
                  data={[
                    {
                      key: "Promotional Access",
                      value: "",
                      component: (
                        <Toggle
                          isChecked={isChecked}
                          onChange={() => setIsChecked(!isChecked)}
                        />
                      ),
                    },
                    { key: "Tax", value: "VAT" },
                  ]}
                />
              </ContainerCard>
        </div>

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
                { key: "Primary Contact", value: company?.primary_contact || "-" },
                { key: "Toll Free No", value: company?.toll_free_no || "-" },
                { key: "Module Access", value: company?.module_access || "-" },
                { key: "Service Type", value: company?.service_type || "-" },
                { key: "VAT", value: company?.vat || "-" },
              ]}
            />
          </ContainerCard>

          {/* Address Information */}
          <ContainerCard className="w-full h-fit">
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

          {/* Currency & Misc */}
          <div className="flex flex-wrap gap-x-[20px] mt-[20px]">
            <div className="flex flex-col md:flex-row gap-6 w-full">
              {/* Currency & Region */}
              <ContainerCard className="flex-1 min-w-[320px] max-w-[500px] h-full">
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

              {/* Barcode & Extras */}
             
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
