import React, { useState } from "react";
import Table from "@/app/components/customTable";
import InputFields from "@/app/components/inputFields";
import { Icon } from "@iconify-icon/react";
import { OrderItemType, PromotionState } from "../types";

type Props = {
  orderTables: OrderItemType[][];
  setOrderTables: React.Dispatch<React.SetStateAction<OrderItemType[][]>>;
  updateOrderItem: (tableIdx: number, rowIdx: string, key: keyof OrderItemType, value: string) => void;
  promotion: PromotionState;
};

export default function OrderItemsTable({ orderTables, setOrderTables, updateOrderItem, promotion }: Props) {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  function clampPercentInput(val: string) {
    if (promotion.bundle_combination !== "slab") return val;
    const n = Number(val);
    if (Number.isNaN(n)) return "";
    const clamped = Math.max(0, Math.min(100, n));
    return String(clamped);
  }

  type PaginationBtnProps = {
    label: string;
    isActive: boolean;
    onClick: () => void;
  };
  const PaginationBtn = ({ label, isActive, onClick }: PaginationBtnProps) => (
    <button
      className={`w-[32px] h-[32px] rounded-[6px] flex items-center justify-center mx-[2px] text-[14px] font-semibold transition-colors duration-150 border-none outline-none focus:ring-2 focus:ring-[#EA0A2A] select-none ${isActive ? "bg-[#FFF0F2] text-[#EA0A2A] shadow-sm" : "bg-white text-[#717680] hover:bg-[#F5F5F5]"
        }`}
      style={{ minWidth: 32 }}
      onClick={onClick}
      disabled={label === "..."}
    >
      {label}
    </button>
  );

  const renderPaginationBar = (totalPages: number) => {
    if (totalPages <= 1) return null;
    const firstThreePageIndices = [1, 2, 3];
    const lastThreePageIndices = totalPages > 3 ? [totalPages - 2, totalPages - 1, totalPages] : [];
    return (
      <div className="flex justify-between items-center px-[8px] py-[12px] mt-2">
        <button
          className="flex items-center gap-1 px-4 py-2 rounded bg-[#F5F5F5] text-[#717680] font-semibold disabled:opacity-50"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          <span className="text-[16px]">←</span>
          Previous
        </button>
        <div className="flex gap-[2px] text-[14px] select-none">
          {totalPages > 6 ? (
            <>
              {firstThreePageIndices.map((pageNo) => (
                <PaginationBtn
                  key={pageNo}
                  label={pageNo.toString()}
                  isActive={page === pageNo}
                  onClick={() => setPage(pageNo)}
                />
              ))}
              <PaginationBtn label={"..."} isActive={false} onClick={() => { }} />
              {lastThreePageIndices.map((pageNo) => (
                <PaginationBtn
                  key={pageNo}
                  label={pageNo.toString()}
                  isActive={page === pageNo}
                  onClick={() => setPage(pageNo)}
                />
              ))}
            </>
          ) : (
            <>
              {[...Array(totalPages)].map((_, idx) => (
                <PaginationBtn
                  key={idx + 1}
                  label={(idx + 1).toString()}
                  isActive={page === idx + 1}
                  onClick={() => setPage(idx + 1)}
                />
              ))}
            </>
          )}
        </div>
        <button
          className="flex items-center gap-1 px-4 py-2 rounded bg-[#F5F5F5] text-[#717680] font-semibold disabled:opacity-50"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
          <span className="text-[16px]">→</span>
        </button>
      </div>
    );
  };

  return (
    <>
      {orderTables.map((orderItems, tableIdx) => {
        let itemsData = orderItems.map((orderItem, idx) => ({
          ...orderItem,
          idx: String(idx),
        }));
        if (itemsData.length === 0) {
          itemsData = [{
            promotionGroupName: "",
            itemName: "",
            itemCode: "",
            quantity: "",
            toQuantity: "",
            uom: "CTN",
            price: "",
            free_qty: "",
            idx: "0",
          }];
        }
        const totalPages = Math.ceil(itemsData.length / pageSize);
        const paginatedData = itemsData.slice((page - 1) * pageSize, page * pageSize);

        return (
          <React.Fragment key={tableIdx}>
            {tableIdx > 0 && (
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="mx-4 font-bold text-gray-500">OR</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>
            )}
            <div className="mb-6">
              <Table
                data={paginatedData}
                config={{
                  showNestedLoading: false,
                  columns: [
                    {
                      key: "quantity",
                      label: (
                        <span>
                          From Quantity
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                      ),
                      width: 120,
                      render: (row: any) => (
                        <InputFields
                          label=""
                          type="number"
                          placeholder="From Qty"
                          value={String(row.quantity ?? "")}
                          onChange={e => updateOrderItem(tableIdx, String(row.idx), "quantity", clampPercentInput(e.target.value))}
                          width="w-full"
                        />
                      ),
                    },
                    {
                      key: "toQuantity",
                      label: (
                        <span>
                          To Quantity
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                      ),
                      width: 120,
                      render: (row: any) => (
                        <InputFields
                          label=""
                          type="number"
                          placeholder="To Qty"
                          value={String(row.toQuantity ?? "")}
                          onChange={e => updateOrderItem(tableIdx, String(row.idx), "toQuantity", clampPercentInput(e.target.value))}
                          width="w-full"
                        />
                      ),
                    },
                    {
                      key: "free_qty",
                      label: (
                        <span>
                          Free Qty
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                      ),
                      width: 120,
                      render: (row: any) => (
                        <InputFields
                          label=""
                          type="number"
                          placeholder="Free Qty"
                          value={String(row.free_qty ?? "")}
                          onChange={e => updateOrderItem(tableIdx, String(row.idx), "free_qty", e.target.value)}
                          width="w-full"
                        />
                      ),
                    },
                    ...(promotion.bundle_combination === "range" ? [{
                      key: "action",
                      label: "Action",
                      width: 20,
                      render: (row: any) => (
                        <button
                          type="button"
                          disabled={String(row.idx) === "0"}
                          className={`flex  w-full h-full ${String(row.idx) === "0" ? "text-gray-300 cursor-not-allowed" : "text-red-500"}`}
                          onClick={() => {
                            if (String(row.idx) === "0") return;
                            setOrderTables(tables => {
                              return tables.flatMap((arr, idx) => {
                                if (idx !== tableIdx) return [arr];
                                const newArr = arr.filter((oi, i) => String(i) !== String(row.idx));
                                if (newArr.length === 0 && tables.length > 1) {
                                  return [];
                                }
                                return [newArr];
                              });
                            });
                          }}
                        >
                          <Icon icon="lucide:trash-2" width={20} />
                        </button>
                      ),
                    }] : []),
                  ], pageSize,
                }}
              />
              {itemsData.length > pageSize && renderPaginationBar(totalPages)}

              {/* Add Button */}
              {promotion.bundle_combination === "range" && (
                <div className="mt-4">
                  <button
                    type="button"
                    className="text-[#E53935] font-medium text-[16px] flex items-center gap-2"
                    onClick={() => {
                      setOrderTables(tables => tables.map((arr, idx) => {
                        if (idx !== tableIdx) return arr;
                        const first = arr[0];
                        return [
                          ...arr,
                          {
                            promotionGroupName: first?.promotionGroupName || "",
                            itemName: first?.itemName || "",
                            itemCode: first?.itemCode || "",
                            quantity: "",
                            toQuantity: "",
                            uom: first?.uom || "CTN",
                            price: first?.price || "",
                            free_qty: "",
                          }
                        ];
                      }));
                    }}
                  >                      <Icon icon="material-symbols:add-circle-outline" width={20} />
                    Add New Item
                  </button>
                </div>
              )}

            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}
