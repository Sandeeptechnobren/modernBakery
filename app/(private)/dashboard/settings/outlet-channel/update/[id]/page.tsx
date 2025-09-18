// "use client";

// import { Icon } from "@iconify-icon/react";
// import Link from "next/link";
// import { useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { Formik, Form, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import InputFields from "@/app/components/inputFields";
// import SidebarBtn from "@/app/components/dashboardSidebarBtn";
// import IconButton from "@/app/components/iconButton";
// import SettingPopUp from "@/app/components/settingPopUp";
// import { useSnackbar } from "@/app/services/snackbarContext";
// import { updateChannel } from "@/app/services/allApi";

// // ✅ Yup Schema
// const ChannelSchema = Yup.object().shape({
//   outlet_channel: Yup.string().required("Channel Code is required."),
// });

// export default function EditChannel() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const { showSnackbar } = useSnackbar();

//   // ✅ Get query params
//   const queryId = searchParams.get("id") || "";
//   const queryName = searchParams.get("outlet_channel") || "";

//   const [isOpen, setIsOpen] = useState(false);

//   type OutletChannel = {
//     outlet_channel: string;
//   };

//   // ✅ Pre-filled initial values
//   const initialValues: OutletChannel = {
//     outlet_channel: queryName,
//   };

//   // ✅ Submit handler
//   const handleSubmit = async (values: OutletChannel) => {
//     if (!queryId) return;

//     try {
//       // ⚡ Adjust this based on your allApi.ts function signature
//      await updateChannel(queryId, { ...values, status: 1 });

//       showSnackbar("Channel updated successfully ✅", "success");
//       router.push("/dashboard/settings/outlet-channel");
//     } catch (error) {
//       console.error("Failed to edit channel:", error);
//       showSnackbar("Failed to update channel ❌", "error");
//     }
//   };

//   return (
//     <div className="w-full h-full overflow-x-hidden p-4">
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-4">
//           <Link href="/dashboard/settings/outlet-channel">
//             <Icon icon="lucide:arrow-left" width={24} />
//           </Link>
//           <h1 className="text-xl font-semibold text-gray-900">Edit Channel</h1>
//         </div>
//       </div>

//       <Formik
//         initialValues={initialValues}
//         validationSchema={ChannelSchema}
//         enableReinitialize
//         onSubmit={handleSubmit}
//       >
//         {({ handleSubmit, values, setFieldValue }) => (
//           <Form onSubmit={handleSubmit}>
//             <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
//               <div className="p-6">
//                 <h2 className="text-lg font-medium text-gray-800 mb-4">
//                   Channel Details
//                 </h2>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="flex items-end gap-2 max-w-[406px]">
//                     <div className="w-full">
//                       <InputFields
//                         label="Channel Code"
//                         value={values.outlet_channel}
//                         onChange={(e) =>
//                           setFieldValue("outlet_channel", e.target.value)
//                         }
//                       />
//                       <ErrorMessage
//                         name="outlet_channel"
//                         component="span"
//                         className="text-xs text-red-500"
//                       />
//                     </div>

//                     <IconButton
//                       bgClass="white"
//                       className="mb-2 cursor-pointer text-[#252B37]"
//                       icon="mi:settings"
//                       onClick={() => setIsOpen(true)}
//                     />

//                     <SettingPopUp
//                       isOpen={isOpen}
//                       onClose={() => setIsOpen(false)}
//                       title="Channel Code"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end gap-4 mt-6 pr-0">
//               <button
//                 type="reset"
//                 className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
//               >
//                 Cancel
//               </button>

//               <SidebarBtn
//                 label="Update"
//                 isActive={true}
//                 leadingIcon="mdi:check"
//                 type="submit"
//               />
//             </div>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   );
// }


import React from 'react'

function page() {
  return (
    <div>page</div>
  )
}

export default page