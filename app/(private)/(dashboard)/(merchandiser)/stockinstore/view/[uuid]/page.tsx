"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { stockInStoreById } from "@/app/services/merchandiserApi";

import Loading from "@/app/components/Loading";
import KeyValueData from "@/app/components/keyValueData";
import Table, { configType, TableDataType } from "@/app/components/customTable";
import { formatDate } from "@/app/(private)/(dashboard)/(master)/salesTeam/details/[uuid]/page";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { customer } from "@/app/(private)/data/customerDetails";
import Drawer from "@mui/material/Drawer";
import { inventoryPostByStock } from "@/app/services/assetsApi";

export const tabs = [
  { name: "Overview" },
  { name: "Assign Inventory" },
  { name: "View Inventory Post" },
];

interface StockInStoreItem {
  id: number | string;
  uuid: string;
  code: string;
  activity_name: string;
  assign_customers: Array<{
    id: number | string;
    code: string;
    name: string;
  }>;
  date_range: {
    from: string;
    to: string;
  };
  inventories: Array<{
    id: number | string;
    uuid: string;
    item: {
      id: number | string;
      name: string;
    };
    item_uom: {
      id: number | string;
      uom: string;
    }
    capacity: number;
    osa_code?: string;
    name?: string;
  }>;
}

