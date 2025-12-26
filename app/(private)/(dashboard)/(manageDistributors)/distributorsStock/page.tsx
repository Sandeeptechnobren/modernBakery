"use client";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import React, { useEffect, useState } from "react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table from "@/app/components/customTable";
import { warehouseStockItem } from "@/app/services/allApi";
import { CustomTableSkelton } from "@/app/components/customSkeleton";

const itemColumns = [
  {
    key: "erp_code,item_name",
    label: "Item",
    showByDefault: true,
    render: (row: any) => {
      const code = row.item?.code ?? "";
      const name = row.item?.name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  {
    key: "qty",
    label: "Stock Qty",
    showByDefault: true,
    render: (row: any) => row.qty ?? "-",
    isSortable: true
  },
];


const OverallPerformance: React.FC = () => {
  // const [pagination,setPagination] = 
  const [loading, setLoading] = useState<boolean>(false);
  const [topOrders, setTopOrders] = useState({
    stocks: [],
    pagination: {
      total: 0,
      currentPage: 1,
      pageSize: 50,
    }
  });

  const [selectedWarehouse, setSelectedWarehouse] = useState("")
  const { warehouseOptions,ensureWarehouseLoaded } = useAllDropdownListData();

  useEffect(()=>{
    ensureWarehouseLoaded();
  },[ensureWarehouseLoaded])

  
  // Table expects this for pagination
  const fetchStockData = async (warehouseId: string, page = 1, pageSize = 50) => {
    setLoading(true);
    try {
  const params: Record<string, string> = { page: String(page), per_page: String(pageSize) };
  const res = await warehouseStockItem(warehouseId, params);
      const pagination = res?.pagination || {};
      setTopOrders({
        stocks: Array.isArray(res.data) ? res.data : [],
        pagination: {
          total: pagination.last_page || (res.data ? res.data.length : 0) ,
          currentPage: (pagination.current_page || page) - 1,
          pageSize: pagination.per_page || pageSize,
        },
      });
      setLoading(false);
      return {
        data: res.data || [],
        total: pagination.last_page || 0,
        currentPage: pagination.current_page || page,
        pageSize: pagination.per_page || pageSize,
      };
    } catch (err) {
      setTopOrders({
        stocks: [],
        pagination: {
          total: 0,
          currentPage: 1,
          pageSize: 50,
        },
      });
      setLoading(false);
      return {
        data: [],
        total: 0,
        currentPage: 1,
        pageSize: 50,
      };
    }
  };
  return (
    <>
      <ContainerCard className="flex flex-col h-full w-full">
        <div className="flex justify-between md:items-center">
          <div>
            <p className="text-base font-bold">Distributors Stock</p>
          </div>
          <InputFields
            searchable={true}
            placeholder="Select Distributers"
            name="Distributers"
            value={selectedWarehouse}
            options={warehouseOptions}
            onChange={async (e) => {
              setSelectedWarehouse(e.target.value);
              await fetchStockData(e.target.value, 1, topOrders.pagination.pageSize);
            }}
          />

        </div>

        
        <br />
        <div className="flex flex-col h-full">
          {loading ? <CustomTableSkelton /> :
            <Table
              data={{
                data: topOrders.stocks,
                total: topOrders.pagination.total,
                currentPage: topOrders.pagination.currentPage,
                pageSize: topOrders.pagination.pageSize,
              }}
              config={{
                api: {
                  list: async (pageNo, pageSize) => {
                    // Table expects 1-based pageNo
                    return await fetchStockData(selectedWarehouse, pageNo, pageSize);
                  },
                },
                header: {
                  searchBar: false,
                  columnFilter: false,
                },
                footer: { nextPrevBtn: true, pagination: true },
                columns: itemColumns,
                pageSize: topOrders.pagination.pageSize,
              }}
            />}
        </div>

      </ContainerCard>
    </>
  );
};
export default OverallPerformance;
