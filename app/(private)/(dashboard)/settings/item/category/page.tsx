"use client";

import { useState, useEffect, useCallback } from "react";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
import { deleteItemCategory, itemCategoryList } from "@/app/services/allApi";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import Popup from "@/app/components/popUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import CreateUpdate from "./createUpdate";
import StatusBtn from "@/app/components/statusBtn2";
import { useLoading } from "@/app/services/loadingContext";

const columns = [
    { key: "category_code", label: "Category Code" ,
        render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.category_code}
            </span>
        ),
    },
    { key: "category_name", label: "Category Name" },
    {
        key: "status",
        label: "Status",
        render: (data: TableDataType) => (
            <StatusBtn isActive={data.status ? true : false} />
        ),
    },
];

export type categoryType = {
    id: number;
    category_name: string;
    status: string;
    category_code?: string;
};

export default function Category() {
    const { setLoading} = useLoading();
    const { showSnackbar } = useSnackbar();
    const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false);
    const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false);
    const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [deleteItemCategoryId, setDeleteItemCategoryId] = useState<
        number | undefined
    >();
    const [updateItemCategoryData, setUpdateItemCategoryData] =
        useState<categoryType>({} as categoryType);

    async function deleteCategory() {
        if (!deleteItemCategoryId) return;
        const listRes = await deleteItemCategory(deleteItemCategoryId);
        if (listRes.error) {
            showSnackbar(listRes.data.message, "error");
        } else {
            showSnackbar(
                listRes.message || "Category deleted successfully",
                "success"
            );
            setRefreshKey(refreshKey + 1);
        }
        setShowDeletePopup(false);
    }


    const fetchItemCategory = useCallback(
        async (pageNo: number = 1, pageSize: number = 10) => {
            setLoading(true);
            const result = await itemCategoryList({
                page: pageNo.toString(),
                per_page: pageSize.toString(),
            });
            setLoading(false);
            if (result.error) {
                showSnackbar(result.data.message, "error");
                throw new Error("Error fetching data");
            } else {
                return {
                    data: result.data || [],
                    currentPage: result.pagination.page || 0,
                    pageSize: result.pagination.limit || 10,
                    total: result.pagination.totalPages || 0,
                };
            }
        },
        []
    );

    useEffect(() => {
        setLoading(true);
    }, [])

    return (
        <>
            <div className="flex justify-between items-center mb-[20px]">
                <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
                    Item Category
                </h1>
            </div>

            {showDeletePopup && (
                <Popup isOpen={true} onClose={() => setShowDeletePopup(false)}>
                    <DeleteConfirmPopup
                        title="Delete Item Category"
                        onConfirm={() => deleteCategory()}
                        onClose={() => setShowDeletePopup(false)}
                    />
                </Popup>
            )}

            {showCreatePopup && (
                <Popup isOpen={true} onClose={() => setShowCreatePopup(false)}>
                    <CreateUpdate
                        type="create"
                        onClose={() => setShowCreatePopup(false)}
                        onRefresh={fetchItemCategory}
                    />
                </Popup>
            )}

            {showUpdatePopup && (
                <Popup isOpen={true} onClose={() => setShowUpdatePopup(false)}>
                    <CreateUpdate
                        type="update"
                        updateItemCategoryData={updateItemCategoryData}
                        onClose={() => setShowUpdatePopup(false)}
                        onRefresh={fetchItemCategory}
                    />
                </Popup>
            )}

            <div className="h-[calc(100%-60px)]">
                    <Table
                        refreshKey={refreshKey}
                        config={{
                            api: {
                                list: fetchItemCategory,
                            },
                            header: {
                                searchBar: false,
                                columnFilter: true,
                                actions: [
                                    <SidebarBtn
                                        key={0}
                                        href="#"
                                        isActive={true}
                                        leadingIcon="lucide:plus"
                                        label="Add"
                                        labelTw="hidden lg:block"
                                        onClick={() => setShowCreatePopup(true)}
                                    />,
                                ],
                            },
                            pageSize: 10,
                            localStorageKey: "item_category",
                            footer: { nextPrevBtn: true, pagination: true },
                            columns,
                            rowSelection: true,
                            rowActions: [
                                {
                                    icon: "lucide:edit-2",
                                    onClick: (data: Record<string, string>) => {
                                        setShowUpdatePopup(true);
                                        setUpdateItemCategoryData({
                                            id: parseInt(data.id),
                                            category_code: data.category_code,
                                            category_name: data.category_name,
                                            status: data.status,
                                        });
                                    },
                                },
                            ],
                        }}
                    />
            </div>
        </>
    );
}