export default function Page() {
  const { uuid } = useParams<{ uuid: string }>();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stockInStoreItem, setStockInStoreItem] = useState<StockInStoreItem | null>(null);
  const [openPopup, setOpenPopup] = useState(false);
  const onTabClick = (index: number) => setActiveTab(index);

  const backBtnUrl = "/stockinstore";

  const viewPopuop = () => {
    setOpenPopup(true);
  }

  const customerColumns: configType["columns"] = [
    {
      key: "name",
      label: "Customer Name",
      render: (row: any) => row.name || "-",
    },
    {
      key: "code",
      label: "Customer Code",
      render: (row: any) => row.code || "-",
    },
  ];


  // ✅ FETCH SHELF DATA (clean + single)
  useEffect(() => {
    if (!uuid) return;

    const fetchShelfData = async () => {
      try {
        setLoading(true);
        const res = await stockInStoreById(uuid.toString());
        const data = res?.data?.data || res?.data;

        if (!data) {
          showSnackbar("Unable to fetch stock details", "error");
          return;
        }

        setStockInStoreItem(data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
        showSnackbar("Unable to fetch stock details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchShelfData();
  }, [uuid, showSnackbar]);

  const renderRemainingDays = () => {
    if (!stockInStoreItem?.date_range?.to) return null;
    const today = new Date();
    const validTo = parseISO(stockInStoreItem.date_range.to);
    const diff = differenceInDays(validTo, today);

    return diff <= 0
      ? "Expired"
      : `${diff} day${diff !== 1 ? "s" : ""} remaining`;
  };

  if (loading) return <Loading />;

  if (!stockInStoreItem)
    return <div className="text-red-500">No stock in store data available</div>;

  return (
    <>
      {/* Back Button + Title */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">Stock In Store Details</h1>
      </div>

      {/* SHELF HEADER */}
      <div className="flex flex-row align-middle items-center md:flex-row justify-between p-5 border border-gray-200 my-5 rounded-lg bg-white shadow-sm">
        {/* Info */}
        <div className="flex flex-row items-center gap-4 bg-gray-50 rounded-lg p-2">
          <Image
            src="/shelves.png"
            alt="Shelf Icon"
            width={56}
            height={56}
            className="h-[50px] w-[50px] object-cover rounded-full border border-gray-300 bg-gray-100 p-0.5"
          />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <div className="flex flex-col justify-center">
              <h1 className="font-semibold text-lg md:text-xl text-gray-900">
                {stockInStoreItem.code || "-"}
              </h1>

              {stockInStoreItem.assign_customers && stockInStoreItem.assign_customers.length > 0 && (
                <>
                  <span className="text-sm font-medium text-gray-700">
                    Customers: {stockInStoreItem.assign_customers.length}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Shelf Code + Status */}
        <div className="p-2 rounded-lg flex flex-col items-start min-w-max bg-gray-50">
          <h1 className="text-xs text-gray-500 uppercase">Shelf Code</h1>
          <h2 className="text-lg font-semibold text-gray-900">
            {stockInStoreItem.code || "SHELF-001"}
          </h2>

          {/* Expired */}
          {stockInStoreItem.date_range.to &&
            differenceInDays(parseISO(stockInStoreItem.date_range.to), new Date()) <= 0 && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium text-red-700 border border-red-400 bg-red-50">
                <span className="text-red-600">•</span>
                Expired
              </span>
            )}

          {/* Remaining Days */}
          {stockInStoreItem.date_range.to &&
            differenceInDays(parseISO(stockInStoreItem.date_range.to), new Date()) > 0 && (
              <span className="text-sm font-medium text-gray-600">
                {renderRemainingDays()}
              </span>
            )}
        </div>
      </div>

      {/* TABS */}
      <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
        {tabs.map((tab, index) => (
          <TabBtn
            key={index}
            label={tab.name}
            isActive={activeTab === index}
            onClick={() => onTabClick(index)}
          />
        ))}
      </ContainerCard>

      {/* TAB CONTENT */}
      {activeTab === 0 && (
        <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
          <div className="w-full flex flex-col gap-y-[20px]">
            <ContainerCard className="w-full h-fit">
              <KeyValueData
                title="Shelf Details"
                data={[
                  { key: "Name", value: stockInStoreItem?.activity_name || "-" },
                  {
                    key: "Customers", value: <span className="hover:text-red-500 cursor-pointer">View Customers</span>,
                    onClick: viewPopuop
                  },
                  {
                    key: "From",
                    value: stockInStoreItem?.date_range.from ? formatDate(stockInStoreItem.date_range.from) : "-",
                  },
                  {
                    key: "To",
                    value: stockInStoreItem?.date_range.to ? formatDate(stockInStoreItem.date_range.to) : "-",
                  }

                ]}
              />
            </ContainerCard>
          </div>
        </div>
      )}
      <Drawer open={openPopup} anchor="right" onClose={() => { setOpenPopup(false); }} >
        <div className="flex flex-col h-full">
          <Table

            data={stockInStoreItem?.assign_customers || []}

            config={{
              table: { height: "100vh" },
              showNestedLoading: true,
              footer: { nextPrevBtn: true, pagination: true },
              columns: customerColumns,

              rowSelection: false,

              pageSize: 50,
            }}
          />
        </div>
      </Drawer>
      <br />
      {activeTab === 1 && (
        <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
          <div className="w-full flex flex-col gap-y-[20px]">
            {stockInStoreItem?.inventories?.length ? (
              stockInStoreItem.inventories.map((inv, index) => (
                <ContainerCard key={inv.uuid || index} className="w-full h-fit">
                  <KeyValueData

                    data={[
                      { key: "Item Name", value: inv.item?.name || "-" },
                      { key: "Item UOM", value: inv.item_uom?.uom || "-" },
                      { key: "Capacity", value: inv.capacity ?? "-" },
                    ]}
                  />
                </ContainerCard>
              ))
            ) : (
              <ContainerCard className="w-full h-fit">
                <p className="text-gray-400 text-sm">No inventories available</p>
              </ContainerCard>
            )}
          </div>
        </div>
      )}
      {activeTab === 2 && (
        <Table
          config={{
            api: {
              list: async (page: number = 1, pageSize: number = 50) => {
                const res = await inventoryPostByStock(uuid, {
                  page: page.toString(),
                  per_page: pageSize.toString(),
                });

                if (res.error) {
                  throw new Error(res.data?.message || "Unable to fetch inventory post");
                }

                const list = res.data || [];

                const tableData = list.map((item: any) => ({
                  id: item.id,
                  uuid: item.uuid,
                  date: item.date,
                  item_code: item?.item_code || "",
                  item_name: item?.item_name || "",
                  customer_code: item.customer_code,
                  customer_name: item.customer_name,
                  uom: item.uom,
                  capacity: item.capacity || "0",
                  good_salable: item.good_salable || "0",
                  refill_qty: item.refill_qty || "0",
                  reorder_qty: item.reorder_qty || "0",
                  fill_qty: item.fill_qty || "0",
                  is_out_of_stock: item.is_out_of_stock || "0",
                }));

                return {
                  data: tableData,

                  // ✅ IMPORTANT FOR PAGINATION
                  total: res.pagination?.last_page ?? 1,
                  currentPage: res.pagination?.current_page ?? page,
                  pageSize: res.pagination?.per_page ?? pageSize,
                  lastPage: res.pagination?.last_page ?? 1,
                };
              }


            },
            footer: { nextPrevBtn: true, pagination: true },
            table: {
              height: "400px"
            },
            columns: [
              { key: "date", label: "Date", render: (item: any) => formatDate(item.date) },
              { key: "item_code", label: "Item Code" },
              { key: "item_name", label: "Item Name" },
              { key: "customer_code", label: "Customer Code" },
              { key: "customer_name", label: "Customer Name" },
              { key: "uom", label: "UOM" },
              { key: "capacity", label: "Capacity" },
              { key: "good_salable", label: "Good Saleable" },
              { key: "refill_qty", label: "Refill Qty" },
              { key: "reorder_qty", label: "Reorder Qty" },
              { key: "fill_qty", label: "Fill Qty" },
              { key: "is_out_of_stock", label: "Out Of Stock" },
            ],
            pageSize: 50
          }}
        />
      )}
    </>
  );
}
