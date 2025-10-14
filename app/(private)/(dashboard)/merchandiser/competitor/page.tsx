"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";

import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";

import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { competitorList } from "@/app/services/merchandiserApi";

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Competitor() {
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [popupImages, setPopupImages] = useState<string[]>([]);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // Fetch Table Data
  const fetchCompetitorList = useCallback(
    async (pageNo = 1, pageSize = 10): Promise<listReturnType> => {
      setLoading(true);
      try {
        const res = await competitorList({ page: String(pageNo), per_page: String(pageSize) });
        setLoading(false);

        if (res.error) {
          showSnackbar(res.data?.message || "Failed to fetch competitor list", "error");
          return { data: [], currentPage: 1, pageSize, total: 0 };
        }

        return {
          data: res?.data || [],
          currentPage: res?.pagination?.current_page || 1,
          pageSize: res?.pagination?.per_page || pageSize,
          total: res?.pagination?.total || 1,
        };
      } catch (err) {
        setLoading(false);
        showSnackbar("Failed to fetch competitor list", "error");
        return { data: [], currentPage: 1, pageSize, total: 0 };
      }
    },
    [setLoading, showSnackbar]
  );

  // Handle image popup open
//   const handleOpenImagePopup = (row: any) => {
//     const images: string[] = [];
//     if (row.image?.image1) images.push(row.image.image1);
//     if (row.image?.image2) images.push(row.image.image2);
//     if (row.image?.image3) images.push(row.image.image3);

//     if (images.length === 0) {
//       showSnackbar("No images available", "info");
//       return;
//     }

//     setPopupImages(images);
//   };

  return (
    <>
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchCompetitorList },
            header: {
              title: "Competitor",
              wholeTableActions: [
                <div key={0} className="flex gap-[12px] relative">
                  <DismissibleDropdown
                    isOpen={showDropdown}
                    setIsOpen={setShowDropdown}
                    button={<BorderIconButton icon="ic:sharp-more-vert" />}
                    dropdown={
                      <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                        <CustomDropdown>
                          {dropdownDataList.map((link, idx) => (
                            <div
                              key={idx}
                              className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA] cursor-pointer"
                            >
                              <Icon icon={link.icon} width={link.iconWidth} className="text-[#717680]" />
                              <span className="text-[#181D27] font-[500] text-[16px]">{link.label}</span>
                            </div>
                          ))}
                        </CustomDropdown>
                      </div>
                    }
                  />
                </div>,
              ],
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key="add"
                  href="/merchandiser/complaintFeedback/add"
                  leadingIcon="lucide:plus"
                  label="Add Feedback"
                  labelTw="hidden lg:block"
                  isActive
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "code", label: "Complaint Code" },
              { key: "company_name", label: "Company Name" },
              { key: "brand", label: "Brand" },
              { key: "merchendiser_id", label: "Merchendiser ID" },
              { key: "merchendiser_info", label: "Merchendiser Info" },
              { key: "item_name", label: "Item Name" },
              { key: "price", label: "Price" },
              { key: "promotion", label: "Promotion" },
              { key: "notes", label: "Notes" },
            //   {
            //     key: "image",
            //     label: "Images",
            //     render: (row) => {
            //       const hasImages = row.image?.image1 || row.image?.image2 || row.image?.image3;
            //       return hasImages ? (
            //         <button
            //           onClick={() => handleOpenImagePopup(row)}
            //           className="text-blue-600 underline hover:text-blue-800"
            //         >
            //           View Images
            //         </button>
            //       ) : (
            //         "-"
            //       );
            //     },
            //   },
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/merchandiser/complaintFeedback/view/${data.uuid}`);
                },
              },
            ],
            pageSize: 10,
          }}
        />
      </div>

      {/* Image Preview Popup */}
      {popupImages.length > 0 && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          onClick={() => setPopupImages([])}
        >
          <div
            className="bg-white rounded-xl p-4 max-w-[80%] max-h-[80%] overflow-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap gap-4 justify-center">
              {popupImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Image ${idx + 1}`}
                  className="w-[200px] h-[200px] object-cover rounded-lg shadow-md"
                />
              ))}
            </div>
            <button
              onClick={() => setPopupImages([])}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
