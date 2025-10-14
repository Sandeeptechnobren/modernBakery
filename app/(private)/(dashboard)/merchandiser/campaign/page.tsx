"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";

import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import DeleteConfirmPopup from "@/app/components/deletePopUp";

import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { campaignInformationList } from "@/app/services/merchandiserApi";



const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function CampaignPage() {
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteSelectedRow, setDeleteSelectedRow] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [popupImages, setPopupImages] = useState<string[]>([]);
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // ✅ Fetch Table Data
  const fetchComplaintFeedback = useCallback(
  async (pageNo = 1, pageSize = 10) => {
    setLoading(true);
    try {
    //   const res: CampaignApiResponse = await campaignInformationList({
    //     page: String(pageNo),
    //     per_page: String(pageSize),
    //   });
    //   setLoading(false);
     const res = await campaignInformationList({ page: String(pageNo), per_page: String(pageSize) });
          setLoading(false);

      const dataArray: TableDataType[] = Array.isArray(res?.data) ? res.data : [];
      const pagination = res?.pagination || {};

      

      return {
        data: dataArray,
        currentPage: pagination.current_page || 1,
        pageSize: pagination.per_page || pageSize,
        total: pagination.total || 0,
      };
    } catch (err) {
      setLoading(false);
      showSnackbar("Failed to fetch complaint feedback", "error");
      console.error(err);
      return { data: [] as TableDataType[], currentPage: 1, pageSize, total: 0 };
    }
  },
  [setLoading, showSnackbar]
);


  const openImagePopup = (images: (string | undefined)[], index: number) => {
    const validImages = images.filter(Boolean) as string[];
    setPopupImages(validImages);
    setCurrentPopupIndex(index);
  };

  const closePopup = () => setPopupImages([]);
  const nextImage = () => setCurrentPopupIndex((prev) => (prev + 1) % popupImages.length);
  const prevImage = () => setCurrentPopupIndex((prev) => (prev - 1 + popupImages.length) % popupImages.length);

  return (
    <>
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchComplaintFeedback },
            header: {
              title: "Canpaign",
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
                              className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
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
                // <SidebarBtn
                //   key="add"
                //   href="/merchandiser/complaintFeedback/add"
                //   leadingIcon="lucide:plus"
                //   label="Add Feedback"
                //   labelTw="hidden lg:block"
                //   isActive
                // />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "code", label: "Complaint Code" },
            //   { key: "merchandiser_id", label: "Merchandiser" },
            //   { key: "customer_id", label: "Customer" },

             { key: "merchendiser", label: "Merchendiser", render: (row) => typeof row.merchendiser === "object" &&
            row.merchendiser !== null &&
            "name" in row.merchendiser
                ? (row.merchendiser as { name?: string })
                      ?.name || "-"
                : "-", },
             { key: "customer", label: "Customer", render: (row) => typeof row.customer === "object" &&
            row.customer !== null &&
            "owner_name" in row.customer
                ? (row.customer as { owner_name?: string })
                      ?.owner_name || "-"
                : "-", },
            //   { key: "customer_id", label: "Customer" },
              { key: "feedback", label: "FeedBack" },
//              {
//   key: "images",
//   label: "Images",
//   render: (row: FeedbackItem) => {
//     const BASE_URL = "http://localhost:8000"; // <-- replace with your backend URL

//     // Build full image URLs
//     const images = row.images
//       ? [
//           row.images.image_1 ? `${BASE_URL}${row.images.image_1}` : null,
//           row.images.image_2 ? `${BASE_URL}${row.images.image_2}` : null,
//           row.images.image_3 ? `${BASE_URL}${row.images.image_3}` : null,
//         ].filter(Boolean)
//       : [];

//     return images.length > 0 ? (
//       <button
//         className="text-blue-600 underline hover:text-blue-800"
//         onClick={() => openImagePopup(images, 0)}
//       >
//         View Image
//       </button>
//     ) : (
//       "-"
//     );
//   },
// }



            
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/merchandiser/complaintFeedback/view/${data.uuid}`);
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (data: TableDataType) => {
                  setDeleteSelectedRow(data.uuid);
                  setShowDeletePopup(true);
                },
              },
            ],
            pageSize: 10,
          }}
        />
      </div>

      {/* Image Popup */}
      {popupImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={closePopup}
        >
          <div className="relative">
            <img
              src={popupImages[currentPopupIndex]}
              alt="Popup"
              className="max-h-[80vh] max-w-[80vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {popupImages.length > 1 && (
              <>
                <button
                  className="absolute left-[-40px] top-1/2 transform -translate-y-1/2 text-white text-2xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  &#8249;
                </button>
                <button
                  className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 text-white text-2xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  &#8250;
                </button>
              </>
            )}
          </div>
        </div>
      )}

      
    </>
  );
}
