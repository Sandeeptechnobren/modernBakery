// "use client";

// import { useState, useEffect } from "react";
// import { Icon } from "@iconify-icon/react";

// import BorderIconButton from "@/app/components/borderIconButton";
// import CustomDropdown from "@/app/components/customDropdown";
// import Table from "@/app/components/customTable";
// import SidebarBtn from "@/app/components/dashboardSidebarBtn";
// import {
//     countryList,
// } from "@/app/services/allApi";
// import Loading from "@/app/components/Loading";
// import DismissibleDropdown from "@/app/components/dismissibleDropdown";



// interface DropdownItem {
//     icon: string;
//     label: string;
//     iconWidth: number;
// }


// const dropdownDataList: DropdownItem[] = [
//     { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
//     { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
//     { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
//     { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
//     { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
// ];

// const columns = [
//   { key: "country_code", label: "Country Code" },
//   { key: "country_name", label: "Country Name" },
//   { key: "currency", label: "Currency" },
// ]

// export default function Country() {
//     const [countries, setCountries] = useState<[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [showDropdown, setShowDropdown] = useState<boolean>(false);

//     useEffect(() => {
//         const fetchCountries = async () => {
//             try {
//                 const listRes = await countryList({}); 
//                 setCountries(listRes.data);
//             } catch (error: unknown) {
//                 if (error instanceof Error) {
//                     console.error("API Error:", error.message);
//                 } else {
//                     console.error("Unexpected error:", error);
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchCountries();
//     }, []);

//     return loading ? <Loading /> : (
//         <>
//             <div className="flex justify-between items-center mb-[20px]">
//                 <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
//                     Country
//                 </h1>

//                 <div className="flex gap-[12px] relative">
//                     <BorderIconButton
//                         icon="gala:file-document"
//                         label="Export CSV"
//                     />
//                     <BorderIconButton icon="mage:upload" />

//                     <DismissibleDropdown
//                         isOpen={showDropdown}
//                         setIsOpen={setShowDropdown}
//                         button={
//                           <BorderIconButton
//                               icon="ic:sharp-more-vert"
//                           />
//                         }
//                         dropdown={
//                           <div className="absolute top-[40px] right-0 z-30 w-[226px]">
//                             <CustomDropdown>
//                                 {dropdownDataList.map((link, idx) => (
//                                     <div
//                                         key={idx}
//                                         className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
//                                     >
//                                         <Icon
//                                             icon={link.icon}
//                                             width={link.iconWidth}
//                                             className="text-[#717680]"
//                                         />
//                                         <span className="text-[#181D27] font-[500] text-[16px]">
//                                             {link.label}
//                                         </span>
//                                     </div>
//                                 ))}
//                             </CustomDropdown>
//                         </div>
//                         }
//                     />
//                 </div>
//             </div>

//             <div className="h-[calc(100%-60px)]">
//                 <Table
//                     data={countries}
//                     config={{
//                         header: {
//                             searchBar: true,
//                             columnFilter: true,
//                             actions: [
//                                 <SidebarBtn
//                                     key={0}
//                                     href="/dashboard/settings/country/add"
//                                     isActive
//                                     leadingIcon="lucide:plus"
//                                     label="Add Country"
//                                     labelTw="hidden sm:block"
//                                 />,
//                             ],
//                         },
//                         footer: { nextPrevBtn: true, pagination: true },
//                         columns,
//                         rowSelection: true,
//                         rowActions: [
//                             { icon: "lucide:eye" },
//                             { icon: "lucide:edit-2", onClick: console.log },
//                             {
//                                 icon: "lucide:more-vertical",
//                                 onClick: () =>
//                                     confirm(
//                                         "Are you sure you want to delete this Country?"
//                                     ),
//                             },
//                         ],
//                         pageSize: 10,
//                     }}
//                 />
//             </div>
//         </>
//     );
// }


// "use client";

// import { useState, useEffect } from "react";
// import { Icon } from "@iconify-icon/react";
// import { useRouter } from "next/navigation"; // ✅ import router

// import BorderIconButton from "@/app/components/borderIconButton";
// import CustomDropdown from "@/app/components/customDropdown";
// import Table from "@/app/components/customTable";
// import SidebarBtn from "@/app/components/dashboardSidebarBtn";
// import { countryList } from "@/app/services/allApi";
// import Loading from "@/app/components/Loading";
// import DismissibleDropdown from "@/app/components/dismissibleDropdown";

// interface DropdownItem {
//   icon: string;
//   label: string;
//   iconWidth: number;
// }

// const dropdownDataList: DropdownItem[] = [
//   { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
//   { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
//   { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
//   { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
//   { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
// ];

// const columns = [
//   { key: "country_code", label: "Country Code" },
//   { key: "country_name", label: "Country Name" },
//   { key: "currency", label: "Currency" },
// ];

