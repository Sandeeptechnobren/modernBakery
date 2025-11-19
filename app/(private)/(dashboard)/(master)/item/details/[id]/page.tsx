"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { itemById, itemReturn, itemSales } from "@/app/services/allApi";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Link from "next/link";
import KeyValueData from "@/app/components/keyValueData";
import Image from "next/image";
import StatusBtn from "@/app/components/statusBtn2";
import { useLoading } from "@/app/services/loadingContext";
import Table, { TableDataType } from "@/app/components/customTable";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";

interface Item {
  id?: number;
  erp_code?: string;
  item_code?: string;
  name?: string;
  description?: string;
  brand?: { name: string };
  image?: string;
  shelf_life?: string;
  commodity_goods_code?: string;
  excise_duty_code?: string;
  status?: number;
  is_taxable?: boolean;
  has_excies?: boolean;
  item_weight?: string;
  volume?: number;
  item_category?: {
    id?: number;
    category_name?: string;
    code?: string;
  };
  item_sub_category?: {
    id?: number;
    name?: string;
    code?: string;
  };
  item_uoms: {
    id: number,
    item_id: number,
    name: string,
    uom_type: string,
    upc: string,
    uom_price: string,
    is_stock_keeping: boolean,
    enable_for: string,
    status: string,

    keeping_quantity: number,
    uom_id: number
  }[]
}

interface UOM {
  id: number;
  name: string;
  price: string;
  uom_type: string;
  upc: string | null;
  is_stock_keeping_unit: boolean;
  enable_for: string;
}

export const tabList = [
  { name: "Overview", key: "overview" },
  { name: "UOM", key: "uom" },
  { name: "Sales", key: "sales" },
  { name: "Market Return", key: "return" }
];

