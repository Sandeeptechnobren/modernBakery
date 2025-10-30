"use client";

import { useState, useEffect } from "react";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
import { deletePromotionType, promotionTypeList } from "@/app/services/allApi";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import Popup from "@/app/components/popUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import CreateUpdate from "./createUpdate";
import StatusBtn from "@/app/components/statusBtn2";
import BorderIconButton from "@/app/components/borderIconButton";
import { Icon } from "@iconify-icon/react";
import CustomDropdown from "@/app/components/customDropdown";

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

const dropdownDataList: DropdownItem[] = [
  // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [

    { key: "code", label: "Code",
        render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.code}
            </span>
        ),
     },
    { key: "name", label: "Name" },
    {
        key: "status",
        label: "Status",
        render: (data: TableDataType) => ( <StatusBtn isActive={data.status ? true : false} />)
    },
];

export type promotionType = {
    id: number;
    code?: string;
    name: string;
    status: 0 | 1;
};

export default function Category() {
    const [promotionData, setPromotionData] = useState<TableDataType[]>(
        [] as TableDataType[]
    );
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { showSnackbar } = useSnackbar();
    const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false);
    const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false);
    const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false);
    const [deletePromotionId, setDeletePromotionId] = useState<number | undefined>();
    const [updatePromotionData, setUpdatePromotionData] = useState<promotionType>({} as promotionType);

    async function deletePromotion() {
        if (!deletePromotionId) return;
        const listRes = await deletePromotionType(deletePromotionId);
        if (listRes.error) {
            showSnackbar(listRes.data.message, "error");
        } else {
            showSnackbar(listRes.message || "Category deleted successfully", "success");
            fetchPromotionList();
        }
        setShowDeletePopup(false);
    }

    async function fetchPromotionList() {
        setLoading(true);
        const listRes = await promotionTypeList({ per_page: "10", page: "1" });
        if (listRes.error) showSnackbar(listRes.data.message, "error");
        else setPromotionData(listRes.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPromotionList();
    }, []);

    return loading ? (
        <Loading />
    ) : (
        <>
            

            {showDeletePopup && (
                <Popup isOpen={true} onClose={() => setShowDeletePopup(false)}>
                    <DeleteConfirmPopup
                        title="Delete Promotion Type"
                        onConfirm={() => deletePromotion()}
                        onClose={() => setShowDeletePopup(false)}
                    />
                </Popup>
            )}

            {showCreatePopup && (
                <Popup isOpen={true} onClose={() => setShowCreatePopup(false)}>
                    <CreateUpdate
                        type="create"
                        onClose={() => setShowCreatePopup(false)}
                        onRefresh={fetchPromotionList}
                    />
                </Popup>
            )}

            {showUpdatePopup && (
                <Popup isOpen={true} onClose={() => setShowUpdatePopup(false)}>
                    <CreateUpdate
                        type="update"
                        updateItemCategoryData={updatePromotionData}
                        onClose={() => setShowUpdatePopup(false)}
                        onRefresh={fetchPromotionList}
                    />
                </Popup>
            )}

            <div className="h-[calc(100%-60px)]">
                {promotionData && (
                    <Table
                        data={promotionData}
                        config={{
                            api: {
                                list: (pageNo: number) => {
                                    return {
                                        data: [] as TableDataType[],
                                        currentPage: 1,
                                        pageSize: 10,
                                        total: 20,
                                    };
                                }
                            },
                            header: {
                                title: "Promotion Type",
                                              wholeTableActions: [
                                                <div key={0} className="flex gap-[12px] relative">
                                                  <BorderIconButton
                                                    icon="ic:sharp-more-vert"
                                                    onClick={() =>
                                                      setShowDropdown(!showDropdown)
                                                    }
                                                  />
                                
                                                  {showDropdown && (
                                                    <div className="w-[226px] absolute top-[40px] right-0 z-30">
                                                      <CustomDropdown>
                                                        {dropdownDataList.map(
                                                          (
                                                            link,
                                                            index: number
                                                          ) => (
                                                            <div
                                                              key={index}
                                                              className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                                                            >
                                                              <Icon
                                                                icon={
                                                                  link.icon
                                                                }
                                                                width={
                                                                  link.iconWidth
                                                                }
                                                                className="text-[#717680]"
                                                              />
                                                              <span className="text-[#181D27] font-[500] text-[16px]">
                                                                {link.label}
                                                              </span>
                                                            </div>
                                                          )
                                                        )}
                                                      </CustomDropdown>
                                                    </div>
                                                  )}
                                                </div>
                                              ],
                                searchBar: false,
                                columnFilter: true,
                                actions: [
                                    <SidebarBtn
                                        key={0}
                                        href="#"
                                        isActive={true}
                                        buttonTw="px-3 h-9"
                                        leadingIcon="lucide:plus"
                                        label="Add"
                                        labelTw="hidden lg:block"
                                        onClick={() => setShowCreatePopup(true)}
                                    />,
                                ],
                            },
                            pageSize: 5,
                            localStorageKey: "promotionTypeTable",
                            footer: { nextPrevBtn: true, pagination: true },
                            columns,
                            rowSelection: true,
                            rowActions: [
                                {
                                    icon: "lucide:edit-2",
                                    onClick: (data: TableDataType) => {
                                        setShowUpdatePopup(true);
                                        console.log(data)
                                        setUpdatePromotionData({
                                            id: parseInt(data.id),
                                            code: data.code,
                                            name: data.name,
                                            status: parseInt(data.status) as 0 | 1
                                        });
                                    },
                                },
                                {
                                    icon: "lucide:trash-2",
                                    onClick: (data: Record<string, string>) => {
                                        setShowDeletePopup(true);
                                        setDeletePromotionId(
                                            parseInt(data.id)
                                        );
                                    },
                                },
                            ],
                        }}
                    />
                )}
            </div>
        </>
    );
}