// export default function Country() {
//   const [countries, setCountries] = useState<[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [showDropdown, setShowDropdown] = useState<boolean>(false);

//   const router = useRouter(); // ✅ init router

//   useEffect(() => {
//     const fetchCountries = async () => {
//       try {
//         const listRes = await countryList({});
//         setCountries(listRes.data);
//       } catch (error: unknown) {
//         if (error instanceof Error) {
//           console.error("API Error:", error.message);
//         } else {
//           console.error("Unexpected error:", error);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCountries();
//   }, []);

//   return loading ? (
//     <Loading />
//   ) : (
//     <>
//       <div className="flex justify-between items-center mb-[20px]">
//         <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
//           Country
//         </h1>

//         <div className="flex gap-[12px] relative">
//           <BorderIconButton icon="gala:file-document" label="Export CSV" />
//           <BorderIconButton icon="mage:upload" />

//           <DismissibleDropdown
//             isOpen={showDropdown}
//             setIsOpen={setShowDropdown}
//             button={<BorderIconButton icon="ic:sharp-more-vert" />}
//             dropdown={
//               <div className="absolute top-[40px] right-0 z-30 w-[226px]">
//                 <CustomDropdown>
//                   {dropdownDataList.map((link, idx) => (
//                     <div
//                       key={idx}
//                       className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
//                     >
//                       <Icon
//                         icon={link.icon}
//                         width={link.iconWidth}
//                         className="text-[#717680]"
//                       />
//                       <span className="text-[#181D27] font-[500] text-[16px]">
//                         {link.label}
//                       </span>
//                     </div>
//                   ))}
//                 </CustomDropdown>
//               </div>
//             }
//           />
//         </div>
//       </div>

//       <div className="h-[calc(100%-60px)]">
//         <Table
//           data={countries}
//           config={{
//             header: {
//               searchBar: true,
//               columnFilter: true,
//               actions: [
//                 <SidebarBtn
//                   key={0}
//                   href="/dashboard/settings/country/add"
//                   isActive
//                   leadingIcon="lucide:plus"
//                   label="Add Country"
//                   labelTw="hidden sm:block"
//                 />,
//               ],
//             },
//             footer: { nextPrevBtn: true, pagination: true },
//             columns,
//             rowSelection: true,
//             rowActions: [
//               { icon: "lucide:eye" },
//               {
//                 icon: "lucide:edit-2",
//                 onClick: (row: any) =>
//                   router.push("/dashboard/settings/country/add"), // ✅ redirect
//               },
//               {
//                 icon: "lucide:more-vertical",
//                 onClick: () =>
//                   confirm("Are you sure you want to delete this Country?"),
//               },
//             ],
//             pageSize: 10,
//           }}
//         />
//       </div>
//     </>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { countryList, deleteCountry } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext"; // ✅ import snackbar

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

const dropdownDataList: DropdownItem[] = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "country_code", label: "Country Code" },
  { key: "country_name", label: "Country Name" },
  { key: "currency", label: "Currency" },
];

export default function Country() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const router = useRouter();
  const { showSnackbar } = useSnackbar(); // ✅ snackbar hook

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const listRes = await countryList({});
        setCountries(listRes.data);
      } catch (error: unknown) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

    try {
      await deleteCountry(selectedRow.id); // call API
      
      showSnackbar("Country deleted successfully ", "success"); 
      router.refresh();
    } catch (error) {
      console.error("Delete failed ❌:", error);
      showSnackbar("Failed to delete country ❌", "error"); 
    } finally {
      setShowDeletePopup(false);
      setSelectedRow(null);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <>
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
          Country
        </h1>

        <div className="flex gap-[12px] relative">
          <BorderIconButton icon="gala:file-document" label="Export CSV" />
          <BorderIconButton icon="mage:upload" />

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
                      <Icon
                        icon={link.icon}
                        width={link.iconWidth}
                        className="text-[#717680]"
                      />
                      <span className="text-[#181D27] font-[500] text-[16px]">
                        {link.label}
                      </span>
                    </div>
                  ))}
                </CustomDropdown>
              </div>
            }
          />
        </div>
      </div>

      <div className="h-[calc(100%-60px)]">
        <Table
          data={countries}
          config={{
            header: {
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/dashboard/settings/country/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Country"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              { icon: "lucide:eye" },
              {
                icon: "lucide:edit-2",
                onClick: (row: any) =>
                  router.push(
                    `/dashboard/settings/country/update_country/${row.id}`
                  ),
              },
              {
                icon: "lucide:more-vertical",
                onClick: (row: any) => {
                  setSelectedRow(row);
                  setShowDeletePopup(true);
                },
              },
            ],
            pageSize: 10,
          }}
        />
      </div>

      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Country"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
