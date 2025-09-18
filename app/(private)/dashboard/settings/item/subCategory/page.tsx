"use client";

import Table, { TableDataType } from "@/app/components/customTable";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import Loading from "@/app/components/Loading";
import Popup from "@/app/components/popUp";
import {  deleteItemSubCategory, itemSubCategoryList } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useEffect, useState } from "react";
import CreateUpdate from "./createUpdate";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";

const mockCategoryData = new Array(100).fill(null).map((_, i) => ({
    id: (i + 1).toString(),
    category_id: "Beverages",
    sub_category_name: "Beverages",
    status: "0",
}));

const columns = [
    { key: "id", label: "Category Id" },
    { key: "sub_category_name", label: "Sub Category Name" },
    { key: "status", label: "Status", render: (data: TableDataType) => <StatusBtn isActive={data.status === "0" ? false : true} /> },
];

export type subCategoryType = {
    id?: number;
    category_id: number;
    sub_category_name: string;
    status: string;
};

export default function SubCategory() {
    const [categoryData, setCategoryData] = useState<TableDataType[]>(
        [] as TableDataType[]
    );
    const [loading, setLoading] = useState<boolean>(true);
    const { showSnackbar } = useSnackbar();
    const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false);
    const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false);
    const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false);
    const [deleteItemCategoryId, setDeleteItemCategoryId] = useState<
        number | undefined
    >();
    const [updateItemCategoryData, setUpdateItemCategoryData] = useState<subCategoryType>({} as subCategoryType);

    async function deleteCategory() {
        if (!deleteItemCategoryId) return;
        try {
            const listRes = await deleteItemSubCategory(deleteItemCategoryId);
            if (listRes.code === 204)
                showSnackbar("Category deleted successfully", "success");
            else showSnackbar("Failed to delete category", "error");
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("API Error:", error.message);
            } else {
                console.error("Unexpected error:", error);
            }
            setCategoryData(mockCategoryData);
        }
        setShowDeletePopup(false);
    }

    useEffect(() => {
        const fetchItemCategory = async () => {
            try {
                const listRes = await itemSubCategoryList();
                setCategoryData(listRes);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("API Error:", error.message);
                } else {
                    console.error("Unexpected error:", error);
                }
                setCategoryData(mockCategoryData); // fallback to mock
            } finally {
                setLoading(false);
            }
        };

        fetchItemCategory();
    }, []);

    return loading ? (
        <Loading />
    ) : (
        <>
            <div className="flex justify-between items-center mb-[20px]">
                <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
                    Item Sub Category
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
                    />
                </Popup>
            )}

            {showUpdatePopup && (
                <Popup isOpen={true} onClose={() => setShowUpdatePopup(false)}>
                    <CreateUpdate
                        type="update"
                        updateItemCategoryData={updateItemCategoryData}
                        onClose={() => setShowUpdatePopup(false)}
                    />
                </Popup>
            )}

            <div className="h-[calc(100%-60px)]">
                {categoryData && categoryData.length > 0 && (
                    <Table
                        data={categoryData}
                        config={{
                            header: {
                                searchBar: false,
                                columnFilter: true,
                                actions: [
                                    <SidebarBtn
                                        key={0}
                                        href="#"
                                        isActive={true}
                                        buttonTw="px-3 h-9"
                                        leadingIcon="lucide:plus"
                                        label="Add Sub Category"
                                        labelTw="hidden lg:block"
                                        onClick={() => setShowCreatePopup(true)}
                                    />,
                                ],
                            },
                            pageSize: 5,
                            footer: { nextPrevBtn: true, pagination: true },
                            columns,
                            rowSelection: true,
                            rowActions: [
                                {
                                    icon: "lucide:edit-2",
                                    onClick: (data) => {
                                        setShowUpdatePopup(true);
                                        setUpdateItemCategoryData({
                                            category_id: parseInt(data.id),
                                            sub_category_name: data.sub_category_name,
                                            status: data.status,
                                        });
                                    },
                                },
                                {
                                    icon: "lucide:trash-2",
                                    onClick: (data) => {
                                        setShowDeletePopup(true);
                                        setDeleteItemCategoryId(
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
