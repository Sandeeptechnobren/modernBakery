"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { getCompanyCustomerById } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBtn from "@/app/components/statusBtn2";
import Toggle from "@/app/components/toggle";
import SummaryCard from "@/app/components/summaryCard";

interface CustomerItem {
  id: number;
  sap_code: string;
  customer_code: string;
  business_name: string;
  owner_name: string;
  owner_no: string;
  whatsapp_no: string;
  email: string;
  language: string;
  contact_no2: string;
  road_street: string;
  town: string;
  landmark: string;
  district: string;
  balance: number;
  payment_type: string;
  bank_name: string;
  bank_account_number: string;
  creditday: string;
  tin_no: string;
  accuracy: string;
  creditlimit: number;
  guarantee_name: string;
  guarantee_amount: number;
  guarantee_from: string;
  guarantee_to: string;
  totalcreditlimit: number;
  credit_limit_validity: string;
  vat_no: string;
  longitude: string;
  latitude: string;
  threshold_radius: number;
  dchannel_id: number;
  status: number;
}

const title = "Company Customer Details";
const backBtnUrl = "/dashboard/settings/company/companyCustomer";

export default function ViewPage() {
  const params = useParams();
  const id = Array.isArray(params.id)
    ? params.id[0] || ""
    : (params.id as string) || "";

  const [customer, setCustomer] = useState<CustomerItem | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!id) return;

    const fetchCompanyCustomerDetails = async () => {
      setLoading(true);
      try {
        const res = await getCompanyCustomerById(id);
        console.log("dsjfghsdfgsdg", res)
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch company customer details",
            "error"
          );
          return;
        }
        console.log(res)
        setCustomer(res);
      } catch {
        showSnackbar("Unable to fetch company customer details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyCustomerDetails();
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

      <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
        {/* Left Section */}
        <div>
          <ContainerCard className="w-[350px] flex flex-col gap-y-[20px] p-[20px]">
            <span className="text-[#181D27] text-[20px] font-semibold text-center">
              {customer?.business_name || "-"}
            </span>
            <div className="flex justify-center">
              <StatusBtn
                isActive={
                  customer?.status === 1 || customer?.status === 1
                }
              />
            </div>
          </ContainerCard>
        </div>

        {/* Right Section */}
        <div className="w-full flex flex-col gap-y-[20px]">
          {/* Basic Info */}
          <ContainerCard className="w-full h-fit">
            <KeyValueData
              title="Customer Information"
              data={[
                { key: "SAP Code", value: customer?.sap_code || "-" },
                { key: "Customer Code", value: customer?.customer_code || "-" },
                { key: "Business Name", value: customer?.business_name || "-" },
                { key: "Owner Name", value: customer?.owner_name || "-" },
                { key: "Owner Contact No", value: customer?.owner_no || "-" },
                { key: "WhatsApp No", value: customer?.whatsapp_no || "-" },
                { key: "Email", value: customer?.email || "-" },
                { key: "Language", value: customer?.language || "-" },
                { key: "Contact No 2", value: customer?.contact_no2 || "-" },
              ]}
            />
          </ContainerCard>

          {/* Address Info */}
          <ContainerCard className="w-full h-fit">
            <KeyValueData
              title="Address Information"
              data={[
                { key: "Road / Street", value: customer?.road_street || "-" },
                { key: "Town", value: customer?.town || "-" },
                { key: "Landmark", value: customer?.landmark || "-" },
                { key: "District", value: customer?.district || "-" },
                { key: "Latitude", value: customer?.latitude || "-" },
                { key: "Longitude", value: customer?.longitude || "-" },
              ]}
            />
          </ContainerCard>

          {/* Financial Info */}
          <ContainerCard className="w-full h-fit">
            <KeyValueData
              title="Financial Information"
              data={[
                { key: "Balance", value: customer?.balance?.toString() || "-" },
                { key: "Payment Type", value: customer?.payment_type || "-" },
                { key: "Bank Name", value: customer?.bank_name || "-" },
                { key: "Account Number", value: customer?.bank_account_number || "-" },
                { key: "Credit Days", value: customer?.creditday || "-" },
                { key: "Credit Limit", value: customer?.creditlimit?.toString() || "-" },
                { key: "Total Credit Limit", value: customer?.totalcreditlimit?.toString() || "-" },
                { key: "Credit Limit Validity", value: customer?.credit_limit_validity || "-" },
              ]}
            />
          </ContainerCard>

          {/* Guarantee Info */}
          <ContainerCard className="w-full h-fit">
            <KeyValueData
              title="Guarantee Details"
              data={[
                { key: "Guarantee Name", value: customer?.guarantee_name || "-" },
                { key: "Guarantee Amount", value: customer?.guarantee_amount?.toString() || "-" },
                { key: "Guarantee From", value: customer?.guarantee_from || "-" },
                { key: "Guarantee To", value: customer?.guarantee_to || "-" },
              ]}
            />
          </ContainerCard>

          {/* Misc Info */}
          <div className="flex flex-wrap gap-x-[20px] mt-[20px]">
            <div className="flex flex-col md:flex-row gap-6 w-full">
              <ContainerCard className="flex-1 min-w-[320px] max-w-[500px] h-full">
                <KeyValueData
                  title="Tax & Accuracy"
                  data={[
                    { key: "TIN No", value: customer?.tin_no || "-" },
                    { key: "VAT No", value: customer?.vat_no || "-" },
                    { key: "Accuracy", value: customer?.accuracy || "-" },
                  ]}
                />
              </ContainerCard>

              {/* Extra */}
              <ContainerCard className="flex-1 min-w-[320px] max-w-[500px] h-full">
                <div className="text-[18px] font-semibold mb-[25px]">
                  Customer Info
                </div>
                <ContainerCard className="w-full mb-[25px] bg-gradient-to-r from-[#E7FAFF] to-[#FFFFFF]">
                  <SummaryCard
                    icon="prime:barcode"
                    iconCircleTw="bg-[#00B8F2] text-white w-[60px] h-[60px] p-[15px]"
                    iconWidth={30}
                    title={customer?.customer_code || "CUST-1234"}
                    description={"Customer Code"}
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
                    {
                      key: "Threshold Radius",
                      value: customer?.threshold_radius?.toString() || "-",
                    },
                    {
                      key: "DChannel ID",
                      value: customer?.dchannel_id?.toString() || "-",
                    },
                  ]}
                />
              </ContainerCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
