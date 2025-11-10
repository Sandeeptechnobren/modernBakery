"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
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
import TabBtn from "@/app/components/tabBtn";
import Map from "@/app/components/map";
import SummaryCard from "@/app/components/summaryCard";

interface CustomerItem {
  id: number;
  sap_code: string;
  osa_code: string;
  business_name: string;
  company_type: string;
  language: string;
  contact_number?: string;
  business_type: string;
  town: string;
  landmark: string;
  district: string;
  get_region: { id: number; region_code: string; region_name: string; }
  get_area: { id: number; area_code: string; area_name: string; }
  payment_type: string;
  creditday: string;
  tin_no: string;
  creditlimit: number;
  totalcreditlimit: number;
  credit_limit_validity?: string;
  bank_guarantee_name: string;
  bank_guarantee_amount: number;
  bank_guarantee_from: string;
  bank_guarantee_to: string;
  distribution_channel_id: string;
  merchendiser_ids: string;
  status: string;
}

const title = "Company Customer Details";
const backBtnUrl = "/companyCustomer";
export function getPaymentType(value: string): string {
  switch (value) {
    case "1":
      return "Cash";
    case "2":
      return "Cheque";
    case "3":
      return "Transfer";
    default:
      return "UNKNOWN";
  }
}
export default function ViewPage() {
  const params = useParams();
  const id = Array.isArray(params.id)
    ? params.id[0] || ""
    : (params.id as string) || "";

  const [customer, setCustomer] = useState<CustomerItem | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

   const onTabClick = (idx: number) => {
    // ensure index is within range and set the corresponding tab key
    if (typeof idx !== "number") return;
    if (typeof tabList === "undefined" || idx < 0 || idx >= tabList.length) return;
    setActiveTab(tabList[idx].key);
  };

  useEffect(() => {
    if (!id) return;

    const fetchCompanyCustomerDetails = async () => {
      setLoading(true);
      try {
        const res = await getCompanyCustomerById(id);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch company customer details",
            "error"
          );
          return;
        }
        console.log(res)
        setCustomer(res.data);
      } catch {
        showSnackbar("Unable to fetch company customer details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyCustomerDetails();
  }, [id, setLoading, showSnackbar]);

  // Tab logic
  const [activeTab, setActiveTab] = useState("overview");
  const tabList = [
    { key: "overview", label: "Overview" },
    { key: "address", label: "Location Info" },
    { key: "financial", label: "Financial Info" },
    { key: "guarantee", label: "Guarantee Info" },
    { key: "additional", label: "Additional Info" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>
 <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
                                     {/* profile details */}
                                     <div className="flex flex-col sm:flex-row items-center gap-[20px]">
                                         <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
                                             <Icon
                                                 icon="lucide:user"
                                                 width={40}
                                                 className="text-[#535862] scale-[1.5]"
                                             />
                                         </div>
                                         <div className="text-center sm:text-left">
                                             <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
                                                 {customer?.osa_code} - {customer?.business_name }
                                             </h2>
                                            
                                         </div>
                                     </div>
                       <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                                                         <StatusBtn isActive={customer?.status === "1"} />
                                                     </span>
                                   
                                 </ContainerCard>
      <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
       
         

        <div className="w-full flex flex-col">
          <div className="flex ">
           
            <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
                        {tabList.map((tab, index) => (
                          <div key={index}>
                            <TabBtn
                              label={tab.label}
                              isActive={activeTab === tab.key}
                              onClick={() => onTabClick(index)}
                            />
                          </div>
                        ))}
                      </ContainerCard>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <ContainerCard className="w-full h-fit">
              <KeyValueData
                title="Customer Information"
                data={[
                  { key: "SAP Code", value: customer?.sap_code || "-" },
                  { key: "Language", value: customer?.language || "-" },
                  { key: "Contact No.", value: customer?.contact_number || "-" },
                ]}
              />
            </ContainerCard>
          )}
          {activeTab === "address" && (
            <ContainerCard className="w-full h-fit">
              <KeyValueData
                title="Location Information"
                data={[
                  { key: "Region", value: `${customer?.get_region?.region_code} - ${customer?.get_region?.region_name }` || "-" },
                                       
                                        { key: "Sub Region ", value: `${customer?.get_area?.area_code} - ${customer?.get_area?.area_name}` || "-" },
                                        
                                       
                  { key: "Town", value: customer?.town || "-" },
                  { key: "Landmark", value: customer?.landmark || "-" },
                  { key: "District", value: customer?.district || "-" },
                ]}
              />
              
            </ContainerCard>
          )}
          {activeTab === "financial" && (
            <ContainerCard className="w-full h-fit">
              <KeyValueData
                title="Financial Information"
                data={[
                  { key: "Payment Type", value:getPaymentType(customer?customer.payment_type:"")|| "-" },
                  { key: "Credit Days", value: customer?.creditday || "-" },
                  { key: "Credit Limit", value: customer?.creditlimit?.toString() || "-" },
                  { key: "Total Credit Limit", value: customer?.totalcreditlimit?.toString() || "-" },
                  { key: "Credit Limit Validity", value: customer?.credit_limit_validity || "-" },
                ]}
              />
            </ContainerCard>
          )}
          {activeTab === "guarantee" && (
            <ContainerCard className="w-full h-fit">
              <KeyValueData
                title="Guarantee Details"
                data={[
                  { key: "Guarantee Name", value: customer?.bank_guarantee_name || "-" },
                  { key: "Guarantee Amount", value: customer?.bank_guarantee_amount?.toString() || "-" },
                  { key: "Guarantee From", value: customer?.bank_guarantee_from || "-" },
                  { key: "Guarantee To", value: customer?.bank_guarantee_to || "-" },
                ]}
              />
            </ContainerCard>
          )}
          {activeTab === "additional" && (
            <div className="flex flex-wrap gap-x-[20px] mt-[20px]">
              <div className="flex flex-col md:flex-row gap-6 w-full">
                <ContainerCard className="flex-1 min-w-[320px] max-w-[500px] h-full">
                  <KeyValueData
                    title="Tax & Accuracy"
                    data={[
                      { key: "TIN No", value: customer?.tin_no || "-" },
                      { key: "VAT No", value: customer?.tin_no || "-" },
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
                      // title={customer?.customer_code || "CUST-1234"}
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
                        key: "Distribution Channel ID",
                        value: customer?.distribution_channel_id?.toString() || "-",
                      },
                    ]}
                  />
                </ContainerCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

