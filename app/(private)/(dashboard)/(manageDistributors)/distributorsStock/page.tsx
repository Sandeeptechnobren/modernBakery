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
import { warehouseLowStocksKpi, warehouseStocksKpi, warehouseStockTopOrders } from "@/app/services/allApi";
import { CustomTableSkelton } from "@/app/components/customSkeleton";
import Skeleton from "@mui/material/Skeleton";


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
 const itemColumns = [
  {
    key: "item_code",
    label: "Item",
    showByDefault: true,
    render: (row: any) => {
      const code = row.item_code ?? "";
      const name = row.item_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  {
    key: "stock_qty",
    label: "Stock Qty",
    showByDefault: true,
    render: (row: any) => row.stock_qty ?? "-",
  },
  {
    key: "total_sold_qty",
    label: "Sold Qty",
    showByDefault: true,
    render: (row: any) => row.total_sold_qty ?? "-",
  },
  {
    key: "purchase",
    label: "Purchase Qty",
    showByDefault: true,

    render: (row: any) => row.purchase ?? "-",
  },
];


const OverallPerformance: React.FC = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [selected, setSelected] = useState("Last 24h");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState<boolean>(false);

  const [stockData, setStockData] = useState<any>({
    "total_warehouse_valuation": "0.00",
    "today_loaded_qty": "0.00",
    "sales_total_valuation": "0.00",});
    const [stockLowQty,setStockLowQty] = useState({"count": 0.00,
    "items": []
    })
     const [topOrders,setTopOrders] = useState({
    "stocks": []
    })

  const [selectedWarehouse, setSelectedWarehouse] = useState("")
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
      value: stockData?.total_warehouse_valuation?.total_valuation?stockData?.total_warehouse_valuation?.total_valuation:0.00,
      percentage: -12,
      icon: "carbon:currency",
      color: "#fceaef",
      isUp: false,
    },
    {
      title: "Warehouse Stock",
      value: stockData?.total_warehouse_valuation?.total_qty?stockData?.total_warehouse_valuation?.total_qty:0.00,
      percentage: -10,
      icon: "maki:warehouse",
      color: "#fff0f2",

      isUp: false,
    }, {
      title: "Low Stock",
      value: stockLowQty.count,
      percentage: +16,
      icon: "fluent-emoji-high-contrast:money-bag",
      color: "#e0edeb",
      isUp: true,
    },
    {
      title: "Awaiting Delivery",
      value: stockData?.today_loaded_qty,
      percentage: +10,
      icon: "tabler:truck-loading",
      color: "#d8e6ff",
      isUp: true,
    },
  ];
   async function callAllKpisData(id:string)
   {
     try{
      setLoading(true)

         const res = await warehouseStocksKpi(id)
         const lowCostRes = await warehouseLowStocksKpi(id)
         const topOrderRes = await warehouseStockTopOrders(id)
        //  const top5Orders = await warehouseStockTopOrders(id)

         console.log(warehouseOptions,"hii")
         console.log(topOrderRes,"hii")

         setStockData(res)
        setStockLowQty(lowCostRes)
        setTopOrders(topOrderRes)
      setLoading(false)
      

     }
     catch(err)
     {

     }

   }
  return (
    <>
    
      {/* <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
        {tabList.map((tab, index) => (
          <div key={index}>
            <TabBtn
              label={tab.label}
              isActive={activeTab === tab.key}
              onClick={() => onTabClick(index)}
            />
          </div>
        ))}
      </ContainerCard> */}
      <ContainerCard className="w-full">

        <div className="flex justify-between md:items-center">
          <div>
            <p className="text-base font-bold">Distributers Overview</p>
          </div>

          {/* Dropdown */}
          {/* <div className=""> */}
           
<InputFields
          //   required
          //   label="Warehouse"
          placeholder="Select Distributers"
          value={selectedWarehouse}
          options={warehouseOptions}
           
          onChange={(e) => {
            setSelectedWarehouse(e.target.value)

            callAllKpisData(e.target.value)
            // const newWarehouse = e.target.value;
            // handleChange("warehouse", newWarehouse);
            // handleChange("vehicleType", ""); // clear vehicle when warehouse changes
            // fetchRoutes(newWarehouse);
          }}
        />

        </div>

        {/* CARDS (dynamic from array) */}
        <div className="mt-6 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 items-center md:gap-2.5 gap-4">
          {cards.map((card, index) => 
          {
          
          
          
          return(
           !loading? <div key={index} className="flex items-center rounded-lg bg-white text-gray-700 shadow-md border border-gray-200 p-2" >
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
                        {Math.abs(card?.percentage)}%
                      </p>
                    </div>

                  </div>


                  {/* Value */}
                  <p className="mt-1 text-blue-gray-900 font-bold text-2xl">
                    {card.value}
                  </p>
                </div>
              </div>
            </div> :<div key={index} className="flex items-center rounded-lg bg-white text-gray-700 shadow-md border border-gray-200 p-2 gap-[5px]" ><Skeleton width={20}/><Skeleton width={20}/><Skeleton width={20}/><Skeleton width={20}/></div>
          )
        
})}
        
        </div>
        <br />
        <div className="flex flex-col h-full">
          {loading?<CustomTableSkelton/>:
          <Table
              // refreshKey={1}
            data={topOrders?.stocks?topOrders?.stocks:[]}
            config={{
              //   api: { list: fetchOrders, filterBy: filterBy },
              header: {
                //   title: "Customer Orders",
                searchBar: false,
                columnFilter: false,

              },
              //   rowSelection: true,
              footer: { nextPrevBtn: true, pagination: true },
              columns:itemColumns,
              
              pageSize: 10,
            }}
          />}
        </div>
       
      </ContainerCard>
    </>
  );
};

export default OverallPerformance;
