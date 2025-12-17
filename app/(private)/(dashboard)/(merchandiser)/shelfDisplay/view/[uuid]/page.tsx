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
import { damageList, deleteModelStock, expiryList, getShelfById, modelStockList, viewStockList } from "@/app/services/merchandiserApi";

import Loading from "@/app/components/Loading";
import KeyValueData from "@/app/components/keyValueData";
import Table, { TableDataType } from "@/app/components/customTable";
import { formatDate } from "@/app/(private)/(dashboard)/(master)/salesTeam/details/[uuid]/page";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

export const tabs = [
  { name: "Overview" },
  { name: "Customer" },
  { name: "Model Stock" },
  { name: "View Stock" },
  { name: "Damage" },
  { name: "Expiry" },
];

interface Customer {
  uuid: number;
  customer_code: string;
  customer_type: string;
  owner_name: string;
}

interface Merchandiser {
  uuid: number;
  osa_code: string;
  type: string;
  name: string;
}

interface Shelf {
  uuid: string;
  shelf_name: string;
  logo?: string | null;
  height?: number;
  width?: number;
  depth?: number;
  valid_from?: string;
  valid_to?: string;
  status?: string | number;
  customers?: Customer[];
  code: string;
  merchandisers?: Merchandiser[];
}

export default function Page() {
  const { uuid } = useParams<{ uuid: string }>();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shelfData, setShelfData] = useState<Shelf | null>(null);

  const onTabClick = (index: number) => setActiveTab(index);

  const backBtnUrl = "/shelfDisplay/";

  // ✅ FETCH SHELF DATA (clean + single)
  useEffect(() => {
    if (!uuid) return;

    const fetchShelfData = async () => {
      try {
        setLoading(true);
        const res = await getShelfById(uuid.toString());
        const data = res?.data?.data || res?.data;

        if (!data) {
          showSnackbar("Unable to fetch shelf details", "error");
          return;
        }

        setShelfData(data);
      } catch (error) {
        console.error("Error fetching shelf data:", error);
        showSnackbar("Unable to fetch shelf details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchShelfData();
  }, [uuid, showSnackbar]);

  const handleDeleteModelStock = async (uuid: string) => {
    try {
      const res = await deleteModelStock(uuid);
      if (res.error) {
        showSnackbar(res.data?.message || "Delete failed", "error");
        return;
      }
      showSnackbar("Model stock deleted successfully", "success");
    } catch {
      showSnackbar("Something went wrong", "error");
    }
  };


  const renderRemainingDays = () => {
    if (!shelfData?.valid_to) return null;
    const today = new Date();
    const validTo = parseISO(shelfData.valid_to);
    const diff = differenceInDays(validTo, today);

    return diff <= 0
      ? "Expired"
      : `${diff} day${diff !== 1 ? "s" : ""} remaining`;
  };

  if (loading) return <Loading />;

  if (!shelfData)
    return <div className="text-red-500">No shelf data available</div>;

  return (
    <>
      {/* Back Button + Title */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">Shelf Details</h1>
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
                {shelfData.shelf_name || "-"}
              </h1>

              {shelfData.customers && shelfData.customers.length > 0 && (
                <>
                  <span className="text-sm font-medium text-gray-700">
                    Owner: {shelfData.customers[0].owner_name}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    Customers: {shelfData.customers.length}
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
            {shelfData.code || "SHELF-001"}
          </h2>

          {/* Expired */}
          {shelfData.valid_to &&
            differenceInDays(parseISO(shelfData.valid_to), new Date()) <= 0 && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium text-red-700 border border-red-400 bg-red-50">
                <span className="text-red-600">•</span>
                Expired
              </span>
            )}

          {/* Remaining Days */}
          {shelfData.valid_to &&
            differenceInDays(parseISO(shelfData.valid_to), new Date()) > 0 && (
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
                  { key: "Shelf Name", value: shelfData?.shelf_name || "-" },
                  { key: "Height", value: shelfData?.height || "-" },
                  { key: "Width", value: shelfData?.width || "-" },
                  { key: "Depth", value: shelfData?.depth || "-" },
                  {
                    key: "Valid From",
                    value: shelfData?.valid_from ? formatDate(shelfData.valid_from) : "-",
                  },
                  {
                    key: "Valid To",
                    value: shelfData?.valid_to ? formatDate(shelfData.valid_to) : "-",
                  }

                ]}
              />
            </ContainerCard>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* --- Merchandisers Section --- */}
          <div className="flex-1">
            <ContainerCard>
              <h1 className="text-lg font-semibold text-gray-800 mb-3">
                Merchandiser Information
              </h1>
              {shelfData.merchandisers && shelfData.merchandisers.length > 0 ? (
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-700 font-semibold">
                    <tr>
                      <th className="text-left px-4 py-2 border-b">OSA Code</th>
                      <th className="text-right px-4 py-2 border-b">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shelfData.merchandisers.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b-gray-300 border-b last:border-b-0 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 text-left py-3">
                          {item?.osa_code || "-"}
                        </td>
                        <td className="px-4 text-right py-3">
                          {item?.name || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-sm">
                  No merchandiser data available.
                </p>
              )}
            </ContainerCard>
          </div>

          {/* --- Customers Section --- */}
          <div className="flex-1">
            <ContainerCard>
              <h1 className="text-lg font-semibold text-gray-800 mb-3">
                Customer Information
              </h1>
              {shelfData.customers && shelfData.customers.length > 0 ? (
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-700 font-semibold">
                    <tr>
                      <th className="text-left px-4 py-2 border-b">
                        Customer Code
                      </th>
                      <th className="text-right px-4 py-2 border-b">
                        Bussiness Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shelfData.customers.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b-gray-300 border-b last:border-b-0 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 text-left py-3">
                          {item?.customer_code || "-"}
                        </td>
                        <td className="px-4 text-right py-3">
                          {item?.owner_name || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-sm">No customer data available.</p>
              )}
            </ContainerCard>
          </div>
        </div>
      )}
      {activeTab === 2 && (
        <Table
          config={{
            api: {
              list: async (page: number = 1, pageSize: number = 50) => {
                const res = await modelStockList({
                  page: page.toString(),
                  per_page: pageSize.toString(),
                });

                if (res.error) {
                  throw new Error(res.data?.message || "Unable to fetch model stock");
                }

                const list = res.data || [];

                const tableData = list.map((item: any) => ({
                  id: item.id,
                  uuid: item.uuid,
                  item_code: item?.item?.code || "",
                  item_name: item?.item?.name || "",
                  item_uom: item?.item?.uom || "-",
                  capacity: item.capacity || "0",
                  total_no_of_fatching: item.total_no_of_fatching || "0",
                }));

                return {
                  data: tableData,
                  total: res.pagination?.last_page || 1,
                  currentPage: res.pagination?.current_page || 1,
                  pageSize: res.pagination?.per_page || pageSize,
                };
              }

            },
            header: {
              title: "Model Stock List",
              actions: [
                <SidebarBtn
                  key="name"
                  href="/shelfDisplay/view/addUpdate/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                  isActive
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            table: {
              height: "400px"
            },
            columns: [
              { key: "item_code", label: "Item Code" },
              {
                key: "item_name",
                label: "Item Name",
                render: (row) => (
                  <>
                    {row.item_name}
                  </>
                )
              },
              { key: "item_uom", label: "UOM" },
              { key: "capacity", label: "Quantity" },
              { key: "total_no_of_fatching", label: "Total No. Of Facing" },
            ],
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableDataType;
                  router.push(`/shelfDisplay/view/addUpdate/${row.uuid}`);
                },
              },
              {
                icon: "lucide:trash",
                onClick: (data: object) => {
                  const row = data as TableDataType;
                  handleDeleteModelStock(row.uuid);
                },
              }
            ],
            pageSize: 50
          }}
        />
      )}
      {activeTab === 3 && (
        <Table
          config={{
            api: {
              list: async (page: number = 1, pageSize: number = 50) => {
                const res = await modelStockList({
                  page: page.toString(),
                  per_page: pageSize.toString(),
                });

                if (res.error) {
                  throw new Error(res.data?.message || "Unable to fetch model stock");
                }

                const list = res.data || [];

                const tableData = list.map((item: any) => ({
                  id: item.id,
                  uuid: item.uuid,
                  item_code: item?.item?.code || "",
                  item_name: item?.item?.name || "",
                  item_uom: item?.item?.uom || "-",
                  capacity: item.capacity || "0",
                  total_no_of_fatching: item.total_no_of_fatching || "0",
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
              { key: "merchandisher_name", label: "merchandisher_name" },
              { key: "customer_code", label: "Customer Code" },
              { key: "customer_name", label: "Customer Name" },
              { key: "item_code", label: "Item Code" },
              { key: "item_name", label: "Item Name" },
              { key: "capacity", label: "Capacity" },
              { key: "good_salable", label: "Good Saleable" },
              { key: "is_out_of_stock", label: "Out Of Stock" },
            ],
            pageSize: 50
          }}
        />
      )}
      {activeTab === 4 && (
        <Table
          config={{
            api: {
              list: async (page: number = 1, pageSize: number = 50) => {
                const res = await damageList({
                  page: page.toString(),
                  per_page: pageSize.toString(),
                });

                if (res.error) {
                  throw new Error(res.data?.message || "Unable to fetch sales data");
                }

                const list = res.data || [];

                // map API data to table row format
                const tableData = list.map((item: any) => ({
                  id: item.id,
                  date: item.date,
                  merchandisher_name: item.merchandisher_name,
                  customer_code: item.customer_code,
                  customer_name: item.customer_name,
                  shelf_id: item.shelf_id,
                  item_code: item.item_code,
                  item_name: item.item_name,
                  damage_qty: item.damage_qty,
                  expiry_qty: item.expiry_qty,
                  salable_qty: item.salable_qty,
                }));

                return {
                  data: tableData,
                  total: res.pagination?.last_page || 1,
                  currentPage: res.pagination?.current_page || 1,
                  pageSize: res.pagination?.per_page || pageSize,
                };
              }

            },
            footer: { nextPrevBtn: true, pagination: true },
            table: {
              height: "400px"
            },
            columns: [
              { key: "date", label: "Date", render: (item: any) => formatDate(item.date) },
              { key: "merchandisher_name", label: "merchandisher_name" },
              { key: "customer_code", label: "Customer Code" },
              { key: "customer_name", label: "Customer Name" },
              { key: "shelf_id", label: "Distribution Name" },
              { key: "item_code", label: "Item Code" },
              { key: "item_name", label: "Item Name" },
              { key: "damage_qty", label: "Damage" },
              { key: "expiry_qty", label: "Expiry" },
              { key: "salable_qty", label: "Saleable Item" },
            ],
            pageSize: 50
          }}
        />
      )}
      {activeTab === 5 && (
        <Table
          config={{
            api: {
              list: async (page: number = 1, pageSize: number = 50) => {
                const res = await expiryList({
                  page: page.toString(),
                  per_page: pageSize.toString(),
                });

                if (res.error) {
                  throw new Error(res.data?.message || "Unable to fetch sales data");
                }

                const list = res.data || [];

                // map API data to table row format
                const tableData = list.map((item: any) => ({
                  id: item.id,
                  date: item.date,
                  merchandisher_name: item.merchandisher_name,
                  customer_code: item.customer_code,
                  customer_name: item.customer_name,
                  shelf_id: item.shelf_id,
                  item_code: item.item_code,
                  item_name: item.item_name,
                  item_uom: item.item_uom,

                  quantity: item.qty,
                  expiry_date: item.expiry_date,
                }));


                return {
                  data: tableData,
                  total: res.pagination?.last_page || 1,
                  currentPage: res.pagination?.current_page || 1,
                  pageSize: res.pagination?.per_page || pageSize,
                };
              }

            },
            footer: { nextPrevBtn: true, pagination: true },
            table: {
              height: "400px"
            },
            columns: [
              { key: "date", label: "Date", render: (item: any) => formatDate(item.date) },
              { key: "merchandisher_name", label: "Merchandiser" },
              { key: "customer_code", label: "Customer Code" },
              { key: "customer_name", label: "Customer Name" },
              { key: "item_code", label: "Item Code" },
              { key: "item_name", label: "Item Name" },
              { key: "quantity", label: "Quantity" },
              { key: "shelf_id", label: "Distribution Name" },
              { key: "expiry_date", label: "Expiry Date", render: (item: any) => formatDate(item.expiry_date) },
            ],
            pageSize: 50
          }}
        />
      )}
    </>
  );
}
