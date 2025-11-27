"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { assetsTypeList } from "@/app/services/allApi";
import StatusBtn from "@/app/components/statusBtn2";
import Category from '../../item/category/page';



interface AssetsType {
  id: number;
  name: string;
  osa_code: string;
  status: number;
}

export default function Page() {
  const pageSize = 10;

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const columns = [
    {
      key: "osa_code", label: "OSA Code",
      render: (row: TableDataType) => (
        <span className="font-semibold text-[#181D27] text-[14px]">
          {row.osa_code}
        </span>
      ),
    },
    { key: "name", label: "Name" },
    {
      key: "status",
      label: "Status",
      render: (row: TableDataType) => <StatusBtn isActive={row.status === "Active"} />,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">
            Assets Category
        </h1>

      </div>

      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
          config={{
            header: {
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/settings/manageAssets/assetsCategory/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            pageSize: pageSize,
            localStorageKey: "assets-category-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            // rowActions: [
            // //   {
            // //     icon: "lucide:edit-2",
            // //     onClick: (row: object) => {
            // //       const r = row as TableDataType;
            // //       router.push(
            // //         `/settings/customer/customerSub/${r.id}`
            // //       );
            // //     },
            // //   },

            // ],
            api: {
              list: async (pageNo: number, pageSize: number) => {
                try {
                  const res = await assetsTypeList({ page: String(pageNo), limit: String(pageSize) });
                  const formatted: AssetsType[] = (res.data || []).map(
                    (s: AssetsType) => ({
                      id: s.id,
                      osa_code: s.osa_code,
                      name: s.name,
                      status: s.status,
                    })
                  );

                  const tableData: TableDataType[] = formatted.map((c) => ({
                    id: String(c.id),
                    name: c.name,
                    osa_code: c.osa_code,
                    status: c.status === 1 ? "Active" : "Inactive",
                  }));

                  return {
                    data: tableData,
                    currentPage: res.pagination?.page || pageNo,
                    pageSize: pageSize,
                    total: res.pagination?.totalPages || 1,
                    totalRecords: res.pagination?.totalRecords || tableData.length,
                  };
                } catch (error) {
                  console.error("Failed to fetch sub-categories ❌", error);
                  showSnackbar("Failed to load customer sub-categories ❌", "error");
                  return {
                    data: [],
                    currentPage: 1,
                    pageSize: pageSize,
                    total: 0,
                    totalRecords: 0,
                  };
                }
              },
            },
          }}
        />
      </div>


    </>
  );
}
