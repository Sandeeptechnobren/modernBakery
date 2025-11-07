"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { capsCollectionByUuid } from "@/app/services/agentTransaction";
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
  uuid: string;
  code: string;
  customer: string;
  warehouse_code: string;
  warehouse_name: string;
  route_code: string;
  route_name: string;
  salesman_code: string;
  salesman_name: string;
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
  get_outlet_channel: {
            outlet_channel: string,
            outlet_channel_code: string
        },
    get_region: { region_code: string, region_name: string };
    get_area: { area_code: string, area_name: string };
}

const title = "CAPS Collection Details";
const backBtnUrl = "/capsCollection";

export default function ViewPage() {
  const params = useParams();
  const uuid = Array.isArray(params.uuid)
    ? params.uuid[0] || ""
    : (params.uuid as string) || "";

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
    if (!uuid) return;

    const fetchCompanyCustomerDetails = async () => {
      setLoading(true);
      try {
        const res = await capsCollectionByUuid(uuid);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch CAPS Collection Details",
            "error"
          );
          return;
        }
        setCustomer(res.data);
      } catch {
        showSnackbar("Unable to fetch CAPS Collection Details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyCustomerDetails();
  }, [uuid, setLoading, showSnackbar]);

  // Tab logic
  const [activeTab, setActiveTab] = useState("overview");
  const tabList = [
    { key: "overview", label: "Overview" },
    // { key: "address", label: "Location Info" },
    // { key: "financial", label: "Financial Info" },
    // { key: "guarantee", label: "Guarantee Info" },
    // { key: "additional", label: "Additional Info" },
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
 {/* <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
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
                                                {customer?.customer_code || "-"} - {customer?.owner_name || "-"} 
                                             </h2>
                                             <span className="flex items-center">
                                                 <span className="text-[#414651] text-[16px]">
                                                    <Icon
                                                        icon="mdi:location"
                                                        width={16}
                                                        className="text-[#EA0A2A] mr-[5px]"
                                                    />
                                                    <span className="mb-[10px]">
                                                        {customer?.district || "-"}
                                                    </span>
                                                 </span>
                                             </span>
                                         </div>
                                     </div>
                       <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                                                         <StatusBtn isActive={customer?.status === 1} />
                                                     </span>
                                   
                                 </ContainerCard> */}
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
                title="Basic Information"
                data={[
                  { key: "Code", value: customer?.code || "-" },
                  { key: "Warehouse Code", value: customer?.warehouse_code || "-" },
                  { key: "Warehouse Name", value: customer?.warehouse_name || "-" },
                  { key: "Route Code", value: customer?.route_code || "-" },
                  { key: "Route Name", value: customer?.route_name || "-" },
                  { key: "Salesman Code", value: customer?.salesman_code || "-" },
                  { key: "Salesman Name", value: customer?.salesman_name || "-" },
                  { key: "Customer", value: customer?.customer || "-" },
                  
                ]}
              />
            </ContainerCard>
          )}
          {activeTab === "address" && (
            <ContainerCard className="w-full h-fit">
              <KeyValueData
                title="Location Information"
                data={[
                  { key: "Region Code", value: customer?.get_region?.region_code || "-" },
                                        {
                                            key: "Region Name",
                                            value: customer?.get_region?.region_name || "-",
                                        },
                                        { key: "Sub Region Code", value: customer?.get_area?.area_code || "-" },
                                        {
                                            key: "Sub Region Name",
                                            value: customer?.get_area?.area_name || "-",
                                        },
                                        { key: "Outlet Channel Code", value: customer?.get_outlet_channel?.outlet_channel_code || "-" },
                                        {
                                            key: "Outlet Channel Name",
                                            value: customer?.get_outlet_channel?.outlet_channel || "-",
                                        },
                  { key: "Road / Street", value: customer?.road_street || "-" },
                  { key: "Town", value: customer?.town || "-" },
                  { key: "Landmark", value: customer?.landmark || "-" },
                  { key: "District", value: customer?.district || "-" },
                ]}
              />
              {customer?.latitude && customer?.longitude && (
                                    <Map latitude={customer.latitude} longitude={customer.longitude} title="Customer Location" />
                                )}
            </ContainerCard>
          )}
          {activeTab === "financial" && (
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
          )}
          {activeTab === "guarantee" && (
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
          )}
          {activeTab === "additional" && (
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
                {/* <ContainerCard className="flex-1 min-w-[320px] max-w-[500px] h-full">
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
                </ContainerCard> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