export default function Page() {
  const [uomList, setUomList] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const { id, tabName } = useParams();
  const { setLoading } = useLoading();
  const [item, setItem] = useState<Item | null>(null);

  const { showSnackbar } = useSnackbar();

  const onTabClick = (idx: number) => {
    if (typeof idx !== "number") return;
    if (typeof tabList === "undefined" || idx < 0 || idx >= tabList.length) return;
    setActiveTab(tabList[idx].key);
  };

  const title = "Item Details";
  const backBtnUrl = "/item";

  useEffect(() => {
    if (!id) return;

    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        setLoading(true);
        const res = await itemById(id.toString());
        setLoading(false);
        console.log(res, "res")

        if (res.error) {
          showSnackbar(res.data?.message || "Unable to fetch item details", "error");
          return;
        }
        setItem(res.data);
      } catch {
        showSnackbar("Unable to fetch item details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id, showSnackbar]);



  return (
    <>
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      {/* Main Layout */}
      <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-[20px]">
          <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB] overflow-hidden">
            <img
              src={item?.image ? item.image : "/no-image.png"}
              alt={item?.name || "item"}
              // width={40}
              // height={40}
              className="w-full object-cover rounded-full border border-[#E4E4E4] bg-[#E9EAEB] scale-[1.5]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/no-image.png";
              }}
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
              {item?.erp_code || "-"} - {item?.name || "-"}
            </h2>
            <span className="flex items-center text-[#414651] text-[16px]">
            </span>
          </div>
        </div>
        <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
          <StatusBtn isActive={String(item?.status) > "0"} />
        </span>
      </ContainerCard>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side - Image Section */}
        {/* <div className="md:w-[350px] flex-shrink-0">
            <ContainerCard className="p-[20px] flex flex-col gap-y-[20px]">
            <img
              src={item?.image ? item.image : "/no-image.png"}
              alt={item?.name || "item"}
              className="w-full h-[200px] object-cover rounded-md border border-[#E4E4E4] bg-[#E9EAEB]"
              onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/no-image.png";
              }}
            />
            <span className="text-[#181D27] text-[20px] font-semibold text-center">
              {item?.item_code || "-"} - {item?.name}
            </span>
            <div className="flex justify-center">
              <StatusBtn isActive={item?.status === 1} />
            </div>
            </ContainerCard>
        </div> */}

        {/* Right Side - Description, Tabs, and Tab Content */}
        <div className="flex-1 flex flex-col gap-y-[5px]">
          {/* {item?.description && (
            <ContainerCard className="w-full">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {item.description}
              </p>
            </ContainerCard>
          )} */}

          {/* Tabs */}
          <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
            {tabList.map((tab, index) => (
              <div key={index}>
                <TabBtn
                  label={tab.name}
                  isActive={activeTab === tab.key}
                  onClick={() => onTabClick(index)}
                />
              </div>
            ))}
          </ContainerCard>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">

              {/* Right Section */}
              <div className="w-full flex flex-col gap-y-[15px]">

                <ContainerCard className="w-full h-fit">
                  <KeyValueData
                    title="Item Information"
                    data={[
                      { key: "ERP Code", value: item?.erp_code || "-" },
                      { key: "Brand", value: item?.brand?.name || "-" },
                      {
                        key: "Category",
                        value: item?.item_category?.category_name
                          ? `${item.item_category.category_name}`
                          : "-",
                      },
                      {
                        key: "Sub Category",
                        value: item?.item_sub_category?.name
                          ? `${item.item_sub_category.name}`
                          : "-",
                      },
                      { key: "Shelf Life", value: item?.shelf_life || "-" },
                      { key: "Commodity Goods Code", value: item?.commodity_goods_code || "-" },
                      { key: "Excise Duty Code", value: item?.excise_duty_code || "-" },
                      { key: "Item Weight", value: item?.item_weight || "-" },
                      { key: "Volume", value: item?.volume?.toString() || "-" },
                      {
                        key: "Taxable",
                        value: item?.is_taxable ? "Yes" : "No",
                      },
                      {
                        key: "Has Excise",
                        value: item?.has_excies ? "Yes" : "No",
                      },
                    ]}
                  />
                </ContainerCard>
              </div>
            </div>
          )}
          {activeTab === "uom" && (
            item?.item_uoms.map((singleItem, index) => {

              return (<ContainerCard key={index} className="w-full p-5">

                <h3 className="text-md font-semibold text-gray-800 mb-2">
                  {singleItem?.uom_type || "UOM"}
                </h3>

                <div className="space-y-1 text-gray-700 text-sm">
                  <p>
                    <strong>Name:</strong> {singleItem?.name || "-"}
                  </p>
                  <p>
                    <strong>Price:</strong> {toInternationalNumber(singleItem?.uom_price) || "0.00"}
                  </p>
                  <p>
                    <strong>UPC:</strong> {singleItem?.upc || "N/A"}
                  </p>
                  <p>
                    <strong>Enable For:</strong> {singleItem?.enable_for || "-"}
                  </p>
                  <p>
                    <strong>Stock Keeping Unit:</strong>{" "}
                    {singleItem?.is_stock_keeping ? "Yes" : "No"}
                  </p>
                </div>
              </ContainerCard>)

            })
          )}
          {activeTab === "sales" && (
            <Table
              config={{
                api: {
                  list: async (page: number = 1, pageSize: number = 50) => {
                    const res = await itemSales(String(item?.id), { page: page.toString(), per_page: pageSize.toString() });
                    if (res.error) {
                      // showSnackbar(res.data?.message || "Unable to fetch sales data", "error");
                      throw new Error(res.data?.message || "Unable to fetch sales data");
                    }
                    return {
                      data: res.data || [],
                      total: res.pagination?.totalPages || 1,
                      currentPage: res.pagination?.page || 1,
                      pageSize: res.pagination?.pageSize || pageSize,
                    };
                  }
                },
                footer: { nextPrevBtn: true, pagination: true },
                table: {
                  height: "400px"
                },
                columns: [
                  { key: "invoice_code", label: "Invoice Code" },
                  { key: "item_name", label: "Item Name", render: (row: TableDataType) => <>{row.item_code ? row.item_code : ""}{row.item_code && row.item_name ? " - " : ""}{row.item_name ? row.item_name : ""}</> },
                  // { key: "name", label: "UOM", render: (row: TableDataType) => <>{(typeof row?.name === "object" && (row?.name as { name: string })?.name) ?? row?.name ?? row.uom_id}</> },
                  { key: "itemvalue", label: "Quantity" },
                                    { key: "item_price", label: "Price", render: (row: TableDataType) => <>{toInternationalNumber(row.itemvalue)}</> }

                ],
                pageSize: 50
              }}
            />
          )}
          {activeTab === "return" && (
            <Table
              config={{
                // api: {
                //   list: async (page: number = 1, pageSize: number = 50) => {
                //     const res = await itemReturn(String(item?.id), { page: page.toString(), per_page: pageSize.toString() });
                //     if (res.error) {
                //       // showSnackbar(res.data?.message || "Unable to fetch Return data", "error");
                //       throw new Error(res.data?.message || "Unable to fetch Return data");
                //     }
                //     return {
                //       data: res.data || [],
                //       total: res.pagination?.totalPages || 1,
                //       currentPage: res.pagination?.page || 1,
                //       pageSize: res.pagination?.pageSize || pageSize,
                //     };
                //   }
                // },
                footer: { nextPrevBtn: true, pagination: true },
                table: {
                  height: "400px"
                },
                columns: [
                  { key: "header_code", label: "Return Code" },
                  { key: "item_name", label: "Item Name", render: (row: TableDataType) => <>{row.item_code ? row.item_code : ""}{row.item_code && row.item_name ? " - " : ""}{row.item_name ? row.item_name : ""}</> },
                  // { key: "uom_id", label: "UOM", render: (row: TableDataType) => <>{ (typeof row?.uom_id === "object" && (row?.uom_id as {name: string})?.name) ?? row?.uom ?? row.uom_id}</>},
                  { key: "name", label: "UOM" },
                  { key: "item_quantity", label: "Quantity" },
                  { key: "item_price", label: "Price", render: (row: TableDataType) => <>{toInternationalNumber(row.item_price)}</> }
                ],
                pageSize: 50
              }}
              data={[]}
            />
          )}
        </div>
      </div>
    </>
  );
}
