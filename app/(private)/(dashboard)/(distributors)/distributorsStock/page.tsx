"use client";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import TabBtn from "@/app/components/tabBtn";
import Container from "@mui/material/Container";
import React, { useState } from "react";
// import {warehouseOptions} from "@/app/data/warehouseOptions";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table from "@/app/components/customTable";
import { TableDataType } from "@/app/components/customTable";
import OrderStatus from "@/app/components/orderStatus";
import { Icon } from "@iconify-icon/react";


type CardItem = {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  percentage: number;
  isUp: boolean;
};
const tabList = [
  { key: "overview", label: "Overview" },
  { key: "detailedView", label: "Detailed View" },
  // { key: "address", label: "Location Info" },
  // { key: "financial", label: "Financial Info" },
  // { key: "guarantee", label: "Guarantee Info" },
  // { key: "additional", label: "Additional Info" },
];
const columns = [
  { key: "created_at", label: "Order Date", showByDefault: true, render: (row: TableDataType) => <span className="font-bold cursor-pointer">{row.created_at.split("T")[0]}</span> },
  { key: "order_code", label: "Order Number", showByDefault: true, render: (row: TableDataType) => <span className="font-bold cursor-pointer">{row.order_code}</span> },
  {
    key: "warehouse_name",
    label: "Warehouse Name",
    showByDefault: true,
    render: (row: TableDataType) => {
      const code = row.warehouse_code ?? "";
      const name = row.warehouse_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  {
    key: "customer_name",
    label: "Customer Name",
    showByDefault: true,
    render: (row: TableDataType) => {
      const code = row.customer_code ?? "";
      const name = row.customer_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  {
    key: "salesman_name",
    label: "Salesman Name",
    render: (row: TableDataType) => {
      const code = row.salesman_code ?? "";
      const name = row.salesman_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  {
    key: "route_name",
    label: "Route Name",
    render: (row: TableDataType) => {
      const code = row.route_code ?? "";
      const name = row.route_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  { key: "payment_method", label: "Payment Method", render: (row: TableDataType) => row.payment_method || "-" },
  { key: "order_source", label: "Order Source", render: (row: TableDataType) => row.order_source || "-" },
  { key: "delivery_date", label: "Delivery Date", showByDefault: true, render: (row: TableDataType) => row.delivery_date || "-" },
  { key: "comment", label: "Comment", render: (row: TableDataType) => row.comment || "-" },
  {
    key: "status", label: "Status", showByDefault: true, render: (row: TableDataType) => (
      <OrderStatus status={row.status} />
    )
  },
];

const OverallPerformance: React.FC = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [selected, setSelected] = useState("Last 24h");
  const [activeTab, setActiveTab] = useState("overview");
  const { warehouseOptions } = useAllDropdownListData();

  const options = ["Last 12h", "Last 24h", "Last 20h"];

  const onTabClick = (idx: number) => {
    // ensure index is within range and set the corresponding tab key
    if (typeof idx !== "number") return;
    if (typeof tabList === "undefined" || idx < 0 || idx >= tabList.length) return;
    setActiveTab(tabList[idx].key);
  };

  // ⭐ Array of card objects
  const cards: CardItem[] = [
    {
      title: "Total Valuation",
      value: "$50,846.90",
      percentage: -12,
      icon: "carbon:currency",
      color: "#fceaef",
      isUp: false,
    },
    {
      title: "Total Sales",
      value: 10342,
      percentage: +16,
      icon: "fluent-emoji-high-contrast:money-bag",
      color: "#e0edeb",
      isUp: true,
    }, {
      title: "Low Stock",
      value: 10342,
      percentage: +16,
      icon: "fluent-emoji-high-contrast:money-bag",
      color: "#e0edeb",
      isUp: true,
    },
    {
      title: "Awaiting Delivery",
      value: 10342,
      percentage: +16,
      icon: "fluent-emoji-high-contrast:money-bag",
      color: "#e0edeb",
      isUp: true,
    },
    {
      title: "Salesmen Stock",
      value: 19720,
      percentage: +10,
      icon: "tabler:truck-loading",
      color: "#d8e6ff",
      isUp: true,
    },
    {
      title: "Warehouse Stock",
      value: 20000,
      percentage: -10,
      icon: "maki:warehouse",
      color: "#fff0f2",

      isUp: false,
    }, {
      title: "Total Stock",
      value: 20000,
      percentage: -10,
      icon: "maki:warehouse",
      color: "#fff0f2",

      isUp: false,
    },
  ];

  return (
    <>
      <ContainerCard className="w-full flex gap-[4px] overflow-x-auto">
        <InputFields
          //   required
          //   label="Warehouse"
          value={""}
          options={warehouseOptions}
          onChange={(e) => {
            // const newWarehouse = e.target.value;
            // handleChange("warehouse", newWarehouse);
            // handleChange("vehicleType", ""); // clear vehicle when warehouse changes
            // fetchRoutes(newWarehouse);
          }}
        />
      </ContainerCard>
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
      <ContainerCard className="w-full">

        <div className="flex justify-between md:items-center">
          <div>
            <p className="text-base font-bold">Overall Performance</p>
          </div>

          {/* Dropdown */}
          <div className="shrink-0 relative">
            <button
              type="button"
              onClick={() => setOpenMenu(!openMenu)}
              className="select-none text-xs py-3 px-6 rounded-lg border text-gray-900 flex items-center gap-1 border-gray-300 hover:opacity-75"
            >
              {selected}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={4}
                stroke="currentColor"
                className="w-3 h-3 text-gray-900"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {openMenu && (
              <ul className="absolute right-0 mt-2 z-10 min-w-[180px] rounded-md border bg-white p-3 text-sm shadow-lg">
                {options.map((item) => (
                  <li
                    key={item}
                    onClick={() => {
                      setSelected(item);
                      setOpenMenu(false);
                    }}
                    className="cursor-pointer rounded-md px-3 py-2 hover:bg-blue-gray-50 text-gray-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* CARDS (dynamic from array) */}
        <div className="mt-6 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 items-center md:gap-2.5 gap-4">
          {cards.map((card, index) => (
            <div key={index} className="flex items-center rounded-lg bg-white text-gray-700 shadow-md border border-gray-200 p-2" >
              <div style={{ background: card.color }} className="p-2 rounded-lg"> <Icon icon={card.icon} width="48" height="48" /> </div>

              <div
                key={index}
                className="relative flex flex-col w-[100%]"
              >

                <div className="p-4">

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-600 font-medium">{card.title}</p>

                    {/* Arrow + Percentage */}
                    <div
                      className={`flex items-center gap-1 ${card.isUp ? "text-green-500" : "text-red-500"
                        }`}
                    >



                    </div>
                    <div
                      className={`flex items-center gap-1 ${card.isUp ? "text-green-500" : "text-red-500"
                        }`}
                    >
                      {card.isUp ? (
                        // Up Arrow
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={4}
                          stroke="currentColor"
                          className="w-3 h-3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 15.75l7.5-7.5 7.5 7.5"
                          />
                        </svg>
                      ) : (
                        // Down Arrow
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={4}
                          stroke="currentColor"
                          className="w-3 h-3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      )}

                      <p className="text-xs font-medium">
                        {Math.abs(card.percentage)}%
                      </p>
                    </div>

                  </div>


                  {/* Value */}
                  <p className="mt-1 text-blue-gray-900 font-bold text-2xl">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <br />
        <div className="flex flex-col h-full">
          <Table
            //   refreshKey={refreshKey}
            config={{
              //   api: { list: fetchOrders, filterBy: filterBy },
              header: {
                //   title: "Customer Orders",
                searchBar: false,
                columnFilter: false,

              },
              //   rowSelection: true,
              footer: { nextPrevBtn: true, pagination: true },
              columns,
              pageSize: 10,
            }}
          />
        </div>
      </ContainerCard>
    </>
  );
};

export default OverallPerformance;
