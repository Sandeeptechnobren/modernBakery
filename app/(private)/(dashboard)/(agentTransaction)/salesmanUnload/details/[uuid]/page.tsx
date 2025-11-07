"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { salesmanUnloadHeaderById } from "@/app/services/agentTransaction";
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
  osa_code: string;
  salesman_type: string;
  warehouse:{
    code: string;
    name: string;
};
  route:{
    code: string;
    name: string;
};
  salesman:{
    code: string;
    name: string;
};
  projecttype:{
    code: string;
    name: string;
};
details: Array<{
  id: number;
  uuid: string;
  osa_code: string;
  item: {
    id: number;
    code: string;
    name: string;
  };
  uom: number;
  qty: number;
  price: string;
  status: number;
}>;
  customer_code: string;
  customer: string;
  contact_person: string;
  contact_no1: string;
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
  latitude: string;
  longtitude: string;
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

const title = "Salesman Unload Details";
const backBtnUrl = "/salesmanUnload";

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
        const res = await salesmanUnloadHeaderById(uuid);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch Salesman Unload Details",
            "error"
          );
          return;
        }
        setCustomer(res.data);
      } catch {
        showSnackbar("Unable to fetch Salesman Unload Details", "error");
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
    // { key: "load", label: "Load" },
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
            <div className="flex flex-col md:flex-row gap-5 mt-5">
              <div className="flex-1">
                <ContainerCard className="w-full h-fit">
                  <KeyValueData
                    title="Basic Information"
                    data={[
                      { key: "Code", value: customer?.osa_code || "-" },
                      { key: "Warehouse Code", value: customer?.warehouse?.code || "-" },
                      { key: "Warehouse Name", value: customer?.warehouse?.name || "-" },
                      { key: "Route Code", value: customer?.route?.code || "-" },
                      { key: "Route Name", value: customer?.route?.name || "-" },
                      { key: "Salesman Type", value: customer?.salesman_type|| "-" },
                      { key: "Salesman Code", value: customer?.salesman?.code || "-" },
                      { key: "Salesman Name", value: customer?.salesman?.name || "-" },
                    ]}
                  />
                </ContainerCard>
              </div>
              <div className="flex-1">
                      <ContainerCard className="w-full h-fit">
                       
                 <div className="text-[18px] font-semibold mb-4">{customer?.latitude && customer?.longtitude && (
                    <Map latitude={customer.latitude} longitude={customer.longtitude} title="Unload Location" />
                  )}</div>
                </ContainerCard>
                  
              </div>
            </div>
          )}
          {activeTab === "load" && (
            <ContainerCard className="w-full h-full">
              {customer?.details && customer.details.length > 0 ? (
                customer.details.map((detail, index) => (
                  <KeyValueData
                    key={detail.id || index}
                    title={`Load Item ${index + 1}`}
                    data={[
                      { key: "Code", value: detail.osa_code || "-" },
                      { key: "Item Code", value: detail.item?.code || "-" },
                      { key: "Item Name", value: detail.item?.name || "-" },
                      { key: "UOM", value: detail.uom || "-" },
                      { key: "Qty", value: detail.qty || "-" },
                      { key: "Price", value: detail.price || "-" },
                    ]}
                  />
                ))
              ) : (
                <div className="text-gray-500 text-center py-4">No load details available</div>
              )}
            </ContainerCard>
          )}
          {activeTab === "financial" && (
            <ContainerCard className="w-full h-full">
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

