import React, { useState } from "react";
import Table from "@/app/components/customTable";
import InputFields from "@/app/components/inputFields";
import { Icon } from "@iconify-icon/react";
import { OfferItemType, OrderItemType } from "../types";

type Props = {
  offerItems: OfferItemType[][];
  setOfferItems: React.Dispatch<React.SetStateAction<OfferItemType[][]>>;
  selectItemForOffer: (tableIdx: number, rowIdx: string, value: string | string[]) => void;
  updateOfferItem: (tableIdx: number, rowIdx: string, key: keyof OfferItemType, value: string) => void;
  itemOptions: any[];
  uomOptions: any[];
  itemLoading: boolean;
};

export default function OfferItemsTable({ offerItems, setOfferItems, selectItemForOffer, updateOfferItem, itemOptions, uomOptions, itemLoading }: Props) {
  const [page, setPage] = useState(1);
  const pageSize = 5;

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
      {offerItems.map((offerArr, tableIdx) => {
        let offerItemsData = offerArr.map((offerItem: OfferItemType, idx: number) => ({ ...offerItem, idx: String(idx) }));
        if (offerItemsData.length === 0) {
          offerItemsData = [{
            promotionGroupName: "",
            itemName: "",
            itemCode: "",
            uom: "BAG",
            toQuantity: "",
            is_discount: "0",
            idx: "0",
          }];
        }
        const totalPages = Math.ceil(offerItemsData.length / pageSize);
        const paginatedData = offerItemsData.slice((page - 1) * pageSize, page * pageSize);
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
                      key: "selectedItem",
                      label: (
                        <span>
                          Item
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                      ),
                      width: 200,
                      render: (row: any) => (
                        <InputFields
                          type="select"
                          isSingle={false}
                          searchable={true}
                          multiSelectChips={true}
                          placeholder="Select Item"
                          showSkeleton={itemLoading}
                          options={itemOptions}
                          value={Array.isArray(row.itemCode) ? row.itemCode : (row.itemCode ? [String(row.itemCode)] : [])}
                          onChange={e => {
                            const val = e.target.value;
                            let selectedValues: string[];
                            if (Array.isArray(val)) {
                              selectedValues = val;
                            } else {
                              selectedValues = val ? [String(val)] : [];
                            }
                            selectItemForOffer(tableIdx, row.idx, selectedValues);
                          }}
                          width="w-full"
                        />
                      ),
                    },
                    {
                      key: "uom",
                      label: (
                        <span>
                          UOM
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                      ),
                      width: 150,
                      render: (row: any) => {
                        return (
                          <InputFields
                            type="select"
                            isSingle={true}
                            placeholder="Select UOM"
                            options={uomOptions}
                            value={String(row.uom ?? "")}
                            onChange={e => updateOfferItem(tableIdx, row.idx, "uom", e.target.value)}
                            width="w-full"
                          />
                        );
                      }
                    },
                    // {
                    //   key: "action",
                    //   label: "Action",
                    //   width: 30,
                    //   render: (row: any) => (
                    //     <button
                    //       type="button"
                    //       disabled={String(row.idx) === "0"}
                    //       className={`flex  w-full h-full ${String(row.idx) === "0" ? "text-gray-300 cursor-not-allowed" : "text-red-500"}`}
                    //       onClick={() => {
                    //         if (String(row.idx) === "0") return;
                    //         setOfferItems((prev: OfferItemType[][]) => {
                    //           const tables = (Array.isArray(prev) && prev.length > 0 && Array.isArray(prev[0])) ? prev : [prev as unknown as OfferItemType[]];
                    //           return tables.flatMap((arr, idx) => {
                    //             if (idx !== tableIdx) return [arr];
                    //             const newArr = arr.filter((oi, i) => String(i) !== String(row.idx));
                    //             if (newArr.length === 0 && tables.length > 1) {
                    //               return [];
                    //             }
                    //             return [newArr];
                    //           });
                    //         });
                    //       }}
                    //     >
                    //       <Icon icon="lucide:trash-2" width={20} />
                    //     </button>
                    //   ),
                    // },
                    {
                      key: "empty",
                      label: "",
                      width: 150, // Small width for visual spacing
                      render: () => null, // Renders nothing
                    },
                  ],
                  pageSize,
                }}
              />
              {offerItemsData.length > pageSize && renderPaginationBar(totalPages)}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